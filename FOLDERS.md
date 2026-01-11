# 📁 Explicación de Carpetas del Proyecto

Esta guía explica qué contiene cada carpeta del proyecto, su propósito, y cuándo modificar su contenido.

---

## 🌲 Árbol de Directorios

```
data-anonymization-system/
│
├── backend/                    # Backend de Python (FastAPI)
│   ├── database.py             # Conexión a PostgreSQL
│   ├── main.py                 # API FastAPI
│   └── requirements.txt        # Dependencias Python
├── database/                   # Scripts SQL de PostgreSQL
│   ├── create_database.sql     # Crear tablas
│   ├── drop_database.sql       # Eliminar tablas
│   └── README.md               # Documentación BD
├── dist/                       # Build de producción (generado)
├── node_modules/               # Dependencias de Node.js (generado)
├── src/                        # Código fuente del frontend (React)
│   ├── components/             # Componentes reutilizables
│   ├── pages/                  # Páginas de la aplicación
│   ├── App.tsx                 # Componente principal
│   └── main.tsx                # Punto de entrada
├── credentials.json            # Credenciales del sistema (no en git)
├── credentials.example.json    # Template de credenciales
└── [archivos de configuración] # package.json, vite.config.ts, etc.
```

---

## 📂 Descripción Detallada de Carpetas

---

### 🐍 `/backend` - Backend de Python

**Propósito:** Contiene toda la lógica del servidor backend que procesa la anonimización de datos.

**Tecnologías:**
- FastAPI (framework web)
- Python 3.8+
- Pandas (procesamiento de datos)
- PostgreSQL (base de datos)
- psycopg2 (cliente PostgreSQL)

**Contenido:**

```
backend/
├── main.py              # Aplicación principal FastAPI
├── database.py          # Capa de conexión a PostgreSQL
├── requirements.txt     # Dependencias de Python
├── start.sh            # Script de inicio (Linux/Mac)
├── start.bat           # Script de inicio (Windows)
├── sample_dataset.csv  # Dataset de ejemplo
├── README.md           # Documentación del backend
└── venv/               # Entorno virtual (generado, no en git)
```

**Archivos importantes:**

- **`main.py`** - Archivo principal del backend
  - Define todos los endpoints de la API
  - Implementa algoritmos de anonimización
  - Maneja subida de archivos
  - Se conecta a PostgreSQL via database.py

  **Endpoints principales:**
  - `GET /` - Estado del servidor
  - `POST /api/datasets/upload` - Subir dataset
  - `GET /api/datasets` - Listar datasets
  - `POST /api/configs` - Crear configuración
  - `POST /api/process` - Procesar anonimización
  - `GET /api/results` - Obtener resultados

- **`database.py`** - Capa de acceso a datos
  - Pool de conexiones a PostgreSQL
  - Funciones CRUD (Create, Read, Update, Delete)
  - Manejo de transacciones
  - Lee credenciales de credentials.json

- **`requirements.txt`** - Dependencias del proyecto
  ```
  fastapi
  uvicorn
  pandas
  numpy
  python-multipart
  openpyxl
  psycopg2-binary
  python-dotenv
  ```

- **`start.sh` / `start.bat`** - Scripts de inicio automático
  - Verifican Python instalado
  - Crean entorno virtual
  - Instalan dependencias
  - Inician servidor

- **`sample_dataset.csv`** - Datos de ejemplo
  - 20 registros de prueba
  - Usado para demostración

**Cuándo modificar:**
- ✏️ Agregar nuevas técnicas de anonimización → Edita `main.py`
- ✏️ Agregar nuevos endpoints → Edita `main.py`
- ✏️ Cambiar puerto del servidor → Edita `credentials.json`
- ✏️ Agregar nuevas dependencias → Actualiza `requirements.txt`
- ✏️ Cambiar validaciones de archivos → Edita función `upload_dataset()`
- ✏️ Modificar queries de base de datos → Edita `database.py`

**NO modificar:**
- ❌ `venv/` - Se genera automáticamente
- ❌ `__pycache__/` - Caché de Python

---

### 🗄️ `/database` - Scripts SQL

**Propósito:** Contiene todos los scripts SQL necesarios para crear, mantener y gestionar la base de datos PostgreSQL.

**Contenido:**

```
database/
├── create_database.sql  # Script para crear todas las tablas
├── drop_database.sql    # Script para eliminar todas las tablas
└── README.md            # Guía de gestión de BD
```

**Archivos importantes:**

