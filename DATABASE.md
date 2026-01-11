# 🗄️ Documentación de Base de Datos

Guía completa sobre la estructura de la base de datos, cómo crear, restaurar, y gestionar los datos del sistema de anonimización.

---

## 📋 Tabla de Contenidos

1. [Información General](#información-general)
2. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
3. [Crear Base de Datos desde Cero](#crear-base-de-datos-desde-cero)
4. [Restaurar Base de Datos](#restaurar-base-de-datos)
5. [Backup y Exportación](#backup-y-exportación)
6. [Migraciones](#migraciones)
7. [Consultas Útiles](#consultas-útiles)
8. [Solución de Problemas](#solución-de-problemas)

---

## 📊 Información General

### Proveedor
- **Sistema:** Supabase (PostgreSQL)
- **Versión:** PostgreSQL 15+
- **Schema:** public

### Credenciales
Ver archivo `.env` para:
- `VITE_SUPABASE_URL` - URL del proyecto
- `VITE_SUPABASE_ANON_KEY` - Clave pública
- `SUPABASE_SERVICE_ROLE_KEY` - Clave privada (backend)

### Acceso
- **Panel web:** https://app.supabase.com
- **SQL Editor:** https://app.supabase.com/project/_/sql
- **API REST:** https://tu-proyecto.supabase.co/rest/v1/
- **API Realtime:** WebSockets para cambios en tiempo real

---

## 🏗️ Estructura de la Base de Datos

### Diagrama de Relaciones

```
┌─────────────────┐
│    datasets     │
│─────────────────│
│ id (PK)         │◄────┐
│ name            │     │
│ original_file   │     │
│ row_count       │     │
│ column_count    │     │
│ file_size       │     │
│ created_at      │     │
│ updated_at      │     │
└─────────────────┘     │
                        │
                        │ dataset_id (FK)
                        │
┌──────────────────────┐│
│ anonymization_configs││
│──────────────────────││
│ id (PK)              │├───┐
│ dataset_id (FK)      │◄───┘
│ name                 │
│ column_mappings      │
│ techniques           │
│ parameters           │
│ created_at           │
│ updated_at           │
└──────────────────────┘
         │
         │ config_id (FK)
         │
         ▼
┌──────────────────────┐
│ anonymization_results│
│──────────────────────│
│ id (PK)              │
│ config_id (FK)       │
│ dataset_id (FK)      │
│ anonymized_data      │
│ metrics              │
│ execution_time       │
│ status               │
│ created_at           │
└──────────────────────┘

┌─────────────────┐
│   audit_logs    │
│─────────────────│
│ id (PK)         │
│ user_id         │
│ action          │
│ resource_type   │
│ resource_id     │
│ details         │
│ timestamp       │
└─────────────────┘
```

---

## 📑 Tablas Detalladas

### 1. **datasets** - Almacena información sobre datasets subidos

| Columna | Tipo | Descripción | Constraints |
|---------|------|-------------|-------------|
| id | uuid | Identificador único | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | text | Nombre del dataset | NOT NULL |
| original_file | text | Nombre del archivo original | NOT NULL |
| row_count | integer | Número de filas | DEFAULT 0 |
| column_count | integer | Número de columnas | DEFAULT 0 |
| file_size | bigint | Tamaño en bytes | DEFAULT 0 |
| columns_info | jsonb | Información de columnas | NOT NULL, DEFAULT '[]' |
| sample_data | jsonb | Muestra de datos | DEFAULT '[]' |
| created_at | timestamptz | Fecha de creación | DEFAULT now() |
| updated_at | timestamptz | Última actualización | DEFAULT now() |

**Ejemplo de datos:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Datos Pacientes 2024",
  "original_file": "pacientes.xlsx",
  "row_count": 1000,
  "column_count": 8,
  "file_size": 245760,
  "columns_info": [
    {"name": "id", "type": "integer"},
    {"name": "nombre", "type": "string"},
    {"name": "edad", "type": "integer"},
    {"name": "zipcode", "type": "string"}
  ],
  "sample_data": [
    {"id": 1, "nombre": "Juan Pérez", "edad": 35, "zipcode": "28001"}
  ]
}
```

---

### 2. **anonymization_configs** - Configuraciones de anonimización

| Columna | Tipo | Descripción | Constraints |
|---------|------|-------------|-------------|
| id | uuid | Identificador único | PRIMARY KEY, DEFAULT gen_random_uuid() |
| dataset_id | uuid | ID del dataset | FOREIGN KEY → datasets(id) |
| name | text | Nombre de la configuración | NOT NULL |
| column_mappings | jsonb | Mapeo de tipos de columnas | NOT NULL |
| techniques | jsonb | Técnicas seleccionadas | NOT NULL, DEFAULT '{}' |
| parameters | jsonb | Parámetros de privacidad | NOT NULL, DEFAULT '{}' |
| created_at | timestamptz | Fecha de creación | DEFAULT now() |
| updated_at | timestamptz | Última actualización | DEFAULT now() |

**Ejemplo de column_mappings:**
```json
{
  "id": "identifier",
  "nombre": "identifier",
  "edad": "quasi-identifier",
  "zipcode": "quasi-identifier",
  "salario": "sensitive",
  "ciudad": "non-sensitive"
}
```

**Ejemplo de techniques:**
```json
{
  "generalization": true,
  "suppression": true,
  "differential_privacy": false,
  "k_anonymity": true
}
```

**Ejemplo de parameters:**
```json
{
  "k": 5,
  "l": 3,
  "epsilon": 1.0
}
```

---

### 3. **anonymization_results** - Resultados de procesamiento

| Columna | Tipo | Descripción | Constraints |
|---------|------|-------------|-------------|
| id | uuid | Identificador único | PRIMARY KEY, DEFAULT gen_random_uuid() |
| config_id | uuid | ID de configuración | FOREIGN KEY → anonymization_configs(id) |
| dataset_id | uuid | ID del dataset | FOREIGN KEY → datasets(id) |
| anonymized_data | jsonb | Datos anonimizados | NOT NULL |
| metrics | jsonb | Métricas de privacidad | NOT NULL, DEFAULT '{}' |
| execution_time | numeric | Tiempo de ejecución (ms) | DEFAULT 0 |
| status | text | Estado del procesamiento | DEFAULT 'completed' |
| created_at | timestamptz | Fecha de creación | DEFAULT now() |

**Ejemplo de metrics:**
```json
{
  "k_anonymity": 5,
  "l_diversity": 3,
  "information_loss": 15.5,
  "total_rows": 1000,
  "anonymized_rows": 980,
  "suppressed_rows": 20,
  "techniques_applied": ["generalization", "suppression"]
}
```

---

### 4. **audit_logs** - Registro de auditoría

| Columna | Tipo | Descripción | Constraints |
|---------|------|-------------|-------------|
| id | uuid | Identificador único | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | uuid | ID del usuario | NULL (opcional) |
| action | text | Acción realizada | NOT NULL |
| resource_type | text | Tipo de recurso | NOT NULL |
| resource_id | uuid | ID del recurso | NULL (opcional) |
| details | jsonb | Detalles adicionales | DEFAULT '{}' |
| timestamp | timestamptz | Fecha/hora de acción | DEFAULT now() |

**Acciones registradas:**
- `dataset_upload` - Subida de dataset
- `config_create` - Creación de configuración
- `anonymization_process` - Procesamiento de anonimización
- `result_download` - Descarga de resultado

---

## 🆕 Crear Base de Datos desde Cero

### Opción 1: Usando Supabase Dashboard (Recomendado)

1. **Acceder a Supabase**
   ```
   https://app.supabase.com
   ```

2. **Crear nuevo proyecto**
   - Click en "New Project"
   - Nombre: `data-anonymization`
   - Base de datos password: `[generar contraseña segura]`
   - Región: Seleccionar la más cercana
   - Plan: Free o Pro según necesidad

3. **Esperar creación del proyecto** (1-2 minutos)

4. **Aplicar migraciones**
   - Ve a: `SQL Editor` en el panel izquierdo
   - Click en "New Query"
   - Copia el contenido de cada archivo en `/supabase/migrations/` en orden:
     1. `20260111031149_create_anonymization_tables.sql`
     2. `20260111032300_update_policies_for_public_access.sql`
   - Click en "Run" para ejecutar cada uno

5. **Verificar tablas creadas**
   - Ve a: `Table Editor`
   - Deberías ver: `datasets`, `anonymization_configs`, `anonymization_results`, `audit_logs`

6. **Obtener credenciales**
   - Ve a: `Settings > API`
   - Copia:
     - `Project URL` → VITE_SUPABASE_URL
     - `anon/public key` → VITE_SUPABASE_ANON_KEY
     - `service_role key` → SUPABASE_SERVICE_ROLE_KEY
   - Pégalas en tu archivo `.env`

---

### Opción 2: Usando Supabase CLI

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login en Supabase
supabase login

# 3. Crear nuevo proyecto
supabase projects create data-anonymization

# 4. Inicializar en tu proyecto local
cd /ruta/a/tu/proyecto
supabase init

# 5. Link al proyecto
supabase link --project-ref tu-project-ref

# 6. Aplicar migraciones
supabase db push

# 7. Ver estado de la base de datos
supabase db status
```

---

### Opción 3: Script SQL Manual

Si prefieres ejecutar SQL directamente:

```sql
-- ================================================
-- SCRIPT COMPLETO DE CREACIÓN DE BASE DE DATOS
-- ================================================

-- 1. Crear tabla de datasets
CREATE TABLE IF NOT EXISTS datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  original_file text NOT NULL,
  row_count integer DEFAULT 0,
  column_count integer DEFAULT 0,
  file_size bigint DEFAULT 0,
  columns_info jsonb NOT NULL DEFAULT '[]',
  sample_data jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Crear tabla de configuraciones
CREATE TABLE IF NOT EXISTS anonymization_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid REFERENCES datasets(id) ON DELETE CASCADE,
  name text NOT NULL,
  column_mappings jsonb NOT NULL,
  techniques jsonb NOT NULL DEFAULT '{}',
  parameters jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Crear tabla de resultados
CREATE TABLE IF NOT EXISTS anonymization_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid REFERENCES anonymization_configs(id) ON DELETE CASCADE,
  dataset_id uuid REFERENCES datasets(id) ON DELETE CASCADE,
  anonymized_data jsonb NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}',
  execution_time numeric DEFAULT 0,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- 4. Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now()
);

-- 5. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON datasets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_configs_dataset_id ON anonymization_configs(dataset_id);
CREATE INDEX IF NOT EXISTS idx_results_config_id ON anonymization_results(config_id);
CREATE INDEX IF NOT EXISTS idx_results_dataset_id ON anonymization_results(dataset_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);

-- 6. Habilitar Row Level Security
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymization_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymization_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas de acceso público
CREATE POLICY "Allow public read access on datasets"
  ON datasets FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert on datasets"
  ON datasets FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public read access on configs"
  ON anonymization_configs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert on configs"
  ON anonymization_configs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public read access on results"
  ON anonymization_results FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert on results"
  ON anonymization_results FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public insert on audit"
  ON audit_logs FOR INSERT
  TO anon
  WITH CHECK (true);

-- ================================================
-- BASE DE DATOS CREADA EXITOSAMENTE
-- ================================================
```

Copia y ejecuta este script en el SQL Editor de Supabase.

---

## 🔄 Restaurar Base de Datos

### Desde Backup de Supabase

1. **Acceder al panel de backups**
   ```
   Settings > Database > Backups
   ```

2. **Seleccionar backup**
   - Los proyectos Pro tienen backups automáticos diarios
   - Free tier: hacer backups manuales

3. **Restaurar**
   - Click en "Restore" junto al backup deseado
   - Confirmar restauración
   - Esperar proceso (puede tomar varios minutos)

---

### Desde Archivo SQL (Export previo)

```bash
# 1. Exportar datos (hacer esto regularmente)
supabase db dump -f backup.sql

# 2. Restaurar desde archivo
psql -h db.tu-proyecto.supabase.co \
     -U postgres \
     -d postgres \
     -f backup.sql
```

---

### Restaurar Solo Datos (Sin estructura)

```bash
# Exportar solo datos
supabase db dump --data-only -f data_backup.sql

# Restaurar solo datos
psql -h db.tu-proyecto.supabase.co \
     -U postgres \
     -d postgres \
     -f data_backup.sql
```

---

### Restaurar Tabla Específica

```sql
-- Ejemplo: Restaurar solo la tabla datasets

-- 1. Limpiar tabla existente (CUIDADO!)
TRUNCATE TABLE datasets CASCADE;

-- 2. Insertar datos desde backup
-- (Ejecutar los INSERTs desde tu archivo de backup)
```

---

## 💾 Backup y Exportación

### Backup Automático (Recomendado)

**Plan Pro de Supabase:**
- Backups automáticos diarios
- Retención de 7 días
- Point-in-time recovery

**Configurar en:**
```
Settings > Database > Backups
```

---

### Backup Manual Completo

```bash
# Usando Supabase CLI
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# Usando pg_dump directamente
pg_dump -h db.tu-proyecto.supabase.co \
        -U postgres \
        -d postgres \
        -F c \
        -f backup_$(date +%Y%m%d_%H%M%S).dump
```

---

### Exportar Solo Estructura

```bash
# Solo esquema (sin datos)
supabase db dump --schema-only -f schema.sql
```

---

### Exportar Datos en CSV

```sql
-- Desde SQL Editor en Supabase

-- Exportar datasets
COPY (SELECT * FROM datasets) TO STDOUT WITH CSV HEADER;

-- Exportar con condiciones
COPY (
  SELECT * FROM datasets
  WHERE created_at > '2024-01-01'
) TO STDOUT WITH CSV HEADER;
```

---

### Script de Backup Automático (Linux/Ubuntu)

Crea este script en: `/home/tu_usuario/backup_db.sh`

```bash
#!/bin/bash

# Configuración
PROJECT_REF="tu-project-ref"
BACKUP_DIR="/home/tu_usuario/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Hacer backup
supabase db dump -f $BACKUP_DIR/backup_$DATE.sql

# Comprimir
gzip $BACKUP_DIR/backup_$DATE.sql

# Eliminar backups antiguos
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completado: backup_$DATE.sql.gz"
```

**Hacer ejecutable:**
```bash
chmod +x /home/tu_usuario/backup_db.sh
```

**Programar ejecución diaria (crontab):**
```bash
# Editar crontab
crontab -e

# Agregar línea (ejecutar diariamente a las 2 AM)
0 2 * * * /home/tu_usuario/backup_db.sh
```

---

## 🔄 Migraciones

### Estructura de Migraciones

```
supabase/
└── migrations/
    ├── 20260111031149_create_anonymization_tables.sql
    └── 20260111032300_update_policies_for_public_access.sql
```

### Crear Nueva Migración

```bash
# Usando Supabase CLI
supabase migration new nombre_de_migracion

# Esto crea:
# supabase/migrations/[timestamp]_nombre_de_migracion.sql
```

### Aplicar Migraciones

```bash
# Aplicar todas las migraciones pendientes
supabase db push

# Ver estado de migraciones
supabase migration list
```

### Ejemplo de Migración: Agregar Nueva Columna

Archivo: `20260112000000_add_description_to_datasets.sql`

```sql
/*
  # Add description column to datasets

  1. Changes
    - Add `description` column to `datasets` table
    - Set default value to empty string
    - Make it non-nullable

  2. Notes
    - Existing records will have empty description
*/

-- Add column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'datasets' AND column_name = 'description'
  ) THEN
    ALTER TABLE datasets ADD COLUMN description text DEFAULT '' NOT NULL;
  END IF;
END $$;
```

---

## 🔍 Consultas Útiles

### Estadísticas Generales

```sql
-- Total de datasets
SELECT COUNT(*) as total_datasets FROM datasets;

-- Total de configuraciones
SELECT COUNT(*) as total_configs FROM anonymization_configs;

-- Total de resultados procesados
SELECT COUNT(*) as total_results FROM anonymization_results;

-- Tamaño total de datos (en MB)
SELECT
  SUM(file_size) / 1024 / 1024 as total_size_mb
FROM datasets;
```

---

### Datasets Más Recientes

```sql
SELECT
  id,
  name,
  original_file,
  row_count,
  column_count,
  file_size / 1024 as size_kb,
  created_at
FROM datasets
ORDER BY created_at DESC
LIMIT 10;
```

---

### Configuraciones por Dataset

```sql
SELECT
  d.name as dataset_name,
  c.name as config_name,
  c.techniques,
  c.parameters,
  c.created_at
FROM anonymization_configs c
JOIN datasets d ON c.dataset_id = d.id
ORDER BY c.created_at DESC;
```

---

### Resultados con Métricas

```sql
SELECT
  d.name as dataset,
  c.name as config,
  r.metrics->>'k_anonymity' as k_value,
  r.metrics->>'information_loss' as info_loss,
  r.execution_time,
  r.created_at
FROM anonymization_results r
JOIN datasets d ON r.dataset_id = d.id
JOIN anonymization_configs c ON r.config_id = c.id
ORDER BY r.created_at DESC;
```

---

### Auditoría de Actividad

```sql
SELECT
  action,
  resource_type,
  details,
  timestamp
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 50;
```

---

### Limpieza de Datos Antiguos

```sql
-- Eliminar datasets de hace más de 90 días
DELETE FROM datasets
WHERE created_at < NOW() - INTERVAL '90 days';

-- Eliminar logs de auditoría de hace más de 30 días
DELETE FROM audit_logs
WHERE timestamp < NOW() - INTERVAL '30 days';
```

---

## 🛠️ Solución de Problemas

### Error: "relation does not exist"

**Causa:** Las tablas no existen en la base de datos

**Solución:**
```bash
# Aplicar migraciones
supabase db push

# O ejecutar el script SQL completo manualmente
```

---

### Error: "permission denied for table"

**Causa:** Políticas RLS mal configuradas

**Solución:**
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'datasets';

-- Recrear políticas si es necesario
DROP POLICY IF EXISTS "Allow public read access on datasets" ON datasets;
CREATE POLICY "Allow public read access on datasets"
  ON datasets FOR SELECT TO anon USING (true);
```

---

### Error: "connection refused"

**Causa:** Credenciales incorrectas en `.env`

**Solución:**
1. Verifica las credenciales en Supabase Dashboard
2. Actualiza el archivo `.env`
3. Reinicia el backend

---

### Datos no aparecen en la aplicación

**Verificar:**
```sql
-- ¿Hay datos?
SELECT COUNT(*) FROM datasets;

-- ¿RLS está habilitado?
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- ¿Hay políticas?
SELECT * FROM pg_policies;
```

---

### Limpiar toda la base de datos

```sql
-- ⚠️ CUIDADO: Esto elimina TODOS los datos

-- Opción 1: Truncar tablas (mantiene estructura)
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE anonymization_results CASCADE;
TRUNCATE TABLE anonymization_configs CASCADE;
TRUNCATE TABLE datasets CASCADE;

-- Opción 2: Eliminar y recrear tablas
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS anonymization_results CASCADE;
DROP TABLE IF EXISTS anonymization_configs CASCADE;
DROP TABLE IF EXISTS datasets CASCADE;

-- Luego ejecutar script de creación completo
```

---

## 📚 Recursos Adicionales

- **Documentación Supabase:** https://supabase.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **SQL Tutorial:** https://www.postgresqltutorial.com/

---

## ✅ Checklist de Verificación

Después de crear/restaurar la base de datos:

- [ ] Las 4 tablas existen (datasets, configs, results, audit)
- [ ] RLS está habilitado en todas las tablas
- [ ] Las políticas de acceso están creadas
- [ ] Los índices están creados
- [ ] Las foreign keys están configuradas
- [ ] El archivo `.env` tiene las credenciales correctas
- [ ] El backend se conecta exitosamente
- [ ] Se pueden insertar datos de prueba

---

**Base de datos lista para usar! 🚀**
