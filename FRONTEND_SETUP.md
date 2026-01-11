# 🎨 Guía de Instalación y Ejecución del Frontend

Esta guía te llevará paso a paso para instalar y ejecutar el frontend de la aplicación en Windows y Ubuntu.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación en Windows](#instalación-en-windows)
3. [Instalación en Ubuntu/Linux](#instalación-en-ubuntulinux)
4. [Configuración del Frontend](#configuración-del-frontend)
5. [Ejecutar el Frontend](#ejecutar-el-frontend)
6. [Build de Producción](#build-de-producción)
7. [Solución de Problemas](#solución-de-problemas)

---

## ✅ Requisitos Previos

Antes de comenzar, necesitas tener instalado:

- **Node.js** 18.x o superior
- **npm** 9.x o superior (se instala con Node.js)
- **Git** (opcional, para clonar el proyecto)

---

## 🪟 Instalación en Windows

### PASO 1: Instalar Node.js

1. **Descargar Node.js**
   - Ve a: https://nodejs.org/
   - Descarga la versión **LTS** (Long Term Support)
   - Elige el instalador de Windows (.msi)

2. **Ejecutar el Instalador**
   - Doble clic en el archivo descargado
   - Acepta los términos y condiciones
   - Usa la configuración por defecto
   - Asegúrate de marcar la opción: "Automatically install the necessary tools"

3. **Verificar Instalación**
   ```cmd
   node --version
   npm --version
   ```

### PASO 2: Obtener el Proyecto

**Opción A: Clonar desde Git**
```cmd
cd C:\Users\TuUsuario\Documents
git clone URL_DEL_REPOSITORIO
cd nombre-del-proyecto
```

**Opción B: Descargar ZIP**
- Descarga el proyecto como ZIP
- Extrae en una carpeta de tu elección
- Abre PowerShell/CMD en esa carpeta

### PASO 3: Instalar Dependencias

```cmd
npm install
```

Este proceso puede tomar 2-5 minutos dependiendo de tu conexión a internet.

### PASO 4: Configurar el Frontend

El frontend usa un archivo `config.json` en la carpeta `public/` para su configuración.

1. **Copiar el archivo de ejemplo**
   ```cmd
   copy public\config.example.json public\config.json
   ```

2. **Editar el archivo (si es necesario)**
   ```cmd
   notepad public\config.json
   ```

   El archivo debe contener:
   ```json
   {
     "api": {
       "baseUrl": "http://localhost:8000",
       "timeout": 30000
     },
     "app": {
       "name": "Data Anonymization System",
       "version": "1.0.0"
     },
     "upload": {
       "maxFileSizeMB": 50,
       "acceptedFormats": [".csv", ".xlsx", ".xls"]
     }
   }
   ```

### PASO 5: Ejecutar el Frontend

```cmd
npm run dev
```

**Salida esperada:**
```
VITE v5.4.8  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### PASO 6: Abrir en el Navegador

- Abre tu navegador (Chrome, Edge, Firefox)
- Ve a: http://localhost:5173
- Deberías ver la aplicación funcionando

---

## 🐧 Instalación en Ubuntu/Linux

### PASO 1: Instalar Node.js

**Método A: Usando NodeSource (Recomendado)**

```bash
sudo apt update
sudo apt upgrade -y

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

node --version
npm --version
```

**Método B: Usando nvm (Recomendado para desarrollo)**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

nvm install --lts
nvm use --lts

node --version
npm --version
```

### PASO 2: Obtener el Proyecto

**Opción A: Clonar desde Git**
```bash
cd ~
git clone URL_DEL_REPOSITORIO
cd nombre-del-proyecto
```

**Opción B: Descargar y extraer**
```bash
cd ~
unzip proyecto.zip
cd nombre-del-proyecto
```

### PASO 3: Instalar Dependencias

```bash
npm install
```

**Si hay errores de permisos:**
```bash
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ~/nombre-del-proyecto
```

### PASO 4: Configurar el Frontend

```bash
cp public/config.example.json public/config.json

nano public/config.json
```

Verificar que contenga:
```json
{
  "api": {
    "baseUrl": "http://localhost:8000",
    "timeout": 30000
  },
  "app": {
    "name": "Data Anonymization System",
    "version": "1.0.0"
  },
  "upload": {
    "maxFileSizeMB": 50,
    "acceptedFormats": [".csv", ".xlsx", ".xls"]
  }
}
```

Guardar y cerrar (en nano: Ctrl+X, Y, Enter)

### PASO 5: Ejecutar el Frontend

```bash
npm run dev
```

### PASO 6: Abrir en el Navegador

- Abre tu navegador (Firefox, Chrome, etc.)
- Ve a: http://localhost:5173
- Deberías ver la aplicación funcionando

---

## ⚙️ Configuración del Frontend

### Sistema de Configuración JSON

El frontend utiliza un archivo `config.json` ubicado en la carpeta `public/`. Este archivo se carga dinámicamente cuando la aplicación inicia.

#### Estructura del config.json

```json
{
  "api": {
    "baseUrl": "http://localhost:8000",
    "timeout": 30000
  },
  "app": {
    "name": "Data Anonymization System",
    "version": "1.0.0"
  },
  "upload": {
    "maxFileSizeMB": 50,
    "acceptedFormats": [".csv", ".xlsx", ".xls"]
  }
}
```

#### Opciones de Configuración

| Sección | Propiedad | Descripción | Valor por Defecto |
|---------|-----------|-------------|-------------------|
| **api** | `baseUrl` | URL del backend API | `http://localhost:8000` |
| **api** | `timeout` | Timeout de las peticiones en ms | `30000` |
| **app** | `name` | Nombre de la aplicación | `Data Anonymization System` |
| **app** | `version` | Versión de la aplicación | `1.0.0` |
| **upload** | `maxFileSizeMB` | Tamaño máximo de archivo | `50` |
| **upload** | `acceptedFormats` | Formatos aceptados | `[".csv", ".xlsx", ".xls"]` |

#### Configuración para Diferentes Entornos

**Desarrollo Local:**
```json
{
  "api": {
    "baseUrl": "http://localhost:8000",
    "timeout": 30000
  }
}
```

**Red Local:**
```json
{
  "api": {
    "baseUrl": "http://192.168.1.100:8000",
    "timeout": 30000
  }
}
```

**Producción:**
```json
{
  "api": {
    "baseUrl": "https://api.tu-dominio.com",
    "timeout": 30000
  }
}
```

### Cómo Funciona la Configuración

1. Al iniciar la aplicación, `App.tsx` carga el archivo `config.json`
2. El servicio `src/services/config.ts` gestiona la configuración
3. Los componentes obtienen la configuración usando `getConfig()` o `getApiUrl()`
4. Si `config.json` no existe, se usan valores por defecto

### Configuración de Vite

El archivo `vite.config.ts` controla la configuración del servidor de desarrollo:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})
```

---

## 🚀 Ejecutar el Frontend

### Modo Desarrollo

```bash
npm run dev
```

**Características:**
- Hot Module Replacement (HMR) - Los cambios se reflejan al instante
- Source maps - Facilita el debugging
- Puerto: 5173 (por defecto)
- Accesible en: http://localhost:5173

**Detener el servidor:**
- Presiona `Ctrl + C` en la terminal

### Modo Desarrollo con Host Expuesto

Para acceder desde otros dispositivos en tu red local:

```bash
npm run dev -- --host
```

Ahora podrás acceder desde:
- Localhost: http://localhost:5173
- Red local: http://TU_IP_LOCAL:5173

**Encontrar tu IP local:**

Windows:
```cmd
ipconfig
```

Ubuntu/Linux:
```bash
hostname -I
```

---

## 📦 Build de Producción

### Crear el Build

```bash
npm run build
```

**Resultado:**
- Se crea la carpeta `dist/` con los archivos optimizados
- JavaScript minificado y optimizado
- CSS minificado
- Assets optimizados
- El archivo `config.json` se copia a `dist/`

### Preview del Build

Para probar el build localmente:

```bash
npm run preview
```

Accesible en: http://localhost:4173

### Desplegar el Build

Los archivos en `dist/` están listos para ser desplegados.

**IMPORTANTE:** Antes de desplegar, actualiza `dist/config.json` con la configuración de producción:

```json
{
  "api": {
    "baseUrl": "https://api.tu-dominio.com",
    "timeout": 30000
  }
}
```

**Opciones de Despliegue:**

**Servidor Web (Nginx, Apache)**
```bash
scp -r dist/* usuario@servidor:/var/www/html/
```

**Servicios de Hosting:**
- **Vercel**: `npx vercel`
- **Netlify**: Arrastra la carpeta `dist/` a netlify.com
- **GitHub Pages**: Usa GitHub Actions
- **AWS S3**: Sube la carpeta `dist/` a S3

---

## 🛠️ Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Crea build de producción |
| `npm run preview` | Vista previa del build |
| `npm run lint` | Ejecuta linter (ESLint) |
| `npm run typecheck` | Verifica tipos de TypeScript |

---

## 🐛 Solución de Problemas

### Error: "npm: command not found"

**Causa:** Node.js/npm no está instalado o no está en el PATH.

**Solución:**
- Reinstala Node.js desde nodejs.org
- Reinicia tu terminal/PowerShell después de instalar

### Error: "EACCES: permission denied"

**Causa:** Permisos incorrectos en carpetas de npm (Linux/Mac).

**Solución:**
```bash
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ./node_modules
```

### Error: "Port 5173 is already in use"

**Causa:** Otro proceso está usando el puerto 5173.

**Solución Windows:**
```cmd
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Solución Ubuntu:**
```bash
lsof -i :5173
kill -9 <PID>
```

### Error: "Failed to fetch" en el frontend

**Causa:** El backend no está corriendo o la URL en `config.json` es incorrecta.

**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica que `public/config.json` tenga la URL correcta:
   ```json
   {
     "api": {
       "baseUrl": "http://localhost:8000"
     }
   }
   ```
3. Reinicia el servidor de desarrollo

### Error: "Cannot find module" al ejecutar

**Causa:** Dependencias no instaladas o node_modules corrupto.

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
```

Windows:
```cmd
rmdir /s node_modules
del package-lock.json
npm install
```

### Pantalla blanca con "Cargando configuración..."

**Causa:** El archivo `config.json` no existe o tiene errores de sintaxis JSON.

**Solución:**
```bash
cp public/config.example.json public/config.json
```

Verifica que el JSON sea válido (sin comas extras, comillas correctas).

### Error de compilación en TypeScript

**Solución:**
```bash
npm run typecheck

npm install --save-dev @types/react @types/react-dom
```

### Build falla con "out of memory"

**Solución:**
```bash
export NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

Windows:
```cmd
set NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

### Frontend funciona pero no carga estilos

**Solución:**
```bash
rm -rf node_modules .vite dist
npm install
npm run dev
```

---

## 📂 Estructura del Frontend

```
src/
├── components/          # Componentes reutilizables
│   └── Layout.tsx       # Layout principal
├── pages/               # Páginas de la aplicación
│   ├── HomePage.tsx     # Dashboard
│   ├── UploadPage.tsx   # Subir datasets
│   ├── ConfigurePage.tsx # Configurar anonimización
│   ├── ResultsPage.tsx  # Ver resultados
│   └── DocsPage.tsx     # Documentación
├── services/            # Servicios y utilidades
│   └── config.ts        # Gestión de configuración
├── App.tsx              # Componente raíz
├── main.tsx             # Punto de entrada
└── index.css            # Estilos globales

public/
├── config.json          # Configuración de la aplicación
└── config.example.json  # Plantilla de configuración
```

---

## 🌐 Acceso desde la Red Local

### Permitir Acceso Externo

**En el archivo `vite.config.ts`, agrega:**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
```

**Actualiza `public/config.json` con la IP del backend:**
```json
{
  "api": {
    "baseUrl": "http://192.168.1.X:8000"
  }
}
```

**Accede desde otros dispositivos:**
- Encuentra tu IP local
- Desde otro dispositivo en la misma red: http://TU_IP:5173

---

## 🔐 Diferencias con Sistema de Variables de Entorno

Este proyecto **NO usa archivos .env** para el frontend. En su lugar, usa `config.json` por las siguientes razones:

### Ventajas del Sistema JSON

1. **Configuración en Tiempo de Ejecución**
   - Puedes cambiar la configuración sin recompilar
   - Ideal para Docker y deployments

2. **Simplicidad**
   - No necesitas prefijos `VITE_`
   - Un solo archivo para toda la configuración

3. **Consistencia con el Backend**
   - El backend usa `credentials.json`
   - El frontend usa `config.json`
   - Sistema unificado

4. **Despliegues Más Fáciles**
   - Compila una vez
   - Cambia `config.json` según el entorno
   - Sin necesidad de rebuilds

### Si Necesitas Variables de Entorno

Si en el futuro necesitas usar variables de entorno (no recomendado para este proyecto), recuerda:

- Las variables deben tener prefijo `VITE_`
- Se inyectan durante el build
- No son dinámicas
- Ejemplo: `VITE_API_URL`

---

## 📊 Métricas de Rendimiento

### Tiempos Esperados

| Operación | Tiempo |
|-----------|--------|
| `npm install` | 2-5 minutos |
| Inicio del servidor | 1-3 segundos |
| Hot reload | < 1 segundo |
| `npm run build` | 5-10 segundos |

### Tamaños

| Item | Tamaño |
|------|--------|
| `node_modules/` | ~200-300 MB |
| Build (`dist/`) | ~250 KB (comprimido) |
| JavaScript | ~235 KB |
| CSS | ~20 KB |

---

## 🎯 Resumen de Comandos Rápidos

### Instalación Inicial (hacer solo una vez)

**Windows:**
```cmd
npm install
copy public\config.example.json public\config.json
```

**Ubuntu:**
```bash
npm install
cp public/config.example.json public/config.json
```

### Uso Diario

```bash
npm run dev

npm run build

npm run preview
```

---

## 📚 Recursos Adicionales

- **Documentación de Vite:** https://vitejs.dev/
- **Documentación de React:** https://react.dev/
- **Documentación de Tailwind CSS:** https://tailwindcss.com/
- **Documentación de TypeScript:** https://www.typescriptlang.org/

---

## ✅ Checklist de Instalación

- [ ] Node.js 18+ instalado
- [ ] npm instalado
- [ ] Proyecto descargado/clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `public/config.json` creado y configurado
- [ ] Backend corriendo en puerto 8000
- [ ] Frontend corriendo en puerto 5173
- [ ] Aplicación accesible en http://localhost:5173

---

**¡Felicidades! Tu frontend debería estar funcionando correctamente. 🎉**

Si encuentras algún problema no cubierto en esta guía, revisa los logs de error en la consola y busca el mensaje específico.
