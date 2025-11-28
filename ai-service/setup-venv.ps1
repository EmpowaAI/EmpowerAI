# PowerShell script to set up Python virtual environment for AI service

$venvPath = ".\venv"
$pythonExe = "python"

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

