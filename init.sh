#!/usr/bin/env bash
# ============================================================
# SERAM — init.sh | Script de Autodiagnóstico
# Ejecutar ANTES de cualquier cambio en el proyecto.
# Uso: bash init.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

log_pass() { echo -e "${GREEN}  ✅ PASS${NC} — $1"; ((PASS++)); }
log_fail() { echo -e "${RED}  ❌ FAIL${NC} — $1"; ((FAIL++)); }
log_warn() { echo -e "${YELLOW}  ⚠️  WARN${NC} — $1"; ((WARN++)); }
log_info() { echo -e "${CYAN}  ℹ️  INFO${NC} — $1"; }

echo ""
echo "============================================="
echo "  SERAM — Sistema de Autodiagnóstico v1.0"
echo "============================================="
echo ""

# -----------------------------------------------------------
# 1. ENTORNO NODE / NPM
# -----------------------------------------------------------
echo "📦 [1/5] Verificando entorno Node.js..."

if command -v node &> /dev/null; then
  NODE_V=$(node -v)
  log_pass "Node.js instalado: $NODE_V"
else
  log_fail "Node.js no encontrado. Instalar desde https://nodejs.org"
fi

if command -v npm &> /dev/null; then
  NPM_V=$(npm -v)
  log_pass "npm instalado: $NPM_V"
else
  log_fail "npm no encontrado."
fi

# -----------------------------------------------------------
# 2. ARCHIVOS CRÍTICOS DEL PROYECTO
# -----------------------------------------------------------
echo ""
echo "📁 [2/5] Verificando archivos críticos..."

CRITICAL_FILES=(
  "package.json"
  "vite.config.js"
  "src/index.css"
  "src/main.jsx"
  "src/context/AppContext.jsx"
  "agents.md"
  "tasks.json"
)

for f in "${CRITICAL_FILES[@]}"; do
  if [ -f "$f" ]; then
    log_pass "Existe: $f"
  else
    log_fail "FALTA: $f"
  fi
done

# -----------------------------------------------------------
# 3. NODE_MODULES
# -----------------------------------------------------------
echo ""
echo "🔧 [3/5] Verificando node_modules..."

if [ -d "node_modules" ]; then
  log_pass "node_modules presente"
else
  log_warn "node_modules ausente — ejecutar: npm install"
fi

# -----------------------------------------------------------
# 4. VARIABLES DE ENTORNO
# -----------------------------------------------------------
echo ""
echo "🔑 [4/5] Verificando variables de entorno..."

if [ -f ".env" ]; then
  log_pass ".env encontrado"
  # Verificar que las variables clave existen (sin mostrar valores)
  ENV_VARS=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
  for var in "${ENV_VARS[@]}"; do
    if grep -q "^${var}=" .env 2>/dev/null; then
      log_pass "Variable definida: $var"
    else
      log_warn "Variable no encontrada en .env: $var"
    fi
  done
else
  log_warn ".env no encontrado — copiar desde .env.example si existe"
fi

# -----------------------------------------------------------
# 5. BUILD / LINT CHECK
# -----------------------------------------------------------
echo ""
echo "🏗️  [5/5] Verificando build del proyecto..."

if npm run build -- --silent 2>/dev/null; then
  log_pass "Build exitoso"
else
  log_warn "Build fallido — revisar errores antes de continuar"
fi

# -----------------------------------------------------------
# RESUMEN FINAL
# -----------------------------------------------------------
echo ""
echo "============================================="
echo "  RESUMEN DEL DIAGNÓSTICO"
echo "============================================="
echo -e "  ${GREEN}✅ PASS: $PASS${NC}"
echo -e "  ${YELLOW}⚠️  WARN: $WARN${NC}"
echo -e "  ${RED}❌ FAIL: $FAIL${NC}"
echo "============================================="

if [ $FAIL -gt 0 ]; then
  echo ""
  echo -e "${RED}⛔ DIAGNÓSTICO FALLIDO — Resolver errores antes de proceder.${NC}"
  exit 1
else
  echo ""
  echo -e "${GREEN}✅ ENTORNO LISTO — Puedes iniciar la tarea.${NC}"
  echo ""
  echo "  Próximo paso: cat tasks.json | jq '.tasks[] | select(.status==\"pending\")'"
  exit 0
fi
