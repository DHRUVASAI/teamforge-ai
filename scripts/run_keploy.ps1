# TeamForge AI - Keploy Automated Regression Runner
param(
    [Parameter(Position=0)]
    [ValidateSet("record", "test", "install")]
    [string]$Mode = "test"
)

$KeployBin = Get-Command keploy -ErrorAction SilentlyContinue

if ($Mode -eq "install") {
    Write-Host "[+] Installing Keploy on Windows..." -ForegroundColor Cyan
    Write-Host "Run the official Keploy Windows setup or WSL/Docker command:"
    Write-Host "curl -O https://keploy.io/install.ps1; .\install.ps1"
    exit 0
}

if (-not $KeployBin) {
    Write-Host "[!] Keploy CLI is not found in PATH." -ForegroundColor Yellow
    Write-Host "    To install Keploy, run: .\scripts\run_keploy.ps1 install"
    Write-Host "    Alternatively, use Docker: docker run --net=host -v ${PWD}:/workspace ghcr.io/keploy/keploy:latest $Mode"
    exit 1
}

if ($Mode -eq "record") {
    Write-Host "[+] Starting Keploy RECORD session..." -ForegroundColor Green
    Write-Host "    Traffic to http://localhost:8000 will be captured into /keploy"
    keploy record -c "cd backend; .\venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
} elseif ($Mode -eq "test") {
    Write-Host "[+] Starting Keploy REPLAY / REGRESSION TEST..." -ForegroundColor Green
    keploy test -c "cd backend; .\venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000" --delay 5
}
