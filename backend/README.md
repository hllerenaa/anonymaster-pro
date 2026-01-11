# Backend de Anonimización de Datos

Este backend procesa la anonimización de datos usando algoritmos de privacidad como K-Anonimato, L-Diversidad y Privacidad Diferencial.

## Requisitos Previos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

## Instalación

### 1. Crear un Entorno Virtual (Recomendado)

```bash
# En Windows
python -m venv venv
venv\Scripts\activate

# En macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Instalar Dependencias

```bash
pip install -r requirements.txt
```

## Configuración

El backend lee automáticamente las variables de entorno del archivo `.env` en la raíz del proyecto. Asegúrate de que el archivo `.env` contenga:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

## Ejecución

### Opción 1: Usando Python directamente

```bash
python main.py
```

### Opción 2: Usando Uvicorn (con recarga automática en desarrollo)

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en: **http://localhost:8000**

## Verificar que el Backend está Funcionando

Abre tu navegador y visita:
- http://localhost:8000 - Deberías ver un mensaje JSON con información de la API
- http://localhost:8000/docs - Documentación interactiva de la API (Swagger UI)

## API Endpoints

- `POST /api/datasets/upload` - Subir un dataset
- `GET /api/datasets` - Listar todos los datasets
- `POST /api/configs` - Crear configuración de anonimización
- `POST /api/process` - Procesar anonimización
- `GET /api/results` - Obtener resultados de anonimización

## Solución de Problemas

### Error: "ModuleNotFoundError"
Asegúrate de haber activado el entorno virtual e instalado todas las dependencias.

### Error: "Address already in use"
El puerto 8000 ya está en uso. Puedes:
1. Cerrar la aplicación que usa el puerto 8000
2. O cambiar el puerto: `python main.py --port 8001`

### Error: "Cannot connect to Supabase"
Verifica que las variables de entorno en `.env` sean correctas.

## Estructura del Proyecto

```
backend/
├── main.py              # Aplicación FastAPI principal
├── requirements.txt     # Dependencias de Python
├── README.md           # Este archivo
└── sample_dataset.csv  # Dataset de ejemplo para pruebas
```

## Tecnologías Utilizadas

- **FastAPI** - Framework web moderno y rápido
- **Pandas** - Procesamiento de datos
- **NumPy** - Operaciones numéricas
- **Scikit-learn** - Algoritmos de machine learning
- **Supabase** - Base de datos y autenticación

## Notas de Desarrollo

- El backend usa CORS configurado para aceptar solicitudes desde cualquier origen (`*`) para facilitar el desarrollo
- En producción, deberías restringir CORS a tu dominio específico
- Los logs se escriben en la consola para facilitar la depuración
