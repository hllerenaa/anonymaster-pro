# 🗄️ Base de Datos PostgreSQL Local

Esta carpeta contiene los scripts SQL para crear y gestionar la base de datos PostgreSQL local del sistema de anonimización.

## 📋 Archivos

- **`create_database.sql`** - Script completo para crear todas las tablas
- **`drop_database.sql`** - Script para eliminar todas las tablas (⚠️ cuidado con este)

## 🚀 Configuración Inicial

### 1. Instalar PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**Windows:**
Descargar desde: https://www.postgresql.org/download/windows/

**macOS:**
```bash
brew install postgresql
```

### 2. Iniciar PostgreSQL

**Ubuntu/Debian:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
El servicio inicia automáticamente

**macOS:**
```bash
brew services start postgresql
```

### 3. Crear Base de Datos

```bash
# Conectar como usuario postgres
sudo -u postgres psql

# O en Windows:
psql -U postgres
```

Dentro de psql:
```sql
-- Crear base de datos
CREATE DATABASE data_anonymization;

-- Conectar a la base de datos
\c data_anonymization;

-- Ejecutar script de creación
\i /ruta/completa/al/proyecto/database/create_database.sql

-- Verificar tablas creadas
\dt

-- Salir
\q
```

### 4. Configurar Credenciales

Edita el archivo `credentials.json` en la raíz del proyecto:

```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "tu_contraseña",
    "database": "data_anonymization",
    "use_ssl": false
  }
}
```

### 5. Verificar Conexión

```bash
# Desde el directorio backend
cd backend
python -c "from database import get_database; db = get_database(); print('✅ Conexión exitosa!')"
```

## 🔧 Gestión de la Base de Datos

### Ver Tablas

```bash
psql -U postgres -d data_anonymization
```

```sql
-- Listar tablas
\dt

-- Ver estructura de una tabla
\d datasets

-- Contar registros
SELECT COUNT(*) FROM datasets;
```

### Limpiar Datos (Sin eliminar estructura)

```sql
-- Limpiar todas las tablas
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE anonymization_results CASCADE;
TRUNCATE TABLE anonymization_configs CASCADE;
TRUNCATE TABLE datasets CASCADE;
```

### Eliminar y Recrear Base de Datos

```bash
sudo -u postgres psql
```

```sql
-- Eliminar base de datos (desconecta todos los usuarios primero)
DROP DATABASE data_anonymization;

-- Recrear
CREATE DATABASE data_anonymization;
\c data_anonymization;
\i /ruta/completa/al/proyecto/database/create_database.sql;
```

### Backup de la Base de Datos

```bash
# Backup completo (estructura + datos)
pg_dump -U postgres data_anonymization > backup_$(date +%Y%m%d).sql

# Backup solo estructura
pg_dump -U postgres --schema-only data_anonymization > schema.sql

# Backup solo datos
pg_dump -U postgres --data-only data_anonymization > data.sql
```

### Restaurar Backup

```bash
# Restaurar desde backup
psql -U postgres data_anonymization < backup_20260111.sql
```

## 📊 Estructura de Tablas

### datasets
Almacena información sobre datasets subidos
- id (UUID)
- user_id
- name
- original_filename
- file_size
- row_count
- column_count
- column_names (JSONB)
- data (JSONB)
- status
- created_at, updated_at

### anonymization_configs
Configuraciones de anonimización
- id (UUID)
- user_id
- dataset_id (FK → datasets)
- name
- column_mappings (JSONB)
- techniques (JSONB)
- global_params (JSONB)
- created_at, updated_at

### anonymization_results
Resultados de procesamiento
- id (UUID)
- user_id
- dataset_id (FK → datasets)
- config_id (FK → anonymization_configs)
- anonymized_data (JSONB)
- metrics (JSONB)
- technique_details (JSONB)
- status
- processing_time_ms
- completed_at, created_at

### audit_logs
Registro de auditoría
- id (UUID)
- user_id
- action
- resource_type
- resource_id
- details (JSONB)
- timestamp

## 🔍 Consultas Útiles

### Ver todos los datasets
```sql
SELECT id, name, row_count, column_count, created_at
FROM datasets
ORDER BY created_at DESC;
```

### Ver configuraciones por dataset
```sql
SELECT
    d.name as dataset,
    c.name as config,
    c.created_at
FROM anonymization_configs c
JOIN datasets d ON c.dataset_id = d.id
ORDER BY c.created_at DESC;
```

### Ver resultados con métricas
```sql
SELECT
    d.name as dataset,
    r.metrics->>'k_anonymity' as k_value,
    r.metrics->>'information_loss_percentage' as info_loss,
    r.processing_time_ms,
    r.created_at
FROM anonymization_results r
JOIN datasets d ON r.dataset_id = d.id
ORDER BY r.created_at DESC;
```

### Ver actividad reciente (audit)
```sql
SELECT
    action,
    resource_type,
    details,
    timestamp
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 20;
```

## 🛠️ Solución de Problemas

### Error: "password authentication failed"

```bash
# Editar pg_hba.conf
sudo nano /etc/postgresql/[version]/main/pg_hba.conf

# Cambiar línea:
local   all             postgres                                peer
# Por:
local   all             postgres                                md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Cambiar contraseña de postgres
sudo -u postgres psql
ALTER USER postgres PASSWORD 'tu_nueva_contraseña';
```

### Error: "could not connect to server"

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Iniciar si no está corriendo
sudo systemctl start postgresql
```

### Error: "database does not exist"

```bash
# Crear la base de datos
sudo -u postgres psql -c "CREATE DATABASE data_anonymization;"
```

### Error: "extension uuid-ossp does not exist"

```sql
-- Conectar a la base de datos
\c data_anonymization;

-- Crear extensión
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## 📚 Recursos

- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Tutorial:** https://www.postgresqltutorial.com/
- **psycopg2 Docs:** https://www.psycopg.org/docs/

---

**Base de datos lista para usar! 🚀**
