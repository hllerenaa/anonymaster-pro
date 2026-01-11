@echo off
REM Script para iniciar el backend de anonimización de datos en Windows

echo 🚀 Iniciando Backend de Anonimización de Datos...
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python no está instalado
    echo Por favor instala Python 3.8 o superior desde python.org
    pause
    exit /b 1
)

echo ✅ Python encontrado
python --version

REM Verificar si el entorno virtual existe
if not exist "venv" (
    echo.
    echo 📦 Creando entorno virtual...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Error al crear el entorno virtual
        pause
        exit /b 1
    )
    echo ✅ Entorno virtual creado
)

REM Activar entorno virtual
echo.
echo 📦 Activando entorno virtual...
call venv\Scripts\activate.bat

if errorlevel 1 (
    echo ❌ Error al activar el entorno virtual
    pause
    exit /b 1
)

REM Verificar si las dependencias están instaladas
echo.
echo 📦 Verificando dependencias...
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo 📦 Instalando dependencias...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ Error al instalar dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas
) else (
    echo ✅ Dependencias ya instaladas
)

REM Verificar archivo .env
if not exist "..\\.env" (
    echo.
    echo ⚠️  Advertencia: No se encontró el archivo .env
    echo Asegúrate de tener un archivo .env en la raíz del proyecto con:
    echo   VITE_SUPABASE_URL=tu_url
    echo   VITE_SUPABASE_ANON_KEY=tu_clave
    echo.
)

REM Iniciar el servidor
echo.
echo 🚀 Iniciando servidor en http://localhost:8000
echo 📖 Documentación API: http://localhost:8000/docs
echo.
echo Presiona Ctrl+C para detener el servidor
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

python main.py
pause
