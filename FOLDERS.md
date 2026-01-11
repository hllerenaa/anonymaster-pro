# 📁 Explicación de Carpetas del Proyecto

Esta guía explica qué contiene cada carpeta del proyecto, su propósito, y cuándo modificar su contenido.

---

## 🌲 Árbol de Directorios

```
data-anonymization-system/
│
├── backend/                    # Backend de Python (FastAPI)
├── dist/                       # Build de producción (generado)
├── node_modules/               # Dependencias de Node.js (generado)
├── src/                        # Código fuente del frontend (React)
│   ├── components/             # Componentes reutilizables
│   ├── contexts/               # Contextos de React
│   ├── lib/                    # Librerías y utilidades
│   └── pages/                  # Páginas de la aplicación
├── supabase/                   # Configuración de base de datos
│   └── migrations/             # Migraciones SQL
├── .bolt/                      # Configuración de Bolt (IDE)
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
- Supabase (cliente de base de datos)

**Contenido:**

```
backend/
├── main.py              # Aplicación principal FastAPI
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
  - Se conecta a Supabase

  **Endpoints principales:**
  - `GET /` - Estado del servidor
  - `POST /api/datasets/upload` - Subir dataset
  - `GET /api/datasets` - Listar datasets
  - `POST /api/configs` - Crear configuración
  - `POST /api/process` - Procesar anonimización
  - `GET /api/results` - Obtener resultados

- **`requirements.txt`** - Dependencias del proyecto
  ```
  fastapi
  uvicorn
  pandas
  numpy
  python-multipart
  openpyxl
  supabase
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
- ✏️ Cambiar puerto del servidor → Edita `main.py` (última línea)
- ✏️ Agregar nuevas dependencias → Actualiza `requirements.txt`
- ✏️ Cambiar validaciones de archivos → Edita función `upload_dataset()`

**NO modificar:**
- ❌ `venv/` - Se genera automáticamente
- ❌ `__pycache__/` - Archivos cache de Python

---

### ⚛️ `/src` - Código Fuente del Frontend

**Propósito:** Contiene toda la interfaz de usuario de React.

**Tecnologías:**
- React 18
- TypeScript
- Tailwind CSS
- Supabase JS Client

**Contenido:**

```
src/
├── components/          # Componentes reutilizables
│   ├── Auth.tsx        # Componente de autenticación
│   └── Layout.tsx      # Layout principal
├── contexts/           # Contextos de React
│   └── AuthContext.tsx # Contexto de autenticación
├── lib/                # Librerías y configuración
│   └── supabase.ts     # Cliente de Supabase
├── pages/              # Páginas de la aplicación
│   ├── HomePage.tsx    # Página de inicio
│   ├── UploadPage.tsx  # Subir datasets
│   ├── ConfigurePage.tsx # Configurar anonimización
│   ├── ResultsPage.tsx # Ver resultados
│   └── DocsPage.tsx    # Documentación
├── App.tsx             # Componente principal y router
├── main.tsx            # Punto de entrada
├── index.css           # Estilos globales
└── vite-env.d.ts       # Tipos de TypeScript
```

**Cuándo modificar:**
- ✏️ Cambiar diseño → Edita archivos en `/pages` o `/components`
- ✏️ Agregar nueva página → Crea archivo en `/pages`, actualiza `App.tsx`
- ✏️ Cambiar colores/estilos → Edita `index.css` o `tailwind.config.js`
- ✏️ Agregar autenticación → Modifica `AuthContext.tsx`

---

### 🧩 `/src/components` - Componentes Reutilizables

**Propósito:** Componentes de UI que se usan en múltiples lugares.

**Archivos:**

- **`Layout.tsx`** - Layout principal de la aplicación
  - Barra de navegación superior
  - Menú de navegación
  - Estructura base de la página
  - Footer

- **`Auth.tsx`** - Componente de autenticación (actualmente no usado)
  - Formularios de login/registro
  - Integración con Supabase Auth

**Cuándo modificar:**
- ✏️ Cambiar navegación → Edita `Layout.tsx`
- ✏️ Agregar nuevo componente → Crea nuevo archivo `.tsx`
- ✏️ Activar autenticación → Usa `Auth.tsx`

**Mejores prácticas:**
- Componentes pequeños y enfocados
- Reutilizables en múltiples páginas
- Props bien tipadas con TypeScript
- Nombres descriptivos

---

### 🧠 `/src/contexts` - Contextos de React

**Propósito:** Gestión de estado global de la aplicación.

**Archivos:**

- **`AuthContext.tsx`** - Contexto de autenticación
  - Estado del usuario actual
  - Funciones de login/logout/signup
  - Sesión de Supabase
  - Protección de rutas

**Cuándo modificar:**
- ✏️ Agregar más información del usuario → Edita `AuthContext.tsx`
- ✏️ Crear nuevo contexto global → Crea nuevo archivo
- ✏️ Cambiar lógica de autenticación → Modifica funciones en `AuthContext.tsx`

**Ejemplo de nuevo contexto:**
```typescript
// ThemeContext.tsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

