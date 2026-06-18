# SERAM - init.ps1 | Script de Autodiagnostico (PowerShell)
# Uso: .\init.ps1

$PASS = 0
$WARN = 0
$FAIL = 0

function log_pass($msg) { Write-Host "  [PASS] $msg" -ForegroundColor Green;  $script:PASS++ }
function log_fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red;    $script:FAIL++ }
function log_warn($msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow; $script:WARN++ }

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  SERAM - Sistema de Autodiagnostico v1.0  " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# 1. NODE / NPM
Write-Host "[1/5] Verificando entorno Node.js..." -ForegroundColor Cyan

$nodeVersion = node -v 2>$null
if ($nodeVersion) { log_pass "Node.js instalado: $nodeVersion" }
else              { log_fail "Node.js no encontrado. Instalar desde https://nodejs.org" }

$npmVersion = npm -v 2>$null
if ($npmVersion) { log_pass "npm instalado: $npmVersion" }
else             { log_fail "npm no encontrado." }

# 2. ARCHIVOS CRITICOS
Write-Host ""
Write-Host "[2/5] Verificando archivos criticos..." -ForegroundColor Cyan

$criticalFiles = @(
    "package.json",
    "vite.config.js",
    "src\index.css",
    "src\main.jsx",
    "src\context\AppContext.jsx",
    "agents.md",
    "tasks.json"
)

foreach ($f in $criticalFiles) {
    if (Test-Path $f) { log_pass "Existe: $f" }
    else              { log_fail "FALTA:  $f" }
}

# 3. NODE_MODULES
Write-Host ""
Write-Host "[3/5] Verificando node_modules..." -ForegroundColor Cyan

if (Test-Path "node_modules") { log_pass "node_modules presente" }
else                          { log_warn "node_modules ausente. Ejecutar: npm install" }

# 4. VARIABLES DE ENTORNO
Write-Host ""
Write-Host "[4/5] Verificando variables de entorno..." -ForegroundColor Cyan

if (Test-Path ".env") {
    log_pass ".env encontrado"
    $envContent = Get-Content ".env" -Raw
    foreach ($var in @("VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY")) {
        if ($envContent -match "^$var=") { log_pass "Variable definida: $var" }
        else                             { log_warn "Variable no encontrada: $var" }
    }
} else {
    log_warn ".env no encontrado"
}

# 5. BUILD CHECK
Write-Host ""
Write-Host "[5/5] Verificando build del proyecto..." -ForegroundColor Cyan

$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) { log_pass "Build exitoso" }
else                     { log_warn "Build con errores - revisar antes de continuar" }

# RESUMEN
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  RESUMEN DEL DIAGNOSTICO" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  PASS: $PASS" -ForegroundColor Green
Write-Host "  WARN: $WARN" -ForegroundColor Yellow
Write-Host "  FAIL: $FAIL" -ForegroundColor Red
Write-Host "=============================================" -ForegroundColor Cyan

if ($FAIL -gt 0) {
    Write-Host ""
    Write-Host "DIAGNOSTICO FALLIDO - Resolver errores antes de proceder." -ForegroundColor Red
    exit 1
} else {
    Write-Host ""
    Write-Host "ENTORNO LISTO - Puedes iniciar la tarea." -ForegroundColor Green
    Write-Host "Proximo paso: revisar tasks.json y elegir tarea pendiente." -ForegroundColor Cyan
    exit 0
}
