param([Parameter(Mandatory=$true)][string]$RuntimeDirectory,[switch]$StageOnly)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$version=(Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json).version
$zip=Join-Path (Split-Path $root -Parent) "sto-shakedown-v$version-electron-windows-x64.zip"
if(Test-Path -LiteralPath $zip){throw "A package already exists for $version. Increment the version before creating another download."}
$stage=Join-Path $root ('build\desktop-'+[guid]::NewGuid().ToString()+'\STO-Shakedown-'+$version)
New-Item -ItemType Directory -Force -Path $stage | Out-Null
$electron=Join-Path $root 'node_modules\electron\dist'
if (-not (Test-Path (Join-Path $electron 'electron.exe'))) { throw 'Install the pinned Electron runtime first.' }
Copy-Item -Path (Join-Path $electron '*') -Destination $stage -Recurse
Rename-Item -LiteralPath (Join-Path $stage 'electron.exe') -NewName 'Shakedown.exe'
& (Join-Path $PSScriptRoot 'Set-ExecutableIcon.ps1') -Executable (Join-Path $stage 'Shakedown.exe') -Icon (Join-Path $root 'launcher/shakedown.ico')
$appRoot=Join-Path $stage 'resources\app'
New-Item -ItemType Directory -Force -Path $appRoot | Out-Null
foreach($name in @('lib','public','launcher','docs','test','server.mjs','package.json','START-HERE.txt','COPYRIGHT.md')) {
 Copy-Item -LiteralPath (Join-Path $root $name) -Destination $appRoot -Recurse
}
Copy-Item -LiteralPath $RuntimeDirectory -Destination (Join-Path $appRoot 'runtime') -Recurse
Copy-Item -LiteralPath (Join-Path $root 'docs\ELECTRON-TESTING.md') -Destination (Join-Path $stage 'READ-ME-FIRST.md')
$zip=Join-Path (Split-Path $root -Parent) "sto-shakedown-v$version-electron-windows-x64.zip"
if(-not $StageOnly){Compress-Archive -LiteralPath $stage -DestinationPath $zip}
Write-Output "Desktop directory: $stage"
Write-Output "Desktop ZIP: $zip"
