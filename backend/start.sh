#!/bin/bash

# Script para iniciar el backend de anonimización de datos
echo "🚀 Iniciando Backend de Anonimización de Datos..."
echo ""

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 no está instalado"
    echo "Por favor instala Python 3.8 o superior"
    exit 1
fi

echo "✅ Python encontrado: $(python3 --version)"

# Verificar si el entorno virtual existe
if [ ! -d "venv" ]; then
    echo ""
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv

    if [ $? -ne 0 ]; then
        echo "❌ Error al crear el entorno virtual"
        echo "Intenta instalar python3-venv:"
        echo "  sudo apt install python3-venv (Ubuntu/Debian)"
        echo "  brew install python3 (macOS)"
        exit 1
    fi
    echo "✅ Entorno virtual creado"
fi

# Activar entorno virtual
echo ""
echo "📦 Activando entorno virtual..."
source venv/bin/activate

if [ $? -ne 0 ]; then
    echo "❌ Error al activar el entorno virtual"
    exit 1
fi

# Verificar si las dependencias están instaladas
echo ""
echo "📦 Verificando dependencias..."
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Instalando dependencias..."
    pip install -r requirements.txt

    if [ $? -ne 0 ]; then
        echo "❌ Error al instalar dependencias"
        exit 1
    fi
    echo "✅ Dependencias instaladas"
else
    echo "✅ Dependencias ya instaladas"
fi

# Verificar archivo .env
if [ ! -f "../.env" ]; then
    echo ""
    echo "⚠️  Advertencia: No se encontró el archivo .env"
    echo "Asegúrate de tener un archivo .env en la raíz del proyecto con:"
    echo "  VITE_SUPABASE_URL=tu_url"
    echo "  VITE_SUPABASE_ANON_KEY=tu_clave"
    echo ""
fi

# Iniciar el servidor
echo ""
echo "🚀 Iniciando servidor en http://localhost:8000"
echo "📖 Documentación API: http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

python main.py
