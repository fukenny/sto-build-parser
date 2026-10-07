# Loaded by Capture.ps1 only after its executable fingerprint check.
# Item layout: ID +0, definition +8, AlgoItemProps +24. Match both ID and definition.
function Add-ItemDetails($records) {
 $wanted=@{}
 $observedAt=[DateTime]::UtcNow.ToString('o')
 foreach($record in $records){foreach($item in $record.items){
  if($item.itemId -ne '0' -and $item.definition){$wanted[$item.itemId]=$item.definition}
 }}
 if(!$wanted.Count){return}
 $found=@{};$limited=@{}
 $lookup=[StoProbe]::FindReferences($client.Id,[UInt64[]]@($wanted.Keys),30,8589934592)
 if($lookup.StopReason -eq 'address-space-end'){
  foreach($group in ($lookup.References | Group-Object Target)){
   if($group.Count -ge 2048){$limited[[Convert]::ToUInt64($group.Name.Substring(2),16).ToString()]=$true}
  }
  foreach($hit in $lookup.References){try{
   $a=[Convert]::ToUInt64($hit.Address.Substring(2),16);$b=Bytes $a 80
   $id=[BitConverter]::ToUInt64($b,0).ToString();if(!$wanted.ContainsKey($id)){continue}
   $d=Bytes ([BitConverter]::ToUInt64($b,8)) 48
   if((Text ([BitConverter]::ToUInt64($d,0))) -cne $wanted[$id]){continue}
   $p=[BitConverter]::ToUInt64($b,24);if(!$p){continue};$props=Bytes $p 56
   $quality=[int]$props[0];$mark=[BitConverter]::ToUInt32($props,32)
   if($quality -gt 10 -or $mark -gt 100){continue}
   $powers=@(foreach($address in (ArrayPointers ([BitConverter]::ToUInt64($props,8)))){
    $power=Bytes $address 56;$definition=Text (Ptr ([BitConverter]::ToUInt64($power,8)))
    if($definition -notmatch '^[A-Za-z0-9_]+$'){throw 'Unresolved modifier record'}
    $definition
   })
   # Reject reused records or properties changed during the read.
   if([Convert]::ToBase64String([byte[]](Bytes $a 32)) -cne [Convert]::ToBase64String([byte[]]$b[0..31])){continue}
   if([Convert]::ToBase64String([byte[]](Bytes $p 56)) -cne [Convert]::ToBase64String([byte[]]$props)){continue}
   $value=[pscustomobject]@{qualityCode=$quality;progressionLevel=$mark;modifierDefinitions=@($powers | Sort-Object)}
   if(!$found.ContainsKey($id)){$found[$id]=@{}}
   $found[$id][($value | ConvertTo-Json -Depth 4 -Compress)]=$value
  }catch{}}
 }
 foreach($record in $records){foreach($item in $record.items){
  if($item.itemId -eq '0'){continue}
  $status='unavailable';$value=$null
  if($lookup.StopReason -ne 'address-space-end' -or $limited.ContainsKey($item.itemId)){$status='incomplete-scan'}
  elseif($found.ContainsKey($item.itemId)){
   if($found[$item.itemId].Count -eq 1){$status='matched';$value=@($found[$item.itemId].Values)[0]}
   else{$status='conflicting-records'}
  }
  $item | Add-Member -NotePropertyName itemDetails -NotePropertyValue ([pscustomobject]@{status=$status;observedAt=$observedAt;values=$value})
 }}
}
