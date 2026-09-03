param(
    [string]$Server = "nestor@192.168.1.239"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Zip = Join-Path $env:TEMP "aura-web-deploy.zip"

Write-Host "=== ACTUALIZANDO AURA WEB ===" -ForegroundColor Cyan

foreach ($item in @("index.html", "styles.css", "assets")) {
    if (-not (Test-Path (Join-Path $ProjectRoot $item))) {
        throw "No encuentro '$item' en $ProjectRoot"
    }
}

if (Test-Path $Zip) {
    Remove-Item $Zip -Force
}

Compress-Archive -Path @(
    (Join-Path $ProjectRoot "index.html"),
    (Join-Path $ProjectRoot "styles.css"),
    (Join-Path $ProjectRoot "assets")
) -DestinationPath $Zip -Force

Write-Host "1/3 Subiendo archivos al servidor..." -ForegroundColor Yellow
scp $Zip "${Server}:/tmp/aura-web-deploy.zip"

Write-Host "2/3 Instalando en /var/www/html..." -ForegroundColor Yellow

# Use LF-only shell script and run it through an interactive SSH session
# so sudo can ask for the password normally.
$remoteScript = @'
#!/bin/bash
set -e

rm -rf /tmp/aura-web-deploy
mkdir -p /tmp/aura-web-deploy

unzip -q -o /tmp/aura-web-deploy.zip -d /tmp/aura-web-deploy

sudo cp /tmp/aura-web-deploy/index.html /var/www/html/index.html
sudo cp /tmp/aura-web-deploy/styles.css /var/www/html/styles.css

sudo rm -rf /var/www/html/assets
sudo cp -r /tmp/aura-web-deploy/assets /var/www/html/assets

sudo chown -R www-data:www-data /var/www/html

rm -rf /tmp/aura-web-deploy
rm -f /tmp/aura-web-deploy.zip

echo "Archivos instalados correctamente."
'@

$remoteScript = $remoteScript.Replace("`r`n", "`n")
$RemoteFile = Join-Path $env:TEMP "aura-web-remote.sh"
[System.IO.File]::WriteAllText(
    $RemoteFile,
    $remoteScript,
    [System.Text.UTF8Encoding]::new($false)
)

scp $RemoteFile "${Server}:/tmp/aura-web-remote.sh"

Write-Host ""
Write-Host "En el siguiente paso Ubuntu puede pedirte la contraseña de nestor (SSH)"
Write-Host "y después la contraseña de sudo." -ForegroundColor DarkGray
Write-Host ""

# -t allocates a terminal, which is required for sudo on this server.
ssh -t $Server "bash /tmp/aura-web-remote.sh"

Write-Host ""
Write-Host "3/3 Verificando Nginx..." -ForegroundColor Yellow
ssh -t $Server "sudo nginx -t"

Remove-Item $Zip -Force
Remove-Item $RemoteFile -Force

Write-Host ""
Write-Host "=== AURA WEB ACTUALIZADA CORRECTAMENTE ===" -ForegroundColor Green
Write-Host "https://aurawellnesstudio.duckdns.org" -ForegroundColor Cyan
