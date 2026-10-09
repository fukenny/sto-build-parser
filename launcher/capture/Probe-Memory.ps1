param(
    [int]$TargetProcessId = 0,
    [string[]]$Needles = @(),
    [ValidateRange(1,300)][int]$Seconds = 45,
    [ValidateRange(1,68719476736)][long]$MaxBytes = 4294967296,
    [switch]$LibraryOnly
)
$ErrorActionPreference = 'Stop'
if (-not [Environment]::Is64BitProcess) { throw 'Run this script in 64-bit PowerShell.' }
if ($TargetProcessId -eq 0) {
    $clients = @(Get-Process -Name GameClient)
    if ($clients.Count -ne 1) { throw 'Specify TargetProcessId when multiple clients are running.' }
    $TargetProcessId = $clients[0].Id
}
$client = Get-Process -Id $TargetProcessId
if ($client.ProcessName -ne 'GameClient') { throw 'This probe only targets GameClient.' }
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
public static class StoProbe {
    [StructLayout(LayoutKind.Sequential)] struct MBI {
        public ulong BaseAddress, AllocationBase;
        public uint AllocationProtect;
        public ushort PartitionId;
        public ulong RegionSize;
        public uint State, Protect, Type;
    }
    [DllImport("kernel32.dll", SetLastError=true)] static extern IntPtr OpenProcess(uint access, bool inherit, int pid);
    [DllImport("kernel32.dll", SetLastError=true)] static extern bool ReadProcessMemory(IntPtr h, IntPtr address, byte[] buffer, UIntPtr size, out UIntPtr read);
    [DllImport("kernel32.dll", SetLastError=true)] static extern UIntPtr VirtualQueryEx(IntPtr h, IntPtr address, out MBI info, UIntPtr length);
    [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr h);
    public sealed class Hit { public string Text, Encoding, Address; public uint RegionType; }
    public sealed class Report {
        public int ProcessId; public long BytesRead; public int ReadFailures;
        public string StopReason; public double ElapsedSeconds;
        public bool CandidateLimitReached;
        public List<Hit> Candidates = new List<Hit>();
    }
    public static byte[] Read(int pid, ulong address, int length) {
        if(length < 1 || length > 65536) throw new ArgumentOutOfRangeException("length");
        IntPtr h=OpenProcess(0x410,false,pid);
        if(h==IntPtr.Zero) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
        try {
            byte[] data=new byte[length]; UIntPtr actual;
            if(!ReadProcessMemory(h,(IntPtr)(long)address,data,(UIntPtr)length,out actual))
                throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
            Array.Resize(ref data,(int)actual.ToUInt64()); return data;
        } finally { CloseHandle(h); }
    }
    public sealed class Reference { public string Address, Target; }
    public sealed class ReferenceReport {
        public long BytesRead; public int ReadFailures; public double ElapsedSeconds;
        public string StopReason="address-space-end";
        public List<Reference> References=new List<Reference>();
    }
    public static ReferenceReport FindReferences(int pid, ulong[] targets, int seconds, long maxBytes) {
        var lookup=new HashSet<ulong>(targets); var counts=new Dictionary<ulong,int>();
        var r=new ReferenceReport(); var timer=Stopwatch.StartNew();
        IntPtr h=OpenProcess(0x410,false,pid);
        if(h==IntPtr.Zero) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
        byte[] buffer=new byte[1048576];
        try {
            ulong address=0;
            while(address<0x00007FFFFFFF0000UL) {
                if(timer.Elapsed.TotalSeconds>=seconds) { r.StopReason="time-limit"; break; }
                if(r.BytesRead>=maxBytes) { r.StopReason="byte-limit"; break; }
                MBI mbi;
                if(VirtualQueryEx(h,(IntPtr)(long)address,out mbi,(UIntPtr)Marshal.SizeOf(typeof(MBI)))==UIntPtr.Zero) break;
                ulong end=mbi.BaseAddress+mbi.RegionSize;
                if(end<=address) break;
                uint access=mbi.Protect & 0xff;
                bool readable=access==2 || access==4 || access==8 || access==0x20 || access==0x40 || access==0x80;
                if(mbi.State==0x1000 && (mbi.Protect & 0x100)==0 && readable) {
                    for(ulong cursor=mbi.BaseAddress;cursor<end;) {
                        if(timer.Elapsed.TotalSeconds>=seconds || r.BytesRead>=maxBytes) break;
                        int length=(int)Math.Min((ulong)buffer.Length,end-cursor);
                        length=(int)Math.Min(length,maxBytes-r.BytesRead);
                        UIntPtr actual;
                        if(!ReadProcessMemory(h,(IntPtr)(long)cursor,buffer,(UIntPtr)length,out actual)) r.ReadFailures++;
                        int n=(int)actual.ToUInt64(); r.BytesRead+=n;
                        for(int i=0;i+8<=n;i+=8) {
                            ulong value=BitConverter.ToUInt64(buffer,i);
                            if(!lookup.Contains(value)) continue;
                            int count; counts.TryGetValue(value,out count);
                            if(count>=2048) continue;
                            counts[value]=count+1;
                            r.References.Add(new Reference {Address="0x"+(cursor+(ulong)i).ToString("X"),Target="0x"+value.ToString("X")});
                        }
                        cursor+=(ulong)length;
                    }
                }
                address=end;
            }
        } finally { CloseHandle(h); }
        r.ElapsedSeconds=timer.Elapsed.TotalSeconds; return r;
    }
    public static Report Run(int pid, string[] needles, int seconds, long maxBytes) {
        // PROCESS_QUERY_INFORMATION | PROCESS_VM_READ. No write or injection rights.
        IntPtr h = OpenProcess(0x410, false, pid);
        if (h == IntPtr.Zero) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
        var r = new Report { ProcessId=pid, StopReason="address-space-end" };
        var patterns = new List<byte[]>(); var labels = new List<string>(); var encodings = new List<string>();
        foreach (string s in needles) {
            if (String.IsNullOrEmpty(s)) throw new ArgumentException("Empty search text");
            patterns.Add(Encoding.UTF8.GetBytes(s)); labels.Add(s); encodings.Add("UTF-8");
            patterns.Add(Encoding.Unicode.GetBytes(s)); labels.Add(s); encodings.Add("UTF-16LE");
        }
        int overlap=0; foreach(var p in patterns) overlap=Math.Max(overlap,p.Length-1);
        if (overlap >= 1048576) throw new ArgumentException("Search text too long");
        byte[] buffer=new byte[1048576]; int[] counts=new int[patterns.Count];
        var seen = new HashSet<string>(); var timer=Stopwatch.StartNew();
        try {
            ulong address=0;
            while(address < 0x00007FFFFFFF0000UL) {
                if(timer.Elapsed.TotalSeconds >= seconds) { r.StopReason="time-limit"; break; }
                if(r.BytesRead >= maxBytes) { r.StopReason="byte-limit"; break; }
                MBI mbi;
                if(VirtualQueryEx(h,(IntPtr)(long)address,out mbi,(UIntPtr)Marshal.SizeOf(typeof(MBI))) == UIntPtr.Zero) break;
                ulong end=mbi.BaseAddress+mbi.RegionSize;
                if(end<=address) break;
                uint access=mbi.Protect & 0xff;
                bool readable=access==2 || access==4 || access==8 || access==0x20 || access==0x40 || access==0x80;
                if(mbi.State==0x1000 && (mbi.Protect & 0x100)==0 && readable) {
                    for(ulong cursor=mbi.BaseAddress;cursor<end;) {
                        if(timer.Elapsed.TotalSeconds>=seconds || r.BytesRead>=maxBytes) break;
                        int length=(int)Math.Min((ulong)buffer.Length,end-cursor);
                        length=(int)Math.Min(length,maxBytes-r.BytesRead);
                        UIntPtr actual;
                        bool ok=ReadProcessMemory(h,(IntPtr)(long)cursor,buffer,(UIntPtr)length,out actual);
                        int n=(int)actual.ToUInt64(); r.BytesRead+=n;
                        if(!ok) r.ReadFailures++;
                        for(int k=0;k<patterns.Count;k++) {
                            if(counts[k]>=8192) continue;
                            byte[] p=patterns[k]; int pos=0;
                            while(pos<=n-p.Length) {
                                pos=Array.IndexOf(buffer,p[0],pos,n-p.Length-pos+1);
                                if(pos<0) break;
                                int j=1; for(;j<p.Length && buffer[pos+j]==p[j];j++) {}
                                if(j==p.Length) {
                                    string hex="0x"+(cursor+(ulong)pos).ToString("X");
                                    if(seen.Add(k+":"+hex)) {
                                        r.Candidates.Add(new Hit {Text=labels[k],Encoding=encodings[k],Address=hex,RegionType=mbi.Type});
                                        if(++counts[k]>=8192) { r.CandidateLimitReached=true; break; }
                                    }
                                }
                                pos++;
                            }
                        }
                        cursor+=(ulong)(length>overlap ? length-overlap : length);
                    }
                }
                address=end;
            }
        } finally { CloseHandle(h); }
        r.ElapsedSeconds=timer.Elapsed.TotalSeconds; return r;
    }
}
'@
if ($LibraryOnly) { return }
$report = [StoProbe]::Run($TargetProcessId, $Needles, $Seconds, $MaxBytes)
$output = [ordered]@{
    TimestampUtc = [DateTime]::UtcNow.ToString('o')
    Executable = $client.Path
    ExecutableSha256 = (Get-FileHash -LiteralPath $client.Path -Algorithm SHA256).Hash
    Status = 'Exploratory string candidates only; equipment relationships not verified'
    Scan = $report
}
$directory = Join-Path $PSScriptRoot 'artifacts'
New-Item -ItemType Directory -Path $directory -Force | Out-Null
$file = Join-Path $directory ('probe-' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss') + '.json')
$output | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $file
$output | ConvertTo-Json -Depth 8
Write-Host "Saved report: $file"
