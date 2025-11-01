# Setup Script for Face Recognition Application
# This script helps automate the initial setup process

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Face Recognition App - Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Found: Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found! Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check training images
Write-Host ""
Write-Host "Checking training images..." -ForegroundColor Yellow
$juanImages = Get-ChildItem -Path "training_images\juan_diego" -Include *.jpg,*.jpeg,*.png -File -ErrorAction SilentlyContinue
$brayanImages = Get-ChildItem -Path "training_images\brayan_yesid" -Include *.jpg,*.jpeg,*.png -File -ErrorAction SilentlyContinue

if ($juanImages.Count -gt 0) {
    Write-Host "✓ Found $($juanImages.Count) training image(s) for Juan Diego" -ForegroundColor Green
} else {
    Write-Host "⚠ No training images found for Juan Diego" -ForegroundColor Yellow
    Write-Host "  Please add images to: training_images\juan_diego\" -ForegroundColor Yellow
}

if ($brayanImages.Count -gt 0) {
    Write-Host "✓ Found $($brayanImages.Count) training image(s) for Brayan" -ForegroundColor Green
} else {
    Write-Host "⚠ No training images found for Brayan" -ForegroundColor Yellow
    Write-Host "  Please add images to: training_images\brayan_yesid\" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Backend" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Backend setup
Write-Host ""
$setupBackend = Read-Host "Set up Python backend? (y/n)"
if ($setupBackend -eq 'y') {
    Set-Location backend
    
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    .\venv\Scripts\Activate.ps1
    
    Write-Host "Installing Python packages (this may take several minutes)..." -ForegroundColor Yellow
    pip install -r requirements.txt
    
    Write-Host "✓ Backend setup complete!" -ForegroundColor Green
    
    # Create .env file if it doesn't exist
    if (-not (Test-Path ".env")) {
        Copy-Item ".env.example" ".env"
        Write-Host "✓ Created .env file (you can configure email settings later)" -ForegroundColor Green
    }
    
    Set-Location ..
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Frontend" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Frontend setup
Write-Host ""
$setupFrontend = Read-Host "Set up Next.js frontend? (y/n)"
if ($setupFrontend -eq 'y') {
    Set-Location frontend
    
    Write-Host "Installing Node.js packages..." -ForegroundColor Yellow
    npm install
    
    Write-Host "✓ Frontend setup complete!" -ForegroundColor Green
    
    # Create .env.local file if it doesn't exist
    if (-not (Test-Path ".env.local")) {
        Copy-Item ".env.local.example" ".env.local"
        Write-Host "✓ Created .env.local file" -ForegroundColor Green
    }
    
    Set-Location ..
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add training images to training_images folders" -ForegroundColor White
Write-Host "2. Start backend: cd backend && .\venv\Scripts\Activate.ps1 && python app.py" -ForegroundColor White
Write-Host "3. Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "4. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "See QUICKSTART.md for detailed instructions" -ForegroundColor Cyan
