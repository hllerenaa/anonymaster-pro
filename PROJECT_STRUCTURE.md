# 📁 Estructura del Proyecto - Guía Completa

Esta guía explica la estructura completa del proyecto, qué hace cada archivo y carpeta, y dónde realizar modificaciones comunes.

## 📂 Estructura General

```
project/
├── backend/                    # Backend de Python (API y procesamiento)
├── dist/                       # Archivos compilados para producción
├── src/                        # Código fuente del frontend (React)
├── supabase/                   # Migraciones de base de datos
├── node_modules/               # Dependencias de Node.js (generado)
├── package.json                # Configuración y dependencias del frontend
├── vite.config.ts             # Configuración de Vite (bundler)
├── tsconfig.json              # Configuración de TypeScript
├── tailwind.config.js         # Configuración de Tailwind CSS
└── README.md                   # Documentación principal
```

---

## 🐍 Backend (Carpeta `/backend`)

### `backend/main.py`
**Qué es:** Aplicación principal del backend FastAPI.

**Qué hace:**
- Define todos los endpoints de la API
- Procesa la anonimización de datos
- Implementa algoritmos de K-Anonimato, L-Diversidad, y Privacidad Diferencial
- Maneja subida de archivos Excel/CSV
- Se conecta a Supabase para almacenar datos

**Endpoints principales:**
- `POST /api/datasets/upload` - Subir datasets
- `GET /api/datasets` - Listar datasets
- `POST /api/configs` - Crear configuración de anonimización
- `POST /api/process` - Procesar anonimización
- `GET /api/results` - Obtener resultados

**Modificar para:**
- Agregar nuevas técnicas de anonimización (busca `apply_techniques`)
- Cambiar algoritmos de procesamiento
- Agregar nuevos endpoints
- Modificar validaciones de archivos

**Funciones clave:**
- `upload_dataset()` - Maneja la subida de archivos
- `apply_techniques()` - Aplica técnicas de anonimización
- `calculate_k_anonymity()` - Calcula K-Anonimato
- `generalize_numeric()` - Generaliza datos numéricos
- `apply_differential_privacy()` - Aplica ruido diferencial

### `backend/requirements.txt`
**Qué es:** Lista de dependencias de Python.

**Dependencias principales:**
- `fastapi` - Framework web
- `pandas` - Procesamiento de datos
- `numpy` - Operaciones matemáticas
- `supabase` - Cliente de Supabase
- `openpyxl` - Lectura de archivos Excel

**Modificar para:**
- Agregar nuevas bibliotecas de Python
- Actualizar versiones de dependencias

### `backend/start.sh` y `backend/start.bat`
**Qué son:** Scripts para iniciar el backend automáticamente.

**Qué hacen:**
- Verifican que Python esté instalado
- Crean entorno virtual si no existe
- Instalan dependencias automáticamente
- Inician el servidor en el puerto 8000

**Modificar para:**
- Cambiar puerto del servidor
- Agregar variables de entorno
- Personalizar mensajes de inicio

### `backend/sample_dataset.csv`
**Qué es:** Dataset de ejemplo para probar la aplicación.

**Contiene:**
- 20 registros de ejemplo
- Columnas: id, name, age, zipcode, salary, medical_condition

**Modificar para:**
- Agregar más datos de ejemplo
- Cambiar tipos de datos

### `backend/README.md`
**Qué es:** Documentación específica del backend.

**Contiene:**
- Instrucciones de instalación
- Descripción de endpoints
- Guía de solución de problemas

---

## ⚛️ Frontend (Carpeta `/src`)

### `/src/main.tsx`
**Qué es:** Punto de entrada de la aplicación React.

**Qué hace:**
- Inicializa React
- Monta la aplicación en el DOM
- Configura el contexto de autenticación

**Modificar para:**
- Agregar providers globales
- Configurar temas
- Agregar configuraciones globales

### `/src/App.tsx`
**Qué es:** Componente principal y router de la aplicación.

**Qué hace:**
- Define las rutas de la aplicación
- Maneja la navegación entre páginas
- Configura el layout principal

**Rutas definidas:**
- `/` - Página de inicio
- `/upload` - Subir datasets
- `/configure` - Configurar anonimización
- `/results` - Ver resultados
- `/docs` - Documentación

**Modificar para:**
- Agregar nuevas páginas/rutas
- Cambiar estructura de navegación
- Agregar rutas protegidas

### `/src/index.css`
**Qué es:** Estilos globales de la aplicación.

**Qué contiene:**
- Importación de Tailwind CSS
- Estilos base
- Variables CSS globales

**Modificar para:**
- Cambiar colores globales
- Agregar fuentes personalizadas
- Definir estilos base personalizados

---

