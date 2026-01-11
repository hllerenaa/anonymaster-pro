# 🔒 Sistema de Anonimización de Datos

Sistema completo para anonimizar datasets sensibles aplicando técnicas de privacidad como K-Anonimato, L-Diversidad y Privacidad Diferencial.

---

## ✨ Características

- 📊 **Subida de Datasets**: Soporte para CSV, Excel (.xlsx, .xls)
- 🔐 **Múltiples Técnicas**: K-Anonimato, L-Diversidad, Privacidad Diferencial
- 🎯 **Configuración Flexible**: Clasifica columnas por tipo de sensibilidad
- 📈 **Métricas de Privacidad**: Calcula pérdida de información y garantías de privacidad
- 💾 **Persistencia**: Guarda datasets, configuraciones y resultados
- 📥 **Exportación**: Descarga datos anonimizados
- 📝 **Auditoría**: Registro completo de todas las operaciones

---

## 🏗️ Arquitectura

### Frontend
- **Framework**: React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Build**: Vite

### Backend
- **Framework**: FastAPI (Python)
- **Procesamiento**: Pandas + NumPy
- **Base de Datos**: PostgreSQL local
- **Servidor**: Uvicorn

### Base de Datos
- **Sistema**: PostgreSQL 15+
- **Conexión**: psycopg2
- **Pool**: SimpleConnectionPool
- **Configuración**: credentials.json

---

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Python 3.8+
- PostgreSQL 12+

---

## 🚀 Instalación Rápida

### 1. Clonar Repositorio

```bash
git clone <repository-url>
cd data-anonymization-system
```

### 2. Instalar PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Descargar desde: https://www.postgresql.org/download/windows/

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

Ver guía completa: [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)

### 3. Crear Base de Datos

```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE data_anonymization;
\q

# Crear tablas
psql -U postgres -d data_anonymization -f database/create_database.sql
```

### 4. Configurar Credenciales

```bash
# Copiar template
cp credentials.example.json credentials.json

# Editar con tus credenciales
nano credentials.json
```

Configurar:
```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "tu_contraseña",
    "database": "data_anonymization"
  }
}
```

Ver guía completa: [CREDENTIALS_SETUP.md](CREDENTIALS_SETUP.md)

### 5. Instalar Dependencias

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows

pip install -r requirements.txt
```

### 6. Iniciar Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Abrir navegador en: http://localhost:5173

---

## 📖 Documentación Completa

### Guías de Configuración
- 📘 [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) - Instalación y configuración de PostgreSQL
- 🔑 [CREDENTIALS_SETUP.md](CREDENTIALS_SETUP.md) - Configuración del archivo credentials.json
- 🗄️ [database/README.md](database/README.md) - Gestión de la base de datos

### Guías de Estructura
- 📂 [FOLDERS.md](FOLDERS.md) - Explicación de cada carpeta del proyecto
- 📋 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Estructura detallada de archivos

### Guías de Deployment
- 🐧 [DEPLOY_UBUNTU.md](DEPLOY_UBUNTU.md) - Deploy en Ubuntu Server
- 🚀 [START_BACKEND.md](START_BACKEND.md) - Iniciar backend

---

## 🎯 Uso

### 1. Subir Dataset

1. Click en "Upload Dataset"
2. Seleccionar archivo CSV o Excel
3. Ver previsualización de datos

### 2. Configurar Anonimización

1. Seleccionar dataset
2. Click en "Configure"
3. Clasificar cada columna:
   - **Identifier**: Datos únicos (ID, email, SSN) → Se eliminan
   - **Quasi-identifier**: Datos que combinados pueden identificar (edad, código postal) → Se generalizan
   - **Sensitive**: Datos sensibles (salario, enfermedad) → Se protegen con L-Diversidad
   - **Non-sensitive**: Datos no sensibles → No se modifican

4. Seleccionar técnicas:
   - **Generalization**: Agrupar valores en rangos/categorías
   - **Suppression**: Ocultar valores aleatoriamente
   - **Differential Privacy**: Agregar ruido estadístico

5. Configurar parámetros:
   - **K**: Cada grupo debe tener mínimo K registros
   - **L**: Cada grupo debe tener mínimo L valores sensibles distintos
   - **Epsilon**: Cantidad de ruido (menor = más privacidad)

### 3. Procesar Dataset

1. Click en "Process"
2. Ver progreso de procesamiento
3. Revisar métricas de privacidad

### 4. Ver Resultados

1. Comparar datos originales vs anonimizados
2. Revisar métricas:
   - K-Anonimato alcanzado
   - L-Diversidad alcanzada
   - Pérdida de información (%)
3. Descargar datos anonimizados

---

## 🗄️ Estructura de Base de Datos

### Tablas

**datasets**
- Almacena datasets subidos
- Campos: id, name, data, row_count, column_count, etc.

**anonymization_configs**
- Configuraciones de anonimización
- Campos: id, dataset_id, column_mappings, techniques, parameters

**anonymization_results**
- Resultados procesados
- Campos: id, dataset_id, config_id, anonymized_data, metrics

**audit_logs**
- Registro de auditoría
- Campos: id, user_id, action, resource_type, timestamp

Ver esquema completo en: [database/create_database.sql](database/create_database.sql)

---

## 🛠️ Desarrollo

### Comandos Útiles

```bash
# Frontend
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linter

