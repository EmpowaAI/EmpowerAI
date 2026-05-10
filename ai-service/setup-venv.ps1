# PowerShell script to set up Python virtual environment for AI service

$venvPath = ".\venv"
$pythonExe = "python"

# Pydantic v2 depends on pydantic-core (native wheels). As of today, wheels may not be
# available for bleeding-edge Python versions, which forces a local build that requires
# MSVC build tools. Guard early with a clear message.
$pyVersion = & $pythonExe -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>$null
if ($LASTEXITCODE -ne 0 -or -not $pyVersion) {
    Write-Host "Error: Python is not available on PATH. Install Python 3.10–3.12 and try again." -ForegroundColor Red
    exit 1
}

$parts = $pyVersion.Split('.')
$major = [int]$parts[0]
$minor = [int]$parts[1]

if ($major -ne 3 -or $minor -lt 10 -or $minor -gt 12) {
    Write-Host "Error: Detected Python $pyVersion. The AI service supports Python 3.10–3.12." -ForegroundColor Red
    Write-Host "Reason: dependencies (FastAPI/Pydantic) require pydantic-core wheels; newer Python versions may require compiling native extensions (needs MSVC Build Tools)." -ForegroundColor Yellow
    exit 1
}

# Check if venv exists
if (-not (Test-Path $venvPath)) {
    Write-Host "Virtual environment not found. Creating venv..." -ForegroundColor Yellow
    & $pythonExe -m venv venv
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to create virtual environment. Make sure Python is installed." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Virtual environment created successfully!" -ForegroundColor Green
}

# Activate venv and install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
& "$venvPath\Scripts\python.exe" -m pip install --upgrade pip
& "$venvPath\Scripts\python.exe" -m pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies." -ForegroundColor Red
    exit 1
}

Write-Host "Setup complete!" -ForegroundColor Green

