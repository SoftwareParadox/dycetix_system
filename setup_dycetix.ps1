# dycetix_system Setup Script
Set-Location "C:\Users\willi\dycetix_system"

# Clean any existing Docker resources
docker-compose down -v 2>

# Set unique project name
echo "COMPOSE_PROJECT_NAME=dycetix_system" > .env
echo "DOCKER_IMAGE_PREFIX=dycetix" >> .env

# Ensure unique ports (dycetix uses default ports)
echo "APP_PORT=8000" >> .env
echo "CUSTOMER_PORT=8001" >> .env
echo "DB_PORT=5432" >> .env

Write-Host "Dycetix System configured to run on ports: 8000, 8001, 5432" -ForegroundColor Green
