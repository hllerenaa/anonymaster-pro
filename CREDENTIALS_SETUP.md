# 🔑 Configuración de Credenciales

Guía completa para configurar el archivo `credentials.json` del sistema.

---

## 📋 Estructura del Archivo

El sistema utiliza un archivo JSON centralizado llamado `credentials.json` que contiene todas las credenciales y configuraciones necesarias.

---

## 🚀 Inicio Rápido

### 1. Copiar Template

```bash
cp credentials.example.json credentials.json
```

### 2. Editar Valores

```bash
# Linux/Mac
nano credentials.json

# O usa tu editor favorito
code credentials.json
vim credentials.json
```

---

## 📝 Secciones del Archivo

### 🗄️ Database (Base de Datos PostgreSQL)

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

**Campos:**
- `host`: Dirección del servidor PostgreSQL
  - Desarrollo: `localhost`
  - Producción: IP del servidor o dominio
- `port`: Puerto de PostgreSQL (por defecto 5432)
- `user`: Usuario de PostgreSQL
  - Por defecto: `postgres`
  - Recomendado en producción: crear usuario específico
- `password`: Contraseña del usuario de PostgreSQL
- `database`: Nombre de la base de datos
  - Debe ser: `data_anonymization`
- `use_ssl`: Habilitar SSL para conexión
  - Desarrollo: `false`
  - Producción: `true` (recomendado)

**Cómo obtener la contraseña:**
```bash
# Durante instalación de PostgreSQL, se configura
# O cambiar después:
sudo -u postgres psql
ALTER USER postgres PASSWORD 'nueva_contraseña';
\q
```

---

### ⚙️ Backend (Servidor API)

```json
{
  "backend": {
    "host": "0.0.0.0",
    "port": 8000,
    "workers": 4,
    "debug": true,
    "secret_key": "+4gw$y8hn3k2mlkbxn3fk(%qsmm9zd4zak2yh**k9+mz4ri8t5",
    "max_upload_size_mb": 50,
    "allowed_extensions": [".csv", ".xlsx", ".xls"],
    "cors_origins": ["http://localhost:5173", "http://localhost:4173"]
  }
}
```

**Campos:**
- `host`: Dirección donde escucha el backend
  - `0.0.0.0`: Escucha en todas las interfaces (permite conexiones externas)
  - `127.0.0.1`: Solo conexiones locales
- `port`: Puerto del backend (por defecto 8000)
- `workers`: Número de workers de Gunicorn/Uvicorn
  - Fórmula recomendada: `(2 x CPU_cores) + 1`
  - Desarrollo: `1-4`
  - Producción: `4-8`
- `debug`: Modo debug
  - Desarrollo: `true`
  - Producción: `false`
- `secret_key`: Clave secreta para sesiones/tokens
  - **IMPORTANTE:** Generar una clave única y segura
  - **NUNCA** usar la del ejemplo en producción
- `max_upload_size_mb`: Tamaño máximo de archivos (en MB)
- `allowed_extensions`: Extensiones permitidas para subir
- `cors_origins`: Orígenes permitidos para CORS
  - Desarrollo: `["http://localhost:5173"]`
  - Producción: `["https://tu-dominio.com"]`

**Generar secret_key:**

**Linux/Mac:**
```bash
openssl rand -hex 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))
```

**Python:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

### 🎨 Frontend (Cliente Web)

```json
{
  "frontend": {
    "port_dev": 5173,
    "port_preview": 4173,
    "api_url": "http://localhost:8000"
  }
}
```

**Campos:**
- `port_dev`: Puerto del servidor de desarrollo de Vite
- `port_preview`: Puerto del servidor de preview
- `api_url`: URL del backend
  - Desarrollo: `http://localhost:8000`
  - Producción: `https://api.tu-dominio.com`

---

### 🔐 Security (Seguridad)

```json
{
  "security": {
    "enable_authentication": false,
    "enable_audit_log": true,
    "session_timeout_minutes": 60
  }
}
```

