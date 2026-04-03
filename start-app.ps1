# Super App Master Startup Script (PowerShell)

$services = @(
    "api-gateway",
    "services\auth-service",
    "services\user-service",
    "services\chat-service",
    "services\settings-service",
    "services\super-communication-service",
    "services\dashboard-service",
    "frontend"
)

Write-Host "🚀 Starting Super App Core Ecosystem..." -ForegroundColor Cyan

$services | ForEach-Object {
    $service = $_
    Write-Host "📦 Installing dependencies for $service..." -ForegroundColor Yellow
    Set-Location $service
    npm install --silent
    Set-Location ..
    if ($service.StartsWith("services\")) { Set-Location .. }
}

Write-Host "⚡ Booting Services..." -ForegroundColor Green

$services | ForEach-Object {
    $service = $_
    if ($service -ne "frontend") {
        Write-Host "🔥 Starting $service..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location $service; npm run dev"
    }
}

Write-Host "🖥️ Starting Frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev"

Write-Host "✅ All Core Services are booting in separate windows!" -ForegroundColor Green
Write-Host "Gateway: http://localhost:5000"
Write-Host "Frontend: http://localhost:3000"