---

### 📚 `/src/lib` - Librerías y Utilidades

**Propósito:** Configuración de servicios externos y funciones utilitarias.

**Archivos:**

- **`supabase.ts`** - Cliente de Supabase
  - Inicialización del cliente
  - Usa variables de entorno
  - Exporta instancia única

**Cuándo modificar:**
- ✏️ Configurar Supabase → Ya está configurado, solo cambia `.env`
- ✏️ Agregar nuevo servicio → Crea nuevo archivo (ej: `analytics.ts`)
- ✏️ Crear funciones utilitarias → Crea archivo (ej: `utils.ts`)

**Ejemplos de utilidades comunes:**
```typescript
// utils.ts
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-ES');
}

export function formatFileSize(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}
```

---

### 📄 `/src/pages` - Páginas de la Aplicación

**Propósito:** Componentes de página completa, cada uno corresponde a una ruta.

**Archivos:**

1. **`HomePage.tsx`** - Página de inicio
   - Bienvenida
   - Descripción de características
   - Llamados a la acción

2. **`UploadPage.tsx`** - Subir datasets
   - Drag & drop de archivos
   - Lista de datasets
   - Previsualización

3. **`ConfigurePage.tsx`** - Configurar anonimización
   - Wizard de 3 pasos
   - Mapeo de columnas
   - Selección de técnicas
   - Parámetros de privacidad

4. **`ResultsPage.tsx`** - Ver resultados
   - Métricas de privacidad
   - Comparación antes/después
   - Descarga de datos

5. **`DocsPage.tsx`** - Documentación
   - Guía de uso
   - Explicación de técnicas
   - FAQ

**Cuándo modificar:**
- ✏️ Cambiar contenido de página → Edita el archivo correspondiente
- ✏️ Agregar nueva página → Crea nuevo archivo, actualiza rutas en `App.tsx`
- ✏️ Modificar flujo de usuario → Ajusta lógica en las páginas

---

### 🗄️ `/supabase` - Base de Datos

**Propósito:** Gestión de esquema y migraciones de base de datos.

**Contenido:**

```
supabase/
└── migrations/
    ├── 20260111031149_create_anonymization_tables.sql
    └── 20260111032300_update_policies_for_public_access.sql
```

**Archivos:**

1. **`create_anonymization_tables.sql`** - Migración inicial
   - Crea tablas: datasets, configs, results, audit
   - Define estructuras y tipos
   - Crea índices
   - Habilita RLS

2. **`update_policies_for_public_access.sql`** - Políticas de acceso
   - Configura Row Level Security
   - Permite acceso público sin autenticación

**Cuándo modificar:**
- ✏️ Cambiar estructura de tablas → Crea nueva migración
- ✏️ Agregar nueva tabla → Crea nueva migración
- ✏️ Cambiar políticas de seguridad → Crea nueva migración

**Crear nueva migración:**
```bash
# Formato de nombre: [timestamp]_[descripcion].sql
supabase migration new add_description_column
```

**Ejemplo de migración:**
```sql
/*
  # Add description column

  1. Changes
    - Add description to datasets table
*/

ALTER TABLE datasets ADD COLUMN IF NOT EXISTS description text DEFAULT '';
```

**NO modificar:**
- ❌ Migraciones existentes ya aplicadas
- ❌ Siempre crear nuevas migraciones para cambios

---

### 📦 `/dist` - Build de Producción

**Propósito:** Archivos compilados listos para producción.