## 📄 Páginas (Carpeta `/src/pages`)

### `/src/pages/HomePage.tsx`
**Qué es:** Página de inicio de la aplicación.

**Qué muestra:**
- Bienvenida al usuario
- Descripción de las características
- Llamados a la acción (CTAs)
- Estadísticas del sistema

**Modificar para:**
- Cambiar contenido de bienvenida
- Agregar secciones de marketing
- Modificar diseño de inicio

### `/src/pages/UploadPage.tsx`
**Qué es:** Página para subir datasets.

**Qué hace:**
- Permite drag & drop de archivos
- Valida archivos (CSV, Excel)
- Muestra lista de datasets subidos
- Permite previsualización de datos

**Modificar para:**
- Agregar más formatos de archivo
- Cambiar validaciones de tamaño
- Personalizar interfaz de subida

**API llamada:**
- `POST /api/datasets/upload`
- `GET /api/datasets`

### `/src/pages/ConfigurePage.tsx`
**Qué es:** Página para configurar la anonimización.

**Qué hace:**
- Wizard de 3 pasos:
  1. Mapeo de columnas (identificador, quasi-identificador, sensible)
  2. Selección de técnicas (generalización, supresión, etc.)
  3. Configuración de parámetros (K, L, epsilon)
- Guarda configuración en localStorage y base de datos

**Modificar para:**
- Agregar nuevas técnicas de anonimización
- Cambiar el flujo del wizard
- Agregar más parámetros configurables

**Tipos de columnas:**
- `identifier` - Identificadores directos (se eliminan)
- `quasi-identifier` - Identificadores indirectos (se generalizan)
- `sensitive` - Datos sensibles (se protegen)
- `non-sensitive` - Datos públicos (se mantienen)

**API llamada:**
- `POST /api/configs`
- `GET /api/configs`

### `/src/pages/ResultsPage.tsx`
**Qué es:** Página para ver resultados de anonimización.

**Qué muestra:**
- Métricas de privacidad (K-Anonimato, L-Diversidad)
- Pérdida de información
- Detalles de técnicas aplicadas
- Comparación antes/después
- Opción de descarga del dataset anonimizado

**Modificar para:**
- Agregar nuevas métricas
- Mejorar visualizaciones
- Agregar gráficos

**API llamada:**
- `GET /api/results/{id}`

### `/src/pages/DocsPage.tsx`
**Qué es:** Página de documentación integrada.

**Qué contiene:**
- Guía de uso paso a paso
- Explicación de técnicas de anonimización
- FAQ (Preguntas frecuentes)
- Ejemplos prácticos

**Modificar para:**
- Agregar más documentación
- Actualizar ejemplos
- Agregar videos o imágenes tutoriales

---

## 🧩 Componentes (Carpeta `/src/components`)

### `/src/components/Layout.tsx`
**Qué es:** Componente de layout principal.

**Qué contiene:**
- Barra de navegación superior
- Menú de navegación
- Contenedor de contenido
- Footer (pie de página)

**Modificar para:**
- Cambiar diseño de navegación
- Agregar sidebar
- Personalizar header/footer

### `/src/components/Auth.tsx`
**Qué es:** Componente de autenticación (actualmente no se usa, acceso público).

**Qué hace:**
- Formularios de login/registro
- Integración con Supabase Auth

**Modificar para:**
- Activar autenticación
- Personalizar formularios
- Agregar OAuth providers

---

## 🔧 Contextos (Carpeta `/src/contexts`)

### `/src/contexts/AuthContext.tsx`
**Qué es:** Contexto de React para manejar autenticación.

**Qué provee:**
- Estado del usuario actual
- Funciones de login/logout
- Sesión de Supabase

**Modificar para:**
- Agregar más información del usuario
- Personalizar flujo de autenticación
- Agregar roles y permisos

---

## 🗄️ Base de Datos (Carpeta `/supabase`)

### `/supabase/migrations/20260111031149_create_anonymization_tables.sql`
**Qué es:** Migración inicial de la base de datos.

**Qué crea:**
- Tabla `datasets` - Almacena datasets subidos
- Tabla `anonymization_configs` - Configuraciones guardadas
- Tabla `anonymization_results` - Resultados de procesamiento
- Tabla `audit_logs` - Registro de auditoría

**Modificar para:**
- Agregar nuevas tablas
- Modificar estructura de tablas existentes

### `/supabase/migrations/20260111032300_update_policies_for_public_access.sql`
**Qué es:** Migración para configurar acceso público.

**Qué hace:**
- Configura políticas RLS (Row Level Security)
- Permite acceso público a todos los datos
- Habilita operaciones sin autenticación

**Modificar para:**
- Restringir acceso a datos
- Implementar autenticación obligatoria
- Agregar control de permisos

