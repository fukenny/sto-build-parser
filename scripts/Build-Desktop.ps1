param([Parameter(Mandatory=$true)][string]$RuntimeDirectory)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot -Parent
$version=(Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json).version
$stage=Join-Path $root ('build\desktop-'+[guid]::NewGuid().ToString()+'\STO-Shakedown-'+$version)
New-Item -ItemType Directory -Force -Path $stage | Out-Null
$electron=Join-Path $root 'node_modules\electron\dist'
if (-not (Test-Path (Join-Path $electron 'electron.exe'))) { throw 'Install the pinned Electron runtime first.' }
Copy-Item -Path (Join-Path $electron '*') -Destination $stage -Recurse
Rename-Item -LiteralPath (Join-Path $stage 'electron.exe') -NewName 'Shakedown.exe'
$appRoot=Join-Path $stage 'resources\app'
New-Item -ItemType Directory -Force -Path $appRoot | Out-Null
foreach($name in @('lib','public','launcher','docs','test','server.mjs','package.json','START-HERE.txt','COPYRIGHT.md')) {
 Copy-Item -LiteralPath (Join-Path $root $name) -Destination $appRoot -Recurse
}
Copy-Item -LiteralPath $RuntimeDirectory -Destination (Join-Path $appRoot 'runtime') -Recurse
Copy-Item -LiteralPath (Join-Path $root 'docs\ELECTRON-TESTING.md') -Destination (Join-Path $stage 'READ-ME-FIRST.md')
$zip=Join-Path (Split-Path $root -Parent) "sto-shakedown-v$version-electron-windows-x64.zip"
Compress-Archive -LiteralPath $stage -DestinationPath $zip -Force
Write-Output "Desktop directory: $stage"
Write-Output "Desktop ZIP: $zip"