# Backend
python main.py       # Iniciar servidor
python -m pytest     # Ejecutar tests (si existen)

# Base de Datos
psql -U postgres -d data_anonymization  # Conectar a BD
pg_dump -U postgres data_anonymization > backup.sql  # Backup
```

### Estructura del Código

```
src/
├── components/       # Componentes reutilizables
├── contexts/         # Contextos de React
├── lib/              # Utilidades y configuración
├── pages/            # Páginas de la aplicación
└── App.tsx           # Componente principal

backend/
├── main.py           # API FastAPI
├── database.py       # Conexión a PostgreSQL
└── requirements.txt  # Dependencias Python

database/
├── create_database.sql  # Script de creación
└── README.md            # Documentación de BD
```

---

## 🔒 Seguridad

### Mejores Prácticas

1. **Credenciales**
   - NUNCA subir `credentials.json` a git
   - Usar contraseñas seguras
   - Rotar credenciales periódicamente

2. **Base de Datos**
   - Crear usuario específico (no usar postgres)
   - Habilitar SSL en producción
   - Configurar firewall correctamente

3. **Backend**
   - Generar secret_key único
   - Validar entrada de usuarios
   - Limitar tamaño de archivos

4. **Producción**
   - Deshabilitar debug
   - Configurar CORS correctamente
   - Usar HTTPS

---

## 📊 Técnicas de Anonimización

### K-Anonimato
Garantiza que cada registro es indistinguible de al menos K-1 otros registros.

**Ejemplo:** Con K=5, cada combinación de edad+código postal aparece al menos 5 veces.

### L-Diversidad
Garantiza que cada grupo tiene al menos L valores sensibles distintos.

**Ejemplo:** Con L=3, cada grupo tiene al menos 3 salarios diferentes.

### Privacidad Diferencial
Agrega ruido calibrado para proteger privacidad individual mientras preserva estadísticas.

**Ejemplo:** Salario real 50,000 → Salario con ruido 50,247.

### Generalización
Reduce precisión agrupando valores en rangos o categorías.

**Ejemplo:**
- Edad 25 → Rango "20-30"
- Madrid → "España"

### Supresión
Oculta porcentaje de valores con "*".

**Ejemplo:** 10% de códigos postales se reemplazan por "*".

---

## 🧪 Testing

### Datos de Prueba

El proyecto incluye `backend/sample_dataset.csv` con 20 registros de ejemplo:
- Identificadores: id, email
- Quasi-identifiers: edad, código postal
- Sensitive: salario
- Non-sensitive: ciudad, país

### Probar Anonimización

1. Subir sample_dataset.csv
2. Configurar:
   - id, email → Identifier
   - edad, zipcode → Quasi-identifier
   - salario → Sensitive
   - ciudad, país → Non-sensitive
3. K=5, L=3
4. Procesar y revisar resultados

---

## 🚨 Solución de Problemas

### Backend no inicia

```bash
# Verificar PostgreSQL corriendo
sudo systemctl status postgresql

# Verificar credenciales.json existe
ls credentials.json

# Verificar dependencias instaladas
pip list | grep psycopg2
```

### Error de conexión a base de datos

```bash
# Verificar contraseña en credentials.json
# Verificar base de datos existe
psql -U postgres -l | grep data_anonymization

# Recrear base de datos si es necesario
psql -U postgres -f database/create_database.sql
```

### Frontend no carga datos

```bash
# Verificar backend está corriendo
curl http://localhost:8000

# Verificar CORS en credentials.json
# Debe incluir: "http://localhost:5173"
```

Ver más en [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) sección "Solución de Problemas"

---

## 📁 Archivos de Configuración

| Archivo | Propósito | Ubicación |
|---------|-----------|-----------|
| `credentials.json` | Credenciales del sistema | Raíz (no en git) |
| `credentials.example.json` | Template de credenciales | Raíz (en git) |
| `config.example.json` | Configuración de ejemplo | Raíz |
| `.env` | Variables de entorno | Raíz (no en git) |
| `.env.example` | Template de .env | Raíz (en git) |

---

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

## 📝 Licencia

Este proyecto está bajo licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

- FastAPI por el excelente framework
- React por la librería de UI
- PostgreSQL por la base de datos robusta
- Pandas por el procesamiento de datos

---

## 📧 Contacto

Para preguntas o soporte, consultar la documentación en la carpeta del proyecto o abrir un issue.

---

## 🔗 Enlaces Útiles

- [Documentación PostgreSQL](https://www.postgresql.org/docs/)
- [Documentación FastAPI](https://fastapi.tiangolo.com/)
- [Documentación React](https://react.dev/)
- [K-Anonymity Paper](https://epic.org/wp-content/uploads/privacy/reidentification/Sweeney_Article.pdf)

---

**¡Listo para anonimizar datos de forma segura! 🚀**