**Campos:**
- `enable_authentication`: Habilitar autenticación de usuarios
  - Actualmente: `false` (acceso público)
  - Futuro: `true` (requiere login)
- `enable_audit_log`: Registrar acciones en audit_logs
  - Recomendado: `true`
- `session_timeout_minutes`: Tiempo de expiración de sesión (en minutos)

---

### 🛡️ Anonymization (Parámetros de Anonimización)

```json
{
  "anonymization": {
    "default_k_anonymity": 5,
    "default_l_diversity": 3,
    "default_epsilon": 1.0,
    "max_k_anonymity": 100,
    "max_l_diversity": 50,
    "max_epsilon": 10.0
  }
}
```

**Campos:**
- `default_k_anonymity`: Valor por defecto de K-Anonimato
- `default_l_diversity`: Valor por defecto de L-Diversidad
- `default_epsilon`: Valor por defecto de Epsilon (Privacidad Diferencial)
- `max_*`: Valores máximos permitidos por el usuario

---

### 📊 Logging (Registros)

```json
{
  "logging": {
    "level": "INFO",
    "log_file": "backend/logs/app.log"
  }
}
```

**Campos:**
- `level`: Nivel de logging
  - `DEBUG`: Mensajes detallados de depuración
  - `INFO`: Información general (recomendado)
  - `WARNING`: Solo advertencias
  - `ERROR`: Solo errores
  - `CRITICAL`: Solo errores críticos
- `log_file`: Ruta del archivo de logs

---

### 📧 Email (Opcional)

```json
{
  "email": {
    "host": "smtp.sendgrid.net",
    "port": 587,
    "user": "apikey",
    "password": "tu_api_key_sendgrid",
    "from_email": "tu_email@dominio.com",
    "use_tls": true
  }
}
```

**Uso:** Para notificaciones por email (actualmente no implementado)

**Proveedores populares:**
- SendGrid: https://sendgrid.com
- Mailgun: https://www.mailgun.com
- AWS SES: https://aws.amazon.com/ses/

---

### 🌐 Domain (Dominio)

```json
{
  "domain": {
    "general": "",
    "production_url": ""
  }
}
```

**Campos:**
- `general`: Dominio general del sistema
- `production_url`: URL completa de producción

---

### 💻 System (Sistema)

```json
{
  "system": {
    "type": 3,
    "windows": true,
    "environment": "development"
  }
}
```

**Campos:**
- `type`: Tipo de sistema (interno)
- `windows`: ¿Está corriendo en Windows?
  - `true`: Windows
  - `false`: Linux/Mac
- `environment`: Entorno de ejecución
  - `development`: Desarrollo
  - `staging`: Pre-producción
  - `production`: Producción

---

## 🔒 Seguridad

### ⚠️ Reglas de Seguridad

1. **NUNCA subir `credentials.json` a git**
   - Ya está en `.gitignore`
   - Verificar con: `git status`

2. **Usar contraseñas seguras**
   - Mínimo 12 caracteres
   - Combinar mayúsculas, minúsculas, números, símbolos

3. **Generar secret_key único**
   - Nunca usar el del ejemplo
   - Diferente para cada entorno (dev, staging, prod)

4. **Rotar credenciales periódicamente**
   - Cambiar contraseñas cada 3-6 meses
   - Especialmente en producción

5. **Permisos del archivo**
   ```bash
   # Linux/Mac: Solo lectura para el propietario
   chmod 600 credentials.json
   ```

### 🔐 Gestión de Secretos en Producción

**Opciones recomendadas:**

1. **Variables de entorno**
   ```bash
   export DB_PASSWORD="contraseña_segura"
   ```

2. **Vault (HashiCorp)**
   - https://www.vaultproject.io/

3. **AWS Secrets Manager**
   - https://aws.amazon.com/secrets-manager/

4. **Azure Key Vault**
   - https://azure.microsoft.com/en-us/services/key-vault/

5. **Docker Secrets**
   ```bash
   docker secret create db_password password.txt
   ```