**Contenido:**
```
dist/
├── index.html           # HTML principal
├── assets/              # JS, CSS, imágenes optimizadas
│   ├── index-[hash].js
│   └── index-[hash].css
└── _redirects           # Configuración de rutas (SPA)
```

**Características:**
- ✅ Código minificado
- ✅ Assets optimizados
- ✅ Nombres con hash para cache busting
- ✅ Listo para servir con Nginx

**Generado por:** `npm run build`

**NO modificar manualmente:**
- ❌ Cualquier archivo en `/dist`
- ❌ Se regenera cada vez que ejecutas build

**Cuándo regenerar:**
```bash
# Después de cualquier cambio en el código
npm run build
```

---

### 📚 `/node_modules` - Dependencias de Node.js

**Propósito:** Bibliotecas y dependencias de JavaScript instaladas.

**Tamaño:** Puede ser muy grande (100-500 MB)

**Generado por:** `npm install`

**NO modificar nunca:**
- ❌ Cualquier archivo dentro de `/node_modules`
- ❌ Se regenera con `npm install`
- ❌ No se sube a git (está en `.gitignore`)

**Cuándo regenerar:**
```bash
# Si falta o está corrupto
rm -rf node_modules
npm install
```

---

### 🔧 `/.bolt` - Configuración del IDE

**Propósito:** Configuración específica de Bolt (IDE basado en navegador).

**Contenido:**
```
.bolt/
├── config.json          # Configuración del proyecto
└── prompt              # Instrucciones del sistema
```

**NO modificar a menos que:**
- ✏️ Necesites cambiar configuración específica de Bolt
- ✏️ Estés experimentando con prompts del sistema

---

## 📋 Resumen de Cuándo Modificar Cada Carpeta

| Carpeta | Modificar cuando... | NO modificar |
|---------|---------------------|--------------|
| `/backend` | Cambiar lógica de servidor, agregar endpoints | `venv/`, cache |
| `/src/components` | Crear componentes reutilizables | - |
| `/src/contexts` | Agregar estado global | - |
| `/src/lib` | Configurar servicios, crear utilidades | - |
| `/src/pages` | Modificar páginas existentes o crear nuevas | - |
| `/supabase/migrations` | Cambiar estructura de BD | Migraciones aplicadas |
| `/dist` | NUNCA (se regenera automáticamente) | TODO |
| `/node_modules` | NUNCA (se instala automáticamente) | TODO |
| `/.bolt` | Raramente, solo config avanzada | - |

---

## 🔍 Cómo Encontrar Qué Modificar

### Quiero cambiar el diseño de una página
👉 Ve a `/src/pages/[nombre]Page.tsx`

### Quiero agregar una nueva técnica de anonimización
👉 Ve a `/backend/main.py` → función `apply_techniques()`

### Quiero cambiar la navegación
👉 Ve a `/src/components/Layout.tsx`

### Quiero agregar una nueva página
👉 Crea archivo en `/src/pages/` y actualiza `/src/App.tsx`

### Quiero cambiar la estructura de la base de datos
👉 Crea nueva migración en `/supabase/migrations/`

### Quiero cambiar los colores del tema
👉 Ve a `tailwind.config.js` o `/src/index.css`

### Quiero agregar una nueva dependencia
👉 `npm install nombre-paquete` (actualiza `package.json`)

### Quiero cambiar el puerto del backend
👉 Ve a `/backend/main.py` → última línea

---

## 💡 Consejos de Organización

1. **Mantén componentes pequeños** - Si un componente supera 300 líneas, considera dividirlo

2. **Usa nombres descriptivos** - `UserProfileCard.tsx` es mejor que `Card.tsx`

3. **Agrupa por funcionalidad** - Si tienes muchos componentes relacionados con gráficos, crea `/src/components/charts/`

4. **Comenta código complejo** - Especialmente algoritmos de anonimización

5. **No dupliques código** - Si ves el mismo código en varios lugares, crea una utilidad

6. **Sigue convenciones** - Mantén el mismo estilo que el código existente

---

## 📚 Recursos Adicionales

- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **FastAPI:** https://fastapi.tiangolo.com
- **Supabase:** https://supabase.com/docs

---

**¡Ahora entiendes perfectamente la estructura del proyecto! 🎉**
