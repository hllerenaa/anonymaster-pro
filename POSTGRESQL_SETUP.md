# 🐘 Migración a PostgreSQL Local

Esta guía explica cómo configurar y usar PostgreSQL local en lugar de Supabase.

---

## 📋 ¿Qué cambió?

### Antes (Supabase)
- ☁️ Base de datos en la nube
- 🔑 Conexión via `.env` con URLs y API keys
- 📦 Cliente JavaScript `@supabase/supabase-js`
- 🌐 API REST automática

### Ahora (PostgreSQL Local)
- 💻 Base de datos local
- 🔧 Conexión via `credentials.json` con credenciales
- 🐍 Cliente Python `psycopg2`
- ⚡ API FastAPI personalizada

---

## 🚀 Instalación de PostgreSQL

### Ubuntu/Debian

```bash
# Actualizar repositorios
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Verificar instalación
psql --version

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar estado
sudo systemctl status postgresql
```

### Windows

1. Descargar instalador desde: https://www.postgresql.org/download/windows/
2. Ejecutar instalador
3. Durante instalación:
   - Puerto: 5432
   - Contraseña para postgres: (recordarla para credentials.json)
   - Locale: Spanish_Spain o Default
4. Agregar PostgreSQL al PATH (el instalador lo hace automáticamente)
5. Verificar en CMD:
   ```cmd
   psql --version
   ```

### macOS

```bash
# Instalar con Homebrew
brew install postgresql

# Iniciar servicio
brew services start postgresql

# Verificar
psql --version
```

---

## 🔧 Configuración Inicial

### 1. Acceder a PostgreSQL

**Ubuntu/Debian:**
```bash
sudo -u postgres psql
```

**Windows:**
```cmd
psql -U postgres
```

**macOS:**
```bash
psql postgres
```

### 2. Cambiar Contraseña (Recomendado)

```sql
-- Dentro de psql
ALTER USER postgres WITH PASSWORD 'tu_contraseña_segura';
```

Anota esta contraseña, la necesitarás en `credentials.json`.

### 3. Crear Base de Datos

```sql
-- Crear base de datos
CREATE DATABASE data_anonymization;

-- Ver bases de datos
\l

-- Salir
\q
```

### 4. Crear Tablas

**Opción A: Desde psql**
```bash
sudo -u postgres psql -d data_anonymization
```

```sql
-- Copiar y pegar el contenido de:
-- database/create_database.sql

-- O ejecutar el archivo directamente:
\i /ruta/completa/al/proyecto/database/create_database.sql

-- Verificar tablas creadas
\dt

-- Salir
\q
```

**Opción B: Desde línea de comandos**
```bash
# Linux/Mac
psql -U postgres -d data_anonymization -f database/create_database.sql

# Windows (CMD en la carpeta del proyecto)
psql -U postgres -d data_anonymization -f database\create_database.sql
```

### 5. Verificar Tablas Creadas

```bash
psql -U postgres -d data_anonymization
```

```sql
-- Listar tablas
\dt

-- Deberías ver:
-- datasets
-- anonymization_configs
-- anonymization_results
-- audit_logs

-- Ver estructura de una tabla
\d datasets

-- Salir
\q
```

---

## 🔑 Configurar Credenciales

### 1. Copiar Template

```bash
# Copiar el archivo de ejemplo
cp credentials.example.json credentials.json
```

### 2. Editar Credenciales

Edita `credentials.json`:

```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "tu_contraseña_aqui",
    "database": "data_anonymization",
    "use_ssl": false
  },
  "backend": {
    "host": "0.0.0.0",
    "port": 8000,
    "workers": 4,
    "debug": true,
    "secret_key": "genera-una-clave-secreta-aqui",
    "max_upload_size_mb": 50,
    "allowed_extensions": [".csv", ".xlsx", ".xls"],
    "cors_origins": ["http://localhost:5173", "http://localhost:4173"]
  },
  "frontend": {
    "port_dev": 5173,
    "port_preview": 4173,
    "api_url": "http://localhost:8000"
  }
}
```

**Importante:**
- `password`: La contraseña que configuraste para el usuario postgres
- `secret_key`: Genera una clave segura (ejemplo: `openssl rand -hex 32`)

### 3. Generar Secret Key

**Linux/Mac:**
```bash
openssl rand -hex 32
```

**Windows (PowerShell):**
```powershell
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

O usa cualquier clave larga y aleatoria.

---

## 🐍 Configurar Backend

### 1. Instalar Dependencias

```bash
cd backend

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Verificar Conexión

```bash
# Prueba rápida de conexión
python -c "from database import get_database; db = get_database(); print('✅ Conexión exitosa!')"
```

Si ves "✅ Conexión exitosa!", todo está bien.

### 3. Iniciar Backend

**Linux/Mac:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

**O manualmente:**
```bash
cd backend
python main.py
```

Deberías ver:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 4. Probar API

Abre en navegador: http://localhost:8000

Deberías ver:
```json
{
  "message": "Data Anonymization System API",
  "version": "1.0.0",
  "database": "PostgreSQL"
}
```

---

## 🎨 Frontend (No requiere cambios)

El frontend se conecta al backend via API REST, no necesita saber qué base de datos usa.

```bash
# En otra terminal, desde la raíz del proyecto
npm run dev
```

Abre: http://localhost:5173

---

## 🗄️ Gestión de Base de Datos

### Conectar a la Base de Datos

```bash
psql -U postgres -d data_anonymization
```

### Comandos Útiles de psql

```sql
-- Listar bases de datos
\l

-- Conectar a base de datos
\c data_anonymization

-- Listar tablas
\dt

-- Ver estructura de tabla
\d datasets

-- Ver índices
\di

-- Ver todos los registros de una tabla
SELECT * FROM datasets;

-- Contar registros
SELECT COUNT(*) FROM datasets;

-- Ver tamaño de base de datos
SELECT pg_size_pretty(pg_database_size('data_anonymization'));

-- Salir
\q
```