- **`create_database.sql`** - Script de creación completo
  - Crea todas las tablas (datasets, anonymization_configs, etc.)
  - Define índices para mejorar rendimiento
  - Agrega comentarios descriptivos
  - Habilita extensión uuid-ossp

- **`drop_database.sql`** - Script de limpieza
  - ⚠️ PELIGRO: Elimina todas las tablas
  - Respeta orden de foreign keys
  - Solo usar en desarrollo

- **`README.md`** - Documentación completa
  - Instalación de PostgreSQL
  - Creación de base de datos
  - Comandos útiles de psql
  - Backup y restauración
  - Solución de problemas

**Cuándo modificar:**
- ✏️ Agregar nueva tabla → Edita `create_database.sql`
- ✏️ Agregar columna a tabla existente → Crea nuevo script de migración
- ✏️ Cambiar estructura de datos → Edita `create_database.sql`

**NO modificar si ya tienes datos:**
- ⚠️ No ejecutes `drop_database.sql` en producción
- ⚠️ Haz backup antes de modificar estructura

---

### ⚛️ `/src` - Código Fuente del Frontend

**Propósito:** Contiene todo el código del frontend React/TypeScript.

**Tecnologías:**
- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS
- Lucide React (iconos)

**Contenido:**

```
src/
├── components/          # Componentes reutilizables
│   └── Layout.tsx       # Layout principal
├── pages/               # Páginas de la aplicación
│   ├── HomePage.tsx     # Página de inicio
│   ├── UploadPage.tsx   # Subir datasets
│   ├── ConfigurePage.tsx # Configurar anonimización
│   ├── ResultsPage.tsx  # Ver resultados
│   └── DocsPage.tsx     # Documentación
├── App.tsx              # Componente raíz
├── main.tsx             # Punto de entrada
├── index.css            # Estilos globales
└── vite-env.d.ts        # Tipos de Vite
```

**Estructura de componentes:**

#### `/src/components` - Componentes Reutilizables

- **`Layout.tsx`** - Layout principal de la aplicación
  - Sidebar de navegación
  - Header
  - Contenedor del contenido
  - Gestión de navegación entre páginas

**Cuándo modificar:**
- ✏️ Cambiar diseño global → Edita `Layout.tsx`
- ✏️ Agregar nuevo componente reutilizable → Crea archivo en `components/`

#### `/src/pages` - Páginas de la Aplicación

- **`HomePage.tsx`** - Dashboard principal
  - Muestra estadísticas generales
  - Lista datasets recientes
  - Acceso rápido a funciones

- **`UploadPage.tsx`** - Subida de datasets
  - Drag & drop de archivos
  - Vista previa de datos
  - Soporte para CSV y Excel

- **`ConfigurePage.tsx`** - Configuración de anonimización
  - Clasificación de columnas
  - Selección de técnicas
  - Configuración de parámetros (K, L, epsilon)

- **`ResultsPage.tsx`** - Visualización de resultados
  - Comparación antes/después
  - Métricas de privacidad
  - Descarga de datos anonimizados

- **`DocsPage.tsx`** - Documentación integrada
  - Guía de uso
  - Explicación de técnicas
  - Ejemplos

**Cuándo modificar:**
- ✏️ Agregar nueva funcionalidad → Edita página correspondiente
- ✏️ Cambiar UI/UX → Edita componentes de página
- ✏️ Agregar nueva página → Crea archivo en `pages/` y actualiza `App.tsx`

#### Archivos raíz de `/src`

- **`App.tsx`** - Componente principal
  - Gestión de rutas (cliente)
  - Estado global de navegación
  - Renderiza páginas según ruta actual

- **`main.tsx`** - Punto de entrada
  - Monta la aplicación React
  - Configuración inicial

- **`index.css`** - Estilos globales
  - Configuración de Tailwind CSS
  - Reset CSS
  - Variables globales

**NO modificar:**
- ❌ `vite-env.d.ts` - Generado automáticamente

---

### 📦 `/dist` - Build de Producción

**Propósito:** Contiene la versión compilada y optimizada del frontend.

**Generado por:** `npm run build`

**Contenido:**
```
dist/
├── index.html           # HTML principal
├── assets/              # CSS y JS compilados
│   ├── index-[hash].js  # JavaScript minificado
│   └── index-[hash].css # CSS minificado
└── [otros archivos]     # Favicon, imágenes, etc.
```

**Cuándo se genera:**
- Automáticamente al ejecutar `npm run build`
- Antes de hacer deploy a producción

