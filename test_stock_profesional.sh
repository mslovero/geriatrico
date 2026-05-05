#!/bin/bash
# Script de testing del módulo de stock profesionalizado

echo "🧪 TESTING - Módulo de Stock Profesionalizado"
echo "=============================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8000/api"

echo "📋 Test 1: Verificar Rutas de API"
echo "-----------------------------------"

# Test reportes
echo -n "Verificando rutas de reportes... "
if php artisan route:list | grep -q "reportes/resumen-general"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo ""
echo "📊 Test 2: Verificar Base de Datos"
echo "-----------------------------------"

echo -n "Verificando campos nuevos en stock_items... "
RESULT=$(php artisan tinker --execute="
\$item = \App\Models\StockItem::first();
echo isset(\$item->propiedad) && isset(\$item->paciente_propietario_id) && isset(\$item->activo) ? 'OK' : 'FAIL';
" 2>/dev/null)

if [[ "$RESULT" == *"OK"* ]]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo ""
echo "🔗 Test 3: Verificar Relaciones en Modelos"
echo "-------------------------------------------"

echo -n "Relación StockItem -> pacientePropietario... "
RESULT=$(php artisan tinker --execute="
\$item = \App\Models\StockItem::first();
echo method_exists(\$item, 'pacientePropietario') ? 'OK' : 'FAIL';
" 2>/dev/null)

if [[ "$RESULT" == *"OK"* ]]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo -n "Relación Medicacion -> stockItem... "
RESULT=$(php artisan tinker --execute="
\$med = \App\Models\Medicacion::first();
echo method_exists(\$med, 'stockItem') ? 'OK' : 'FAIL';
" 2>/dev/null)

if [[ "$RESULT" == *"OK"* ]]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo ""
echo "🎯 Test 4: Validaciones"
echo "-----------------------"

echo -n "Campo origen_pago es requerido en store... "
# Verifica que el controlador tenga la validación
if grep -q "'origen_pago' => 'required" geriatrico/app/Http/Controllers/MedicacionController.php; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo -n "Campo origen_pago es requerido en storeBatch... "
if grep -q "'medicamentos.\*.origen_pago' => 'required" geriatrico/app/Http/Controllers/MedicacionController.php; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo ""
echo "🎨 Test 5: Frontend"
echo "-------------------"

echo -n "Página ReporteCostos existe... "
if [ -f "frontGeriatrico/src/pages/ReporteCostos.jsx" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo -n "Selector origen_pago en CargaMedicamentos... "
if grep -q "origen_pago" frontGeriatrico/src/pages/CargaMedicamentos.jsx; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo -n "Ruta /stock/reportes existe en App.jsx... "
if grep -q "stock/reportes" frontGeriatrico/src/App.jsx; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo ""
echo "📈 Test 6: Datos de Prueba"
echo "--------------------------"

echo -n "Stock items existentes... "
COUNT=$(php artisan tinker --execute="echo \App\Models\StockItem::count();" 2>/dev/null | tail -1)
echo -e "${YELLOW}${COUNT}${NC} items"

echo -n "Stock del geriátrico... "
COUNT=$(php artisan tinker --execute="echo \App\Models\StockItem::where('propiedad', 'geriatrico')->count();" 2>/dev/null | tail -1)
echo -e "${GREEN}${COUNT}${NC} items"

echo -n "Stock de pacientes... "
COUNT=$(php artisan tinker --execute="echo \App\Models\StockItem::where('propiedad', 'paciente')->count();" 2>/dev/null | tail -1)
echo -e "${YELLOW}${COUNT}${NC} items"

echo ""
echo "📝 Test 7: Archivos de Documentación"
echo "--------------------------------------"

DOCS=(
    "README_STOCK_PROFESIONAL.md"
    "INICIO_RAPIDO.md"
    "TESTING_CHECKLIST.md"
    "STOCK_PROFESIONALIZACION_RESUMEN.md"
    "CAMBIOS_BASE_DATOS.md"
    "DIAGRAMAS_FLUJO.md"
)

for doc in "${DOCS[@]}"; do
    echo -n "Archivo $doc... "
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
done

echo ""
echo "✅ Test 8: URLs Corregidas"
echo "--------------------------"

echo -n "URLs actualizadas a puerto 3000... "
if grep -q "localhost:3000" README_STOCK_PROFESIONAL.md; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo ""
echo "================================================"
echo "🎉 Testing Completado"
echo "================================================"
echo ""
echo "Para probar manualmente:"
echo "1. Terminal 1: cd geriatrico && php artisan serve"
echo "2. Terminal 2: cd frontGeriatrico && npm run dev"
echo "3. Navegar a: http://localhost:3000/stock/reportes"
echo ""
