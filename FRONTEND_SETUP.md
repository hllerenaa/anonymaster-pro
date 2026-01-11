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
   # Abrir PowerShell o CMD como Administrador
   node --version
   # Debería mostrar: v18.x.x o superior

   npm --version
   # Debería mostrar: 9.x.x o superior
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
# En la carpeta raíz del proyecto
npm install
```

Este proceso puede tomar 2-5 minutos dependiendo de tu conexión a internet.

**Salida esperada:**
```
added 277 packages, and audited 278 packages in 2m

65 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### PASO 4: Configurar Variables de Entorno

1. **Copiar el archivo de ejemplo**
   ```cmd
   copy .env.example .env
   ```

2. **Editar el archivo .env**
   - Abrir con Notepad++, VS Code, o Notepad
   - Verificar que tenga:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_DEV_PORT=5173
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
➜  press h + enter to show help
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
# Actualizar el sistema
sudo apt update
sudo apt upgrade -y

# Agregar el repositorio de NodeSource para Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js y npm
sudo apt install -y nodejs

# Verificar instalación
node --version
# Debería mostrar: v20.x.x

npm --version
# Debería mostrar: 10.x.x
```

**Método B: Usando nvm (Recomendado para desarrollo)**

```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar la configuración del shell
source ~/.bashrc

# Instalar Node.js LTS
nvm install --lts
nvm use --lts

# Verificar
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
# Si tienes el archivo .tar.gz o .zip
unzip proyecto.zip
# o
tar -xzf proyecto.tar.gz

cd nombre-del-proyecto
```

### PASO 3: Instalar Dependencias

```bash
# En la carpeta raíz del proyecto
npm install
```

Este proceso puede tomar 2-5 minutos.

**Si hay errores de permisos:**
```bash
# Cambiar permisos de la carpeta npm global
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ~/nombre-del-proyecto
```

### PASO 4: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tu editor favorito
nano .env
# o
vim .env
# o
code .env  # Si tienes VS Code instalado
```

Verificar que contenga:
```env
VITE_API_URL=http://localhost:8000
VITE_DEV_PORT=5173
```

Guardar y cerrar (en nano: Ctrl+X, Y, Enter)

### PASO 5: Ejecutar el Frontend

```bash
npm run dev
```

**Salida esperada:**
```
VITE v5.4.8  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
➜  press h + enter to show help
```

### PASO 6: Abrir en el Navegador

- Abre tu navegador (Firefox, Chrome, etc.)
- Ve a: http://localhost:5173
- Deberías ver la aplicación funcionando

---

## ⚙️ Configuración del Frontend

### Variables de Entorno

El frontend usa variables de entorno con el prefijo `VITE_`:

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL del backend API | `http://localhost:8000` |
| `VITE_DEV_PORT` | Puerto del servidor de desarrollo | `5173` |
| `VITE_PREVIEW_PORT` | Puerto para preview del build | `4173` |

**Ejemplo de .env para desarrollo:**
```env
VITE_API_URL=http://localhost:8000
VITE_DEV_PORT=5173
VITE_PREVIEW_PORT=4173
```

**Ejemplo de .env para producción:**
```env
VITE_API_URL=https://api.tu-dominio.com
```

### Configuración de Vite

