# SmartShelfX ML Service Startup Script
# Run from the ml-service/ directory: .\start.ps1

Write-Host "Starting SmartShelfX ML Service..." -ForegroundColor Cyan

# Set UTF-8 encoding to avoid Windows charmap issues
$env:PYTHONIOENCODING = "utf-8"

Write-Host "ML service starting on http://localhost:8001" -ForegroundColor Green
python main.py
