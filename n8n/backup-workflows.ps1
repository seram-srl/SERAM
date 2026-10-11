# ========================================================
# SCRIPT DE EXPORTACIÓN Y RESPALDO DE WORKFLOWS DE SERAM
# ========================================================
# Ejecuta este script para exportar todos los flujos de n8n
# en archivos JSON limpios dentro de la carpeta 'workflows/'.
# Esto permite subirlos a Git o llevarlos al VPS fácilmente.

$ErrorActionPreference = "Stop"

Write-Host "Iniciando respaldo de flujos de SERAM..." -ForegroundColor Cyan

# Comprobar si el contenedor seram_n8n_app está corriendo
$container = docker ps -q --filter "name=seram_n8n_app"

if (-not $container) {
    Write-Host "El contenedor 'seram_n8n_app' no está en ejecución. Inícialo primero con docker compose up -d" -ForegroundColor Yellow
    exit 1
}

# Ejecutar el comando interno de n8n para exportar todos los workflows
docker exec seram_n8n_app n8n export:workflow --all --output=/home/node/workflows/all_workflows_backup.json --pretty

if ($LASTEXITCODE -eq 0) {
    Write-Host "¡Respaldo exitoso! Archivo guardado en d:\SERAM\n8n\workflows\all_workflows_backup.json" -ForegroundColor Green
} else {
    Write-Host "Hubo un problema al exportar los flujos." -ForegroundColor Red
}