---

## 🛠️ Configuración

### `package.json`
**Qué es:** Configuración del proyecto Node.js.

**Qué contiene:**
- Dependencias del frontend (React, Supabase, etc.)
- Scripts de desarrollo y build
- Metadatos del proyecto

**Scripts disponibles:**
- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Previsualiza build de producción
- `npm run lint` - Ejecuta linter

**Modificar para:**
- Agregar nuevas dependencias
- Crear scripts personalizados

### `vite.config.ts`
**Qué es:** Configuración de Vite (bundler).

**Qué configura:**
- Puerto del servidor de desarrollo
- Plugins de React
- Alias de rutas
- Configuración de build

**Modificar para:**
- Cambiar puerto del dev server
- Agregar plugins
- Configurar proxy

### `tsconfig.json`
**Qué es:** Configuración de TypeScript.

**Qué define:**
- Opciones del compilador
- Rutas de módulos
- Tipos incluidos

**Modificar para:**
- Cambiar target de JavaScript
- Agregar paths personalizados
- Configurar strictness

### `tailwind.config.js`
**Qué es:** Configuración de Tailwind CSS.

**Qué define:**
- Colores personalizados
- Breakpoints responsive
- Extensiones de utilidades

**Modificar para:**
- Agregar colores del tema
- Personalizar spacing
- Agregar fuentes

### `.env`
**Qué es:** Variables de entorno (NO subir a git).

**Qué contiene:**
- `VITE_SUPABASE_URL` - URL de Supabase
- `VITE_SUPABASE_ANON_KEY` - Clave anónima de Supabase

**Modificar para:**
- Agregar nuevas variables de entorno
- Configurar diferentes entornos

---

## 📦 Carpeta `/dist`

**Qué es:** Archivos compilados para producción (generados automáticamente).

**Contiene:**
- HTML, CSS, JS minificados
- Assets optimizados
- Archivos listos para deploy

**NO modificar directamente.** Se regenera con `npm run build`.

---

## 🚀 Archivos de Documentación

### `README.md`
**Guía principal del proyecto** - Inicio rápido y solución de problemas.

### `START_BACKEND.md`
**Guía detallada para iniciar el backend** - Instrucciones paso a paso.

### `PROJECT_STRUCTURE.md` (este archivo)
**Explicación de la estructura del proyecto** - Qué hace cada archivo.

### `DEPLOY_UBUNTU.md`
**Guía de deploy en Ubuntu** - Cómo llevar la app a producción.

---

## 🔍 ¿Dónde Modificar Según Tu Necesidad?

### Quiero cambiar el diseño/colores
- Modifica: `tailwind.config.js` (colores del tema)
- Modifica: Componentes en `/src/components` y páginas en `/src/pages`

### Quiero agregar una nueva técnica de anonimización
- Modifica: `backend/main.py` → función `apply_techniques()`
- Modifica: `/src/pages/ConfigurePage.tsx` → opciones de técnicas

### Quiero cambiar la estructura de la base de datos
- Crea: Nueva migración en `/supabase/migrations/`
- Aplica: Con Supabase CLI o herramienta de gestión

### Quiero agregar una nueva página
- Crea: Archivo en `/src/pages/`
- Modifica: `/src/App.tsx` → agregar ruta

### Quiero cambiar el puerto del backend
- Modifica: `backend/main.py` → última línea `uvicorn.run(..., port=8000)`
- Modifica: Scripts de inicio si es necesario

### Quiero agregar autenticación obligatoria
- Modifica: `backend/main.py` → función `get_current_user()`
- Modifica: `/src/contexts/AuthContext.tsx` → lógica de sesión
- Modifica: Políticas RLS en Supabase

### Quiero cambiar validaciones de archivos
- Modifica: `backend/main.py` → función `upload_dataset()`
- Busca: Línea con validación de extensiones y tamaño

---

## 💡 Consejos

1. **Antes de modificar:** Lee el código del archivo para entender su estructura
2. **Usa búsqueda:** Busca palabras clave en el proyecto (Ctrl+Shift+F en VSCode)
3. **Prueba cambios:** Siempre prueba en desarrollo antes de producción
4. **Commits frecuentes:** Guarda cambios pequeños e incrementales
5. **Consulta logs:** Revisa consola del navegador y terminal del backend

---

## 🐛 Debugging

### Frontend (React)
- Abre DevTools del navegador (F12)
- Revisa Console para errores
- Usa React DevTools para inspeccionar componentes

### Backend (Python)
- Revisa terminal donde corre el backend
- Logs aparecen automáticamente
- Visita http://localhost:8000/docs para probar endpoints

---

¿Necesitas modificar algo específico? Usa esta guía para encontrar el archivo correcto.
