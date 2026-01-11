# 🚀 Cómo Iniciar la Aplicación

Esta aplicación tiene dos componentes que necesitan ejecutarse por separado:

## 1. Backend de Python (Procesamiento de Datos)

El backend maneja la anonimización de datos con algoritmos avanzados.

### Pasos para Iniciar el Backend:

```bash
# 1. Abre una terminal y navega a la carpeta backend
cd backend

# 2. Crea un entorno virtual (solo la primera vez)
python -m venv venv

# 3. Activa el entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# 4. Instala las dependencias (solo la primera vez)
pip install -r requirements.txt

# 5. Inicia el servidor
python main.py
```

✅ El backend debería estar corriendo en: **http://localhost:8000**

Verifica visitando http://localhost:8000 en tu navegador - deberías ver:
```json
{
  "message": "Data Anonymization System API",
  "version": "1.0.0"
}
```

## 2. Frontend de React (Interfaz de Usuario)

El frontend ya está ejecutándose automáticamente en modo desarrollo.

### Para Desarrollo:
```bash
npm run dev
```

### Para Producción:
```bash
npm run build
```

## 🔧 Solución de Problemas Comunes

### ❌ Error: "No se puede conectar al servidor"

**Causa:** El backend no está ejecutándose.

**Solución:**
1. Abre una terminal separada
2. Navega a la carpeta `backend`
3. Activa el entorno virtual
4. Ejecuta `python main.py`

### ❌ Error: "ModuleNotFoundError: No module named 'fastapi'"

**Causa:** Las dependencias de Python no están instaladas.

**Solución:**
```bash
cd backend
pip install -r requirements.txt
```

### ❌ Error: "Address already in use"

**Causa:** Ya hay una aplicación usando el puerto 8000.

**Solución:**
1. Cierra cualquier otra aplicación en el puerto 8000
2. O cambia el puerto en `main.py` (última línea)

### ❌ Error: "Cannot connect to Supabase"

**Causa:** Las variables de entorno no están configuradas correctamente.

**Solución:**
1. Verifica que el archivo `.env` existe en la raíz del proyecto
2. Asegúrate de que contiene:
   ```env
   VITE_SUPABASE_URL=tu_url_aqui
   VITE_SUPABASE_ANON_KEY=tu_clave_aqui
   ```

## 📝 Resumen Rápido

**Para iniciar toda la aplicación:**

1. **Terminal 1 - Backend:**
   ```bash
   cd backend
   source venv/bin/activate  # o venv\Scripts\activate en Windows
   python main.py
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

3. **Abre tu navegador:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Docs API: http://localhost:8000/docs

## 🎯 Flujo de Trabajo Típico

1. ✅ Inicia el backend primero
2. ✅ Verifica que el backend responde en http://localhost:8000
3. ✅ El frontend se conectará automáticamente al backend
4. ✅ Comienza a usar la aplicación

## 💡 Consejos

- Mantén ambas terminales abiertas mientras trabajas
- El backend se reinicia automáticamente en cambios (con `--reload`)
- El frontend tiene recarga en caliente (HMR) habilitada
- Revisa los logs en ambas terminales para depurar problemas

¿Necesitas más ayuda? Revisa:
- `backend/README.md` - Documentación detallada del backend
- `README.md` - Documentación general del proyecto
