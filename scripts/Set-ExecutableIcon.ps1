param([Parameter(Mandatory=$true)][string]$Executable,[Parameter(Mandatory=$true)][string]$Icon)
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class ShakedownIconResource {
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] public static extern IntPtr BeginUpdateResource(string path,bool delete);
 [DllImport("kernel32.dll",SetLastError=true)] public static extern bool UpdateResource(IntPtr handle,IntPtr type,IntPtr name,ushort language,byte[] data,uint length);
 [DllImport("kernel32.dll",SetLastError=true)] public static extern bool EndUpdateResource(IntPtr handle,bool discard);
}
"@
$iconBytes=[IO.File]::ReadAllBytes($Icon)
$count=[BitConverter]::ToUInt16($iconBytes,4)
$groupStream=[IO.MemoryStream]::new()
$writer=[IO.BinaryWriter]::new($groupStream)
$writer.Write([uint16]0);$writer.Write([uint16]1);$writer.Write([uint16]$count)
$handle=[ShakedownIconResource]::BeginUpdateResource($Executable,$false)
if($handle -eq [IntPtr]::Zero){throw 'Cannot open EXE icon resources.'}
try {
 for($index=0;$index -lt $count;$index++) {
  $entry=6+16*$index
  $length=[BitConverter]::ToUInt32($iconBytes,$entry+8)
  $offset=[BitConverter]::ToUInt32($iconBytes,$entry+12)
  $payload=[byte[]]::new($length);[Array]::Copy($iconBytes,$offset,$payload,0,$length)
  $resourceId=1+$index
  if(-not [ShakedownIconResource]::UpdateResource($handle,[IntPtr]3,[IntPtr]$resourceId,1033,$payload,$length)){throw 'Cannot update icon image.'}
  $writer.Write($iconBytes,$entry,12);$writer.Write([uint16]$resourceId)
 }
 $writer.Flush();$group=$groupStream.ToArray()
 # Electron's Windows app icon group is ID 1.
 if(-not [ShakedownIconResource]::UpdateResource($handle,[IntPtr]14,[IntPtr]1,1033,$group,$group.Length)){throw 'Cannot update icon group.'}
 if(-not [ShakedownIconResource]::EndUpdateResource($handle,$false)){throw 'Cannot save icon resources.'}
 $handle=[IntPtr]::Zero
} finally {
 if($handle -ne [IntPtr]::Zero){[void][ShakedownIconResource]::EndUpdateResource($handle,$true)}
 $writer.Dispose();$groupStream.Dispose()
}
