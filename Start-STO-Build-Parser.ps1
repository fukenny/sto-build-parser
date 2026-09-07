$ErrorActionPreference = 'Stop'
$appRoot = $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$bundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
if ($nodeCommand) { $nodePath = $nodeCommand.Source }
elseif (Test-Path -LiteralPath $bundledNode) { $nodePath = $bundledNode }
else { throw 'Install Node.js 22 or newer from nodejs.org, then run this launcher again.' }
$appUrl = 'http://127.0.0.1:4317'
Start-Process $appUrl
Write-Host 'STO Build Parser is starting. Keep this window open; press Ctrl+C to stop.'
& $nodePath (Join-Path $appRoot 'server.mjs')
