# 🚀 Guía de Deploy en Ubuntu - Paso a Paso

Esta guía te llevará desde un servidor Ubuntu limpio hasta tener la aplicación funcionando con IP pública accesible desde Internet.

---

## 📋 Requisitos Previos

- **Servidor Ubuntu** 20.04 o superior (puede ser VPS, AWS EC2, DigitalOcean, etc.)
- **Acceso SSH** al servidor
- **Dominio** (opcional, pero recomendado para producción)
- **IP Pública** del servidor

---

## 🎯 Arquitectura del Deploy

```
Internet
   ↓
Nginx (Puerto 80/443) → Frontend estático
   ↓
Gunicorn (Puerto 8000) → Backend Python
   ↓
Supabase → Base de datos
```

---

## 📝 PASO 1: Conectar al Servidor

```bash
# Conéctate por SSH (reemplaza con tu IP)
ssh root@TU_IP_PUBLICA

# O si tienes usuario no-root
ssh tu_usuario@TU_IP_PUBLICA
```

---

## 🔧 PASO 2: Actualizar Sistema e Instalar Dependencias Base

```bash
# Actualizar el sistema
sudo apt update
sudo apt upgrade -y

# Instalar dependencias básicas
sudo apt install -y python3 python3-pip python3-venv git nginx curl
```

---

## 📦 PASO 3: Instalar Node.js y npm

```bash
# Instalar Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

---

## 📁 PASO 4: Clonar o Subir el Proyecto

### Opción A: Usar Git (recomendado)

```bash
# Ir al directorio home
cd ~

# Clonar el repositorio (reemplaza con tu repo)
git clone TU_REPOSITORIO_GIT proyecto
cd proyecto
```

### Opción B: Subir archivos manualmente

```bash
# En tu máquina local, comprimir el proyecto
cd /ruta/a/tu/proyecto
tar -czf proyecto.tar.gz .

# Subir al servidor (desde tu máquina local)
scp proyecto.tar.gz usuario@TU_IP_PUBLICA:~/

# En el servidor, descomprimir
cd ~
mkdir proyecto
tar -xzf proyecto.tar.gz -C proyecto
cd proyecto
```

---

## 🔐 PASO 5: Configurar Variables de Entorno

```bash
# Crear archivo .env en la raíz del proyecto
nano .env
```

**Agregar el siguiente contenido (reemplaza con tus valores reales):**

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
```

**Guardar:** `Ctrl + O`, `Enter`, `Ctrl + X`

---

## 🐍 PASO 6: Configurar Backend (Python)

```bash
# Ir a la carpeta backend
cd ~/proyecto/backend

# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Actualizar pip
pip install --upgrade pip

# Instalar dependencias
pip install -r requirements.txt

# Probar que el backend funciona
python main.py
```

**Presiona `Ctrl + C` para detener la prueba.**

---

## ⚙️ PASO 7: Configurar Gunicorn (Servidor de Producción para Python)

```bash
# Instalar Gunicorn en el entorno virtual (si no está)
pip install gunicorn

# Probar Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

**Si funciona correctamente, presiona `Ctrl + C` y continúa.**

### Crear servicio systemd para el backend

```bash
# Salir del entorno virtual
deactivate

# Crear archivo de servicio
sudo nano /etc/systemd/system/anonimizacion-backend.service
```

**Pegar el siguiente contenido (ajusta rutas si es necesario):**

```ini
[Unit]
Description=Backend de Anonimización de Datos
After=network.target

[Service]
Type=notify
User=TU_USUARIO
Group=www-data
WorkingDirectory=/home/TU_USUARIO/proyecto/backend
Environment="PATH=/home/TU_USUARIO/proyecto/backend/venv/bin"
ExecStart=/home/TU_USUARIO/proyecto/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**IMPORTANTE:** Reemplaza `TU_USUARIO` con tu usuario real (por ejemplo, `ubuntu`, `root`, etc.)

**Para saber tu usuario:** ejecuta `whoami`

**Guardar:** `Ctrl + O`, `Enter`, `Ctrl + X`

### Habilitar e iniciar el servicio