### Backup de Base de Datos

```bash
# Backup completo
pg_dump -U postgres data_anonymization > backup_$(date +%Y%m%d).sql

# Backup comprimido
pg_dump -U postgres data_anonymization | gzip > backup_$(date +%Y%m%d).sql.gz

# Backup solo estructura
pg_dump -U postgres --schema-only data_anonymization > schema.sql

# Backup solo datos
pg_dump -U postgres --data-only data_anonymization > data.sql
```

### Restaurar Backup

```bash
# Restaurar desde backup
psql -U postgres data_anonymization < backup_20260111.sql

# Restaurar desde backup comprimido
gunzip -c backup_20260111.sql.gz | psql -U postgres data_anonymization
```

### Limpiar Datos (Sin eliminar estructura)

```sql
-- Conectar a la base de datos
\c data_anonymization;

-- Limpiar todas las tablas
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE anonymization_results CASCADE;
TRUNCATE TABLE anonymization_configs CASCADE;
TRUNCATE TABLE datasets CASCADE;
```

### Eliminar y Recrear Base de Datos

```bash
# Conectar como postgres
sudo -u postgres psql

# Eliminar base de datos (cierra todas las conexiones primero)
DROP DATABASE data_anonymization;

# Recrear
CREATE DATABASE data_anonymization;

# Salir
\q

# Recrear tablas
psql -U postgres -d data_anonymization -f database/create_database.sql
```

---

## 🔍 Verificar que Todo Funciona

### 1. Backend

```bash
curl http://localhost:8000
```

Respuesta esperada:
```json
{
  "message": "Data Anonymization System API",
  "version": "1.0.0",
  "database": "PostgreSQL"
}
```

### 2. Subir un Dataset

Usa la interfaz web en http://localhost:5173 y sube un archivo CSV o Excel.

### 3. Verificar en Base de Datos

```bash
psql -U postgres -d data_anonymization
```

```sql
-- Ver datasets subidos
SELECT id, name, row_count, column_count, created_at
FROM datasets
ORDER BY created_at DESC;
```

---

## 🛠️ Solución de Problemas

### Error: "FATAL: password authentication failed"

```bash
# Opción 1: Cambiar contraseña
sudo -u postgres psql
ALTER USER postgres PASSWORD 'nueva_contraseña';
\q

# Opción 2: Editar pg_hba.conf (solo en desarrollo)
sudo nano /etc/postgresql/[version]/main/pg_hba.conf

# Cambiar:
local   all             postgres                                peer
# Por:
local   all             postgres                                md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### Error: "could not connect to server"

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Si no está corriendo, iniciar
sudo systemctl start postgresql

# Windows: Verificar servicio en Services.msc
```

### Error: "database does not exist"

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE data_anonymization;"
```

### Error: "relation does not exist"

```bash
# Las tablas no fueron creadas, ejecutar script
psql -U postgres -d data_anonymization -f database/create_database.sql
```

### Error: "ModuleNotFoundError: No module named 'psycopg2'"

```bash
cd backend
pip install -r requirements.txt
```

### Error: "FileNotFoundError: credentials.json"

```bash
# Copiar el template
cp credentials.example.json credentials.json

# Editar con tus credenciales
nano credentials.json
```

### Error en Windows: "psql: command not found"

Agrega PostgreSQL al PATH:
1. Buscar "Variables de entorno" en Windows
2. Editar variable PATH
3. Agregar: `C:\Program Files\PostgreSQL\[version]\bin`
4. Reiniciar CMD

---

## 🔐 Configuración de Producción

### 1. Crear Usuario Específico (Recomendado)

```sql
-- Conectar como postgres
sudo -u postgres psql

-- Crear usuario
CREATE USER anonymization_user WITH PASSWORD 'password_seguro_aqui';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE data_anonymization TO anonymization_user;

-- Conectar a la base de datos
\c data_anonymization;

-- Otorgar permisos en tablas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anonymization_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anonymization_user;
```

Actualiza `credentials.json`:
```json
{
  "database": {
    "user": "anonymization_user",
    "password": "password_seguro_aqui",
    ...
  }
}
```

### 2. Habilitar Conexiones Remotas (Si necesitas)

```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/[version]/main/postgresql.conf

# Descomentar y cambiar:
listen_addresses = '*'

# Editar pg_hba.conf
sudo nano /etc/postgresql/[version]/main/pg_hba.conf

# Agregar (ajustar IP según tu red):
host    all             all             0.0.0.0/0               md5

# Reiniciar
sudo systemctl restart postgresql
```

⚠️ **Cuidado:** Esto expone tu base de datos. Solo hazlo si entiendes las implicaciones de seguridad.

### 3. Configurar Firewall

```bash
# Ubuntu (UFW)
sudo ufw allow 5432/tcp

# Verificar
sudo ufw status
```

---

## 📚 Recursos

- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **psycopg2 Docs:** https://www.psycopg.org/docs/
- **Tutorial PostgreSQL:** https://www.postgresqltutorial.com/
- **pgAdmin (GUI):** https://www.pgadmin.org/

---

## ✅ Checklist Final

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `data_anonymization` creada
- [ ] Tablas creadas con `create_database.sql`
- [ ] Archivo `credentials.json` configurado
- [ ] Dependencias del backend instaladas
- [ ] Backend inicia sin errores
- [ ] API responde en http://localhost:8000
- [ ] Frontend carga correctamente
- [ ] Se puede subir un dataset de prueba
- [ ] Los datos aparecen en la base de datos

---

**¡Base de datos PostgreSQL configurada! 🎉**
