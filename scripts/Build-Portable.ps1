param([string]$NodeVersion = '24.19.0')
$ErrorActionPreference = 'Stop'
if ($NodeVersion -notmatch '^\d+\.\d+\.\d+$') { throw 'Use a numeric Node version.' }
$projectRoot = Split-Path $PSScriptRoot -Parent
$version = (Get-Content -Raw -LiteralPath (Join-Path $projectRoot 'package.json') | ConvertFrom-Json).version
$buildRoot = Join-Path $projectRoot ('build\portable-' + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $buildRoot -Force | Out-Null
$nodeName = "node-v$NodeVersion-win-x64.zip"
$nodeZip = Join-Path $buildRoot $nodeName
$sumsFile = Join-Path $buildRoot 'SHASUMS256.txt'
Invoke-WebRequest -Uri "https://nodejs.org/dist/v$NodeVersion/$nodeName" -OutFile $nodeZip
Invoke-WebRequest -Uri "https://nodejs.org/dist/v$NodeVersion/SHASUMS256.txt" -OutFile $sumsFile
$expected = (Get-Content -LiteralPath $sumsFile | Where-Object { $_.EndsWith('  ' + $nodeName) })
if (-not $expected -or (Get-FileHash -LiteralPath $nodeZip -Algorithm SHA256).Hash.ToLower() -ne $expected.Split(' ')[0]) { throw 'Node archive checksum mismatch.' }
Expand-Archive -LiteralPath $nodeZip -DestinationPath (Join-Path $buildRoot 'node')
$stage = Join-Path $buildRoot "sto-build-parser-$version"
$sourceZip = Join-Path $buildRoot 'source.zip'
& git -C $projectRoot archive --format=zip "--output=$sourceZip" HEAD
if ($LASTEXITCODE -ne 0) { throw 'Could not export committed source.' }
Expand-Archive -LiteralPath $sourceZip -DestinationPath $stage
$runtime = Join-Path $stage 'runtime'
New-Item -ItemType Directory -Path $runtime | Out-Null
$nodeExtracted = Join-Path $buildRoot "node\node-v$NodeVersion-win-x64"
Copy-Item -LiteralPath (Join-Path $nodeExtracted 'node.exe') -Destination $runtime
Copy-Item -LiteralPath (Join-Path $nodeExtracted 'LICENSE') -Destination $runtime
"Node.js $NodeVersion win-x64`nOfficial source: https://nodejs.org/dist/v$NodeVersion/$nodeName`nSHA256: $($expected.Split(' ')[0])" | Set-Content -LiteralPath (Join-Path $runtime 'PROVENANCE.txt')
$output = Join-Path (Split-Path $projectRoot -Parent) "sto-build-parser-v$version-windows-x64.zip"
Compress-Archive -LiteralPath $stage -DestinationPath $output -Force
Write-Output "Portable archive: $output"
Write-Output "Staging directory: $stage"