```bash
# Recargar systemd
sudo systemctl daemon-reload

# Habilitar servicio para que inicie con el sistema
sudo systemctl enable anonimizacion-backend

# Iniciar servicio
sudo systemctl start anonimizacion-backend

# Verificar estado
sudo systemctl status anonimizacion-backend
```

**Deberías ver:** `Active: active (running)`

**Ver logs en tiempo real:**
```bash
sudo journalctl -u anonimizacion-backend -f
```

**Presiona `Ctrl + C` para salir de los logs.**

---

## ⚛️ PASO 8: Compilar Frontend (React)

```bash
# Ir a la raíz del proyecto
cd ~/proyecto

# Instalar dependencias de Node.js
npm install

# Compilar para producción
npm run build
```

**Esto creará la carpeta `dist/` con los archivos compilados.**

---

## 🌐 PASO 9: Configurar Nginx

### Crear configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/anonimizacion
```

**Pegar el siguiente contenido:**

```nginx
server {
    listen 80;
    server_name TU_IP_PUBLICA;  # Reemplaza con tu IP o dominio

    # Frontend - Archivos estáticos de React
    root /home/TU_USUARIO/proyecto/dist;
    index index.html;

    # Servir archivos estáticos del frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para el backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Documentación de la API (opcional)
    location /docs {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Tamaño máximo de subida (para archivos grandes)
    client_max_body_size 50M;
}
```

**IMPORTANTE:** Reemplaza:
- `TU_IP_PUBLICA` con tu IP pública (ej: `192.168.1.100`) o dominio (ej: `miapp.com`)
- `TU_USUARIO` con tu usuario del sistema

**Guardar:** `Ctrl + O`, `Enter`, `Ctrl + X`

### Habilitar la configuración

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/anonimizacion /etc/nginx/sites-enabled/

# Eliminar configuración por defecto (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración de Nginx
sudo nginx -t
```

**Deberías ver:** `syntax is ok` y `test is successful`

### Reiniciar Nginx

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

---

## 🔥 PASO 10: Configurar Firewall (UFW)

```bash
# Habilitar UFW si no está habilitado
sudo ufw enable

# Permitir SSH (IMPORTANTE para no perder conexión)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar reglas
sudo ufw status
```

---

## ✅ PASO 11: Verificar que Todo Funciona

### Verificar backend

```bash
curl http://localhost:8000
```

**Deberías ver:** `{"message":"Data Anonymization System API","version":"1.0.0"}`

### Verificar desde navegador

1. Abre tu navegador
2. Ve a: `http://TU_IP_PUBLICA`
3. Deberías ver la aplicación funcionando

**Ejemplo:** `http://192.168.1.100`

### Verificar API desde navegador

- `http://TU_IP_PUBLICA/api/datasets` - Debería devolver `[]` (lista vacía)
- `http://TU_IP_PUBLICA/docs` - Documentación de la API

---

## 🔒 PASO 12: Configurar HTTPS con Let's Encrypt (SSL)

**NOTA:** Necesitas un dominio apuntando a tu IP pública para esto.

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL (reemplaza con tu dominio)
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Seguir las instrucciones en pantalla
# Elegir opción 2 (Redirect) para forzar HTTPS
```

**Certbot configurará automáticamente Nginx para HTTPS.**

### Renovación automática

```bash
# Probar renovación
sudo certbot renew --dry-run

# Si funciona, la renovación automática ya está configurada
```

---

## 🔄 PASO 13: Comandos Útiles para Gestionar el Servidor

### Backend

```bash
# Ver logs del backend
sudo journalctl -u anonimizacion-backend -f

# Reiniciar backend
sudo systemctl restart anonimizacion-backend

# Detener backend
sudo systemctl stop anonimizacion-backend

# Ver estado del backend
sudo systemctl status anonimizacion-backend
```

### Frontend/Nginx

```bash
# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Recompilar frontend después de cambios
cd ~/proyecto
npm run build
sudo systemctl restart nginx
```

### Sistema

```bash
# Ver uso de recursos
htop

# Ver espacio en disco
df -h

# Ver puertos abiertos
sudo netstat -tulpn | grep LISTEN
```

---

## 🔄 PASO 14: Actualizar la Aplicación

Cuando hagas cambios en el código:

```bash
# 1. Ir al proyecto
cd ~/proyecto

# 2. Actualizar código (si usas git)
git pull

# 3. Actualizar backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
sudo systemctl restart anonimizacion-backend

# 4. Actualizar frontend
cd ~/proyecto
npm install
npm run build
sudo systemctl restart nginx

# 5. Verificar que todo funciona
sudo systemctl status anonimizacion-backend
sudo systemctl status nginx
```

---

## 🛡️ PASO 15: Seguridad Adicional (Recomendado)

### 1. Cambiar puerto SSH (opcional pero recomendado)

```bash
sudo nano /etc/ssh/sshd_config

# Cambiar línea: Port 22
# Por: Port 2222  (o cualquier puerto > 1024)

sudo systemctl restart ssh

# IMPORTANTE: Actualizar firewall
sudo ufw allow 2222/tcp
sudo ufw delete allow 22/tcp
```

### 2. Crear usuario no-root (si usas root)

```bash
# Crear nuevo usuario
adduser deploy

# Agregar a sudo
usermod -aG sudo deploy

# Cambiar dueño del proyecto
chown -R deploy:deploy /home/deploy/proyecto
```

### 3. Configurar fail2ban (protección contra fuerza bruta)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Mantener el sistema actualizado

```bash
# Actualizar regularmente
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
```

---

## 🐛 Solución de Problemas

### Backend no inicia

```bash
# Ver logs detallados
sudo journalctl -u anonimizacion-backend -n 50

# Verificar que el puerto 8000 no esté en uso
sudo lsof -i :8000

# Verificar variables de entorno
cat ~/proyecto/.env
```

### Nginx muestra 502 Bad Gateway

```bash
# Verificar que el backend esté corriendo
sudo systemctl status anonimizacion-backend

# Reiniciar backend
sudo systemctl restart anonimizacion-backend

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### No puedo acceder desde Internet

```bash
# Verificar firewall
sudo ufw status

# Verificar que Nginx esté escuchando
sudo netstat -tulpn | grep :80

# Verificar que tu IP pública es correcta
curl ifconfig.me
```

### Errores de permisos

```bash
# Dar permisos correctos al proyecto
sudo chown -R $USER:www-data ~/proyecto
sudo chmod -R 755 ~/proyecto
```

---

## 📊 Monitoreo (Opcional)

### Instalar herramientas de monitoreo

```bash
# Instalar htop (monitoreo de recursos)
sudo apt install -y htop

# Instalar ncdu (analizar espacio en disco)
sudo apt install -y ncdu
```

### Ver estadísticas en tiempo real

```bash
# CPU y memoria
htop

# Espacio en disco
ncdu /

# Conexiones activas
sudo netstat -an | grep :80 | wc -l
```

---

## 🎉 ¡Listo!

Tu aplicación ahora está:
- ✅ Funcionando en tu IP pública
- ✅ Backend corriendo como servicio
- ✅ Frontend servido por Nginx
- ✅ Configurado para reiniciarse automáticamente
- ✅ Listo para recibir tráfico

**Acceso:**
- Frontend: `http://TU_IP_PUBLICA`
- API: `http://TU_IP_PUBLICA/api/`
- Docs: `http://TU_IP_PUBLICA/docs`

---

## 📝 Checklist Final

- [ ] Backend corre y responde en puerto 8000
- [ ] Frontend compilado en carpeta `dist/`
- [ ] Nginx configurado y corriendo
- [ ] Firewall permite tráfico HTTP/HTTPS
- [ ] Aplicación accesible desde navegador externo
- [ ] Variables de entorno configuradas correctamente
- [ ] Servicios configurados para reinicio automático
- [ ] (Opcional) SSL configurado con Let's Encrypt

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs del backend: `sudo journalctl -u anonimizacion-backend -f`
2. Revisa los logs de Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Verifica que los servicios estén corriendo: `sudo systemctl status anonimizacion-backend nginx`
4. Verifica el firewall: `sudo ufw status`

---

**¡Tu aplicación de anonimización de datos está ahora en producción! 🚀**