---

## 📋 Ejemplos por Entorno

### Desarrollo (Local)

```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "user": "postgres",
    "password": "postgres",
    "database": "data_anonymization",
    "use_ssl": false
  },
  "backend": {
    "host": "127.0.0.1",
    "port": 8000,
    "debug": true,
    "cors_origins": ["http://localhost:5173"]
  },
  "system": {
    "environment": "development"
  }
}
```

### Producción (Servidor)

```json
{
  "database": {
    "host": "db.interno.empresa.com",
    "port": 5432,
    "user": "anonymization_user",
    "password": "contraseña_muy_segura_y_larga_123!@#",
    "database": "data_anonymization",
    "use_ssl": true
  },
  "backend": {
    "host": "0.0.0.0",
    "port": 8000,
    "workers": 8,
    "debug": false,
    "secret_key": "clave_secreta_generada_con_openssl_rand_hex_32",
    "cors_origins": ["https://anonimizacion.empresa.com"]
  },
  "frontend": {
    "api_url": "https://api.anonimizacion.empresa.com"
  },
  "security": {
    "enable_authentication": true,
    "enable_audit_log": true
  },
  "system": {
    "environment": "production"
  }
}
```

---

## 🧪 Verificar Configuración

### Script de Verificación

Crea `backend/test_credentials.py`:

```python
#!/usr/bin/env python3
import json
from database import load_credentials, get_database

try:
    # Cargar credenciales
    credentials = load_credentials()
    print("✅ Archivo credentials.json cargado correctamente")

    # Verificar campos requeridos
    required_keys = ['database', 'backend', 'frontend']
    for key in required_keys:
        if key not in credentials:
            print(f"❌ Falta sección: {key}")
        else:
            print(f"✅ Sección encontrada: {key}")

    # Probar conexión a base de datos
    print("\n🔄 Probando conexión a PostgreSQL...")
    db = get_database()
    result = db.execute_query("SELECT version()", fetch=True)
    print(f"✅ Conexión exitosa!")
    print(f"   PostgreSQL: {result[0]['version'].split(',')[0]}")

except FileNotFoundError:
    print("❌ Archivo credentials.json no encontrado")
    print("   Ejecuta: cp credentials.example.json credentials.json")
except Exception as e:
    print(f"❌ Error: {str(e)}")
```

Ejecutar:
```bash
cd backend
python test_credentials.py
```

---

## 🛠️ Solución de Problemas

### Error: "FileNotFoundError: credentials.json"

```bash
# Copiar el template
cp credentials.example.json credentials.json

# Editar con tus valores
nano credentials.json
```

### Error: "connection refused" (PostgreSQL)

1. Verificar que PostgreSQL está corriendo:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verificar host y puerto en `credentials.json`

3. Verificar contraseña correcta

### Error: "CORS origin not allowed"

Agregar el origen a `cors_origins`:
```json
{
  "backend": {
    "cors_origins": [
      "http://localhost:5173",
      "https://tu-dominio.com"
    ]
  }
}
```

### Error: "File upload too large"

Aumentar `max_upload_size_mb`:
```json
{
  "backend": {
    "max_upload_size_mb": 100
  }
}
```

---

## 📚 Recursos

- **PostgreSQL:** https://www.postgresql.org/docs/
- **FastAPI:** https://fastapi.tiangolo.com/
- **Security Best Practices:** https://owasp.org/www-project-top-ten/

---

## ✅ Checklist de Configuración

- [ ] Archivo `credentials.json` creado
- [ ] Contraseña de PostgreSQL configurada
- [ ] Secret key generada (única)
- [ ] CORS origins configurados
- [ ] Puerto del backend definido
- [ ] API URL del frontend configurada
- [ ] Permisos del archivo correctos (600)
- [ ] Archivo NO está en git
- [ ] Conexión a base de datos verificada
- [ ] Backend inicia sin errores

---

**¡Credenciales configuradas correctamente! 🎉**
