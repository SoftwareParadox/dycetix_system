Write-Host \"Step 1: Stop current containers\" -ForegroundColor Cyan
docker-compose down

Write-Host \"Step 2: Copy new docker-compose\" -ForegroundColor Cyan
Copy-Item docker-compose.v1.yml docker-compose.yml -Force

Write-Host \"Step 3: Start with new configuration\" -ForegroundColor Cyan
docker-compose up -d --build

Write-Host \"Step 4: Wait for services to start\" -ForegroundColor Cyan
Start-Sleep -Seconds 15

Write-Host \"Step 5: Check if services are running\" -ForegroundColor Cyan
docker-compose ps

Write-Host \"Step 6: Test admin app\" -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri \"http://localhost:8000/admin\" -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host \"✓ Admin app is responding\" -ForegroundColor Green
} catch {
    Write-Host \"✗ Admin app not responding\" -ForegroundColor Red
}

Write-Host \"Step 7: Test customer app\" -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri \"http://localhost:8001/\" -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host \"✓ Customer app is responding\" -ForegroundColor Green
} catch {
    Write-Host \"✗ Customer app not responding\" -ForegroundColor Red
}

Write-Host \"Step 8: Check logs (last 20 lines)\" -ForegroundColor Cyan
docker-compose logs --tail=20 admin
docker-compose logs --tail=20 customer