**NO modificar manualmente:**
- ❌ Nunca edites archivos en `dist/`
- ❌ Esta carpeta se regenera cada build
- ❌ Excluida de git (ver `.gitignore`)

---

### 📚 `/node_modules` - Dependencias de Node.js

**Propósito:** Contiene todas las dependencias del frontend instaladas por npm.

**Generado por:** `npm install`

**Tamaño:** ~200-300 MB

**NO modificar:**
- ❌ Nunca edites archivos aquí
- ❌ Excluida de git (ver `.gitignore`)
- ❌ Se regenera con `npm install`

---

## 📄 Archivos de Configuración Raíz

### Credenciales y Configuración

- **`credentials.json`** - Credenciales del sistema (NO en git)
  - Conexión a PostgreSQL
  - Configuración del backend
  - Configuración del frontend
  - Ver `CREDENTIALS_SETUP.md` para guía completa

- **`credentials.example.json`** - Template de credenciales
  - Ejemplo de estructura
  - En git como referencia

- **`.env`** - Variables de entorno (NO en git)
  - Variables para desarrollo local
  - URL del backend

- **`.env.example`** - Template de .env
  - Ejemplo de variables
  - En git como referencia

### Configuración de Node.js

- **`package.json`** - Dependencias y scripts del frontend
  ```json
  {
    "scripts": {
      "dev": "vite",          // Servidor de desarrollo
      "build": "vite build",  // Build de producción
      "preview": "vite preview" // Preview del build
    }
  }
  ```

- **`package-lock.json`** - Versiones exactas de dependencias
  - Generado automáticamente
  - Asegura builds reproducibles

### Configuración de TypeScript

- **`tsconfig.json`** - Configuración principal de TypeScript
- **`tsconfig.app.json`** - Configuración para la aplicación
- **`tsconfig.node.json`** - Configuración para scripts de Node

### Configuración de Vite

- **`vite.config.ts`** - Configuración de Vite
  - Plugins (React)
  - Alias de rutas
  - Configuración de build

### Configuración de Tailwind CSS

- **`tailwind.config.js`** - Configuración de Tailwind
  - Colores personalizados
  - Breakpoints
  - Plugins

- **`postcss.config.js`** - Configuración de PostCSS
  - Autoprefixer
  - Tailwind CSS

### Configuración de ESLint

- **`eslint.config.js`** - Configuración de linter
  - Reglas de código
  - Plugins de React

### Otros

- **`.gitignore`** - Archivos ignorados por Git
  - `node_modules/`
  - `dist/`
  - `.env`
  - `credentials.json`

- **`index.html`** - Punto de entrada HTML
  - Carga el JavaScript de React
  - Configuración de meta tags

---

## 📋 Archivos de Documentación

- **`README.md`** - Guía general del proyecto
- **`POSTGRESQL_SETUP.md`** - Instalación de PostgreSQL
- **`CREDENTIALS_SETUP.md`** - Configuración de credenciales
- **`FOLDERS.md`** - Este archivo
- **`PROJECT_STRUCTURE.md`** - Estructura detallada
- **`DEPLOY_UBUNTU.md`** - Deploy en Ubuntu
- **`START_BACKEND.md`** - Iniciar backend

---

## 🎯 Resumen Rápido

### ¿Dónde modificar según tu necesidad?

| Necesito... | Modificar... |
|------------|-------------|
| Agregar nueva técnica de anonimización | `backend/main.py` |
| Cambiar diseño del frontend | `src/pages/*.tsx`, `src/components/*.tsx` |
| Agregar nueva página | `src/pages/NuevaPagina.tsx` y `src/App.tsx` |
| Cambiar estructura de base de datos | `database/create_database.sql` |
| Agregar endpoint a la API | `backend/main.py` |
| Cambiar puerto del backend | `credentials.json` |
| Cambiar conexión a PostgreSQL | `credentials.json` |
| Agregar dependencia Python | `backend/requirements.txt` |
| Agregar dependencia Node.js | `npm install paquete` |

### ¿Qué NUNCA tocar?

| Carpeta/Archivo | Razón |
|----------------|-------|
| `node_modules/` | Generado automáticamente |
| `dist/` | Build generado |
| `venv/` | Entorno virtual Python |
| `__pycache__/` | Caché de Python |
| `package-lock.json` | Generado por npm |

---

**¡Ahora sabes qué hace cada carpeta del proyecto! 📚**
