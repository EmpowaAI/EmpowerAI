# PowerShell script to start AI service development server

$venvPath = ".\venv"
$pythonExe = "python"

# Check if venv exists, create if not
if (-not (Test-Path $venvPath)) {
    Write-Host "Virtual environment not found. Creating venv..." -ForegroundColor Yellow
    & $pythonExe -m venv venv
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to create virtual environment. Make sure Python is installed." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Virtual environment created. Installing dependencies..." -ForegroundColor Yellow
    & "$venvPath\Scripts\python.exe" -m pip install --upgrade pip
    & "$venvPath\Scripts\python.exe" -m pip install -r requirements.txt
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install dependencies." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Setup complete!" -ForegroundColor Green
}

# Check if requirements are installed
$testImport = & "$venvPath\Scripts\python.exe" -c "import fastapi" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Dependencies not installed. Installing..." -ForegroundColor Yellow
    & "$venvPath\Scripts\python.exe" -m pip install -r requirements.txt
}

# Start the server
Write-Host "Starting AI service on http://localhost:8000..." -ForegroundColor Green
& "$venvPath\Scripts\python.exe" -m uvicorn main:app --reload --port 8000