El archivo `vite.config.ts` controla la configuración de Vite:

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
# Busca "IPv4 Address"
```

Ubuntu/Linux:
```bash
ip addr show
# o
hostname -I
```

---

## 📦 Build de Producción

### Crear el Build

```bash
npm run build
```

**Salida esperada:**
```
vite v5.4.8 building for production...
✓ 1476 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.71 kB │ gzip:  0.39 kB
dist/assets/index-JF1bbubA.css   20.51 kB │ gzip:  4.20 kB
dist/assets/index-CPMV6xlr.js   235.80 kB │ gzip: 64.29 kB
✓ built in 5.70s
```

**Resultado:**
- Se crea la carpeta `dist/` con los archivos optimizados
- JavaScript minificado y optimizado
- CSS minificado
- Assets optimizados

### Preview del Build

Para probar el build localmente:

```bash
npm run preview
```

Accesible en: http://localhost:4173

### Desplegar el Build

Los archivos en `dist/` están listos para ser desplegados en:

**Opción A: Servidor Web (Nginx, Apache)**
```bash
# Copiar contenido de dist/ a tu servidor
scp -r dist/* usuario@servidor:/var/www/html/
```

**Opción B: Servicios de Hosting**
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
# Ver qué proceso usa el puerto
netstat -ano | findstr :5173

# Matar el proceso (reemplaza PID con el ID del proceso)
taskkill /PID <PID> /F
```

**Solución Ubuntu:**
```bash
# Ver qué proceso usa el puerto
lsof -i :5173

# Matar el proceso
kill -9 <PID>
```

**O cambia el puerto en .env:**
```env
VITE_DEV_PORT=5174
```

### Error: "Failed to fetch" en el frontend

**Causa:** El backend no está corriendo o la URL es incorrecta.

**Solución:**
1. Verifica que el backend esté corriendo en http://localhost:8000
2. Verifica que el archivo `.env` tenga la URL correcta:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
3. Reinicia el servidor de desarrollo:
   ```bash
   # Detener con Ctrl+C
   npm run dev
   ```

### Error: "Cannot find module" al ejecutar

**Causa:** Dependencias no instaladas o node_modules corrupto.

**Solución:**
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

Windows:
```cmd
rmdir /s node_modules
del package-lock.json
npm install
```

### Error de compilación en TypeScript

**Causa:** Errores de tipos en el código.

**Solución:**
```bash
# Ver errores específicos
npm run typecheck

# Si hay muchos errores, reinstala dependencias de tipos
npm install --save-dev @types/react @types/react-dom
```

### Build falla con "out of memory"

**Causa:** Node.js se queda sin memoria durante el build.

**Solución:**
```bash
# Aumentar límite de memoria de Node.js
export NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

Windows:
```cmd
set NODE_OPTIONS=--max_old_space_size=4096
npm run build
```

### Frontend funciona pero no carga estilos

**Causa:** Tailwind CSS no está compilando correctamente.

**Solución:**
```bash
# Limpiar caché y reinstalar
rm -rf node_modules .vite dist
npm install
npm run dev
```

### Error: "vite: not found" o "vite: command not found"

**Causa:** Vite no está instalado globalmente y npm no encuentra el binario local.

**Solución:**
```bash
# Reinstalar dependencias
npm install

# O ejecutar directamente desde node_modules
npx vite
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
├── App.tsx              # Componente raíz
├── main.tsx             # Punto de entrada
└── index.css            # Estilos globales
```

---

## 🌐 Acceso desde la Red Local

### Permitir Acceso Externo

**En el archivo `vite.config.ts`, agrega:**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Escucha en todas las interfaces
    port: 5173
  }
})
```

**Luego ejecuta:**
```bash
npm run dev
```

**Accede desde otros dispositivos:**
- Encuentra tu IP local (ver sección anterior)
- Desde otro dispositivo en la misma red: http://TU_IP:5173

---

## 🔐 Seguridad en Producción

### Variables de Entorno

- **NUNCA** commits el archivo `.env` a git
- **NUNCA** pongas secretos en variables `VITE_*` (son públicas)
- Usa variables de entorno del servidor para secretos

### HTTPS

En producción, siempre usa HTTPS:

```env
VITE_API_URL=https://api.tu-dominio.com
```

### CORS

Asegúrate de que el backend tenga configurado CORS correctamente para tu dominio de producción.

---

## 📊 Métricas de Rendimiento

### Tiempos Esperados

| Operación | Tiempo |
|-----------|--------|
| `npm install` | 2-5 minutos |
| Inicio del servidor (`npm run dev`) | 1-3 segundos |
| Hot reload (cambio de código) | < 1 segundo |
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
copy .env.example .env
```

**Ubuntu:**
```bash
npm install
cp .env.example .env
```

### Uso Diario

```bash
# Iniciar desarrollo
npm run dev

# Compilar para producción
npm run build

# Probar el build
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
- [ ] Archivo `.env` configurado
- [ ] Backend corriendo en puerto 8000
- [ ] Frontend corriendo en puerto 5173
- [ ] Aplicación accesible en http://localhost:5173

---

**¡Felicidades! Tu frontend debería estar funcionando correctamente. 🎉**

Si encuentras algún problema no cubierto en esta guía, revisa los logs de error en la consola y busca el mensaje específico.
