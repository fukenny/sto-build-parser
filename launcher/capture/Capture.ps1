param([Parameter(Mandatory=$true)][string]$CharacterName,[Parameter(Mandatory=$true)][string]$LoadoutName)
$ErrorActionPreference='Stop'
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
. "$PSScriptRoot/Probe-Memory.ps1" -LibraryOnly
$stream=[IO.File]::OpenRead($client.Path)
$sha=[Security.Cryptography.SHA256]::Create()
try{$hash=[BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','')}finally{$stream.Dispose();$sha.Dispose()}
if($hash -ne '7FF876418B84891A171E246D70B22CADED96D4BBCC684AF27A67B3C2779ACD9D'){throw 'This STO client version is not supported by the experimental reader. No capture was imported.'}
function Bytes([UInt64]$a,[int]$n){[StoProbe]::Read($client.Id,$a,$n)}
function Ptr([UInt64]$a){[BitConverter]::ToUInt64((Bytes $a 8),0)}
function Text([UInt64]$a){if(!$a){return ''};[Text.Encoding]::UTF8.GetString((Bytes $a 256)).Split([char]0)[0]}
function ArrayPointers([UInt64]$a){if(!$a){return};$n=[BitConverter]::ToInt32((Bytes ($a-16) 4),0);if($n -lt 0 -or $n -gt 256){throw 'Invalid capture array'};if($n){$b=Bytes $a ($n*8);for($i=0;$i -lt $n;$i++){[BitConverter]::ToUInt64($b,$i*8)}}}
$scan=[StoProbe]::Run($client.Id,@(($CharacterName+[char]0),($LoadoutName+[char]0)),30,8589934592)
if($scan.StopReason -ne 'address-space-end'){throw 'Capture scan reached its limit. Try again with the loadout panel open.'}
$ships=@();$names=@()
foreach($hit in $scan.Candidates){if($hit.Encoding -ne 'UTF-8'){continue};try{
 $a=[Convert]::ToUInt64($hit.Address.Substring(2),16);$name=Text $a
 if($name -ceq $LoadoutName){$names+=$a}
 if($name -ceq $CharacterName){$p=Ptr ($a-20+320);if(!$p){continue};$b=Bytes $p 168;$id=[BitConverter]::ToUInt32($b,4);$type=[BitConverter]::ToUInt32($b,8);$ship=Text ([BitConverter]::ToUInt64($b,32));if($id -gt 0 -and $type -eq 21 -and $ship -and $ship.Length -lt 200){$ships+=[pscustomobject]@{id=[string]$id;name=$ship;swapTime=[BitConverter]::ToUInt32($b,96)}}}
}catch{}}
$ships=@($ships | Sort-Object id,name -Unique)
if(!$ships.Count){throw 'No current ship reference found for that character. Enter space and check the character name.'}
if(!$names.Count){throw 'Saved loadout name not found. Open its Loadouts panel and check the exact name.'}
$refs=[StoProbe]::FindReferences($client.Id,[UInt64[]]$names,30,8589934592)
if($refs.StopReason -ne 'address-space-end'){throw 'Loadout lookup reached its limit; no complete capture available.'}
$records=@(foreach($ref in $refs.References){try{
 $a=[Convert]::ToUInt64($ref.Address.Substring(2),16);$b=Bytes $a 144;if((Text ([BitConverter]::ToUInt64($b,0))) -cne $LoadoutName){continue}
 $items=@(foreach($offset in @(8,16)){foreach($ip in (ArrayPointers ([BitConverter]::ToUInt64($b,$offset)))){
  $v=Bytes $ip 48;$id=[BitConverter]::ToUInt64($v,8);$bag=[BitConverter]::ToInt32($v,16);$slot=[BitConverter]::ToInt32($v,20)
  if($bag -lt 0 -or $bag -gt 1000 -or $slot -lt 0 -or $slot -gt 1000){throw 'Invalid item'}
  $definition='';$display='';try{$d=Bytes ([BitConverter]::ToUInt64($v,0)) 48;$definition=Text ([BitConverter]::ToUInt64($d,0));$m=[BitConverter]::ToUInt64($d,24);if($m){$display=Text (Ptr ($m+32))}}catch{}
  [pscustomobject]@{itemId=[string]$id;bag=$bag;slot=$slot;ownerItem=($offset -eq 16);name=$display;definition=$definition}
 }})
 if($items.Count -gt 0 -and $items.Count -le 256 -and @($items | Where-Object bag -eq 53).Count){[pscustomobject]@{name=$LoadoutName;lastSave=[BitConverter]::ToUInt32($b,140);items=$items}}
}catch{}})
if(!$records.Count){throw 'No populated ship loadout found. Save the loadout in STO, then try again.'}
[pscustomobject]@{schemaVersion=1;capturedAt=[DateTime]::UtcNow.ToString('o');character=$CharacterName;executableHash=$hash;ships=$ships;records=@($records | Sort-Object lastSave -Descending);warning='Experimental memory capture. Older copies can remain. Ship/loadout ownership is not automatically verified. Confirm the ship and equipment before importing. Marks, modifiers, traits and officers are not captured.'} | ConvertTo-Json -Depth 8 -Compress
