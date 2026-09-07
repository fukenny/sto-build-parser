$ErrorActionPreference = 'Stop'
$appRoot = $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$bundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
if ($nodeCommand) { $nodePath = $nodeCommand.Source }
elseif (Test-Path -LiteralPath $bundledNode) { $nodePath = $bundledNode }
else { throw 'Install Node.js 22 or newer from nodejs.org, then run this launcher again.' }
$appUrl = 'http://127.0.0.1:4317'
try {
    $existing = Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 2
    if ($existing.Content -match '<title>STO Build Parser</title>') {
        Start-Process $appUrl
        exit
    }
    throw 'Port 4317 is already used by another application.'
} catch {
    if ($_.Exception.Message -eq 'Port 4317 is already used by another application.') { throw }
}
$serverProcess = Start-Process -FilePath $nodePath -ArgumentList ('"' + (Join-Path $appRoot 'server.mjs') + '"') -WorkingDirectory $appRoot -WindowStyle Hidden -PassThru
try {
    $ready = $false
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        if ($serverProcess.HasExited) { throw 'The app could not start. Run node server.mjs to see the error.' }
        try {
            $response = Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 1
            if ($response.Content -match '<title>STO Build Parser</title>') { $ready = $true; break }
        } catch { }
        Start-Sleep -Milliseconds 250
    }
    if (-not $ready) { throw 'The app did not become ready.' }
    Start-Process $appUrl
    Write-Host 'STO Build Parser is running. Keep this window open; press Ctrl+C to stop.'
    Wait-Process -Id $serverProcess.Id
} finally {
    if (-not $serverProcess.HasExited) { Stop-Process -Id $serverProcess.Id }
}
