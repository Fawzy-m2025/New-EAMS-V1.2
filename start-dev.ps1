# PowerShell script to start EAMS Development Server with increased memory
Write-Host "Starting EAMS Development Server with increased memory..." -ForegroundColor Green
$env:NODE_OPTIONS = "--max-old-space-size=4096"
npm run dev 