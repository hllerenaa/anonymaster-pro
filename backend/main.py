import logging
import os
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, File, UploadFile, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
from io import BytesIO
import json
from collections import Counter
import math
from database import get_database, load_credentials

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

credentials = load_credentials()
db = get_database()

app = FastAPI(title="Data Anonymization System API")

cors_origins = credentials['backend'].get('cors_origins', ['*'])
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ColumnMapping(BaseModel):
    column: str
    type: str

class TechniqueConfig(BaseModel):
    column: str
    technique: str
    params: Dict[str, Any] = {}

class AnonymizationConfig(BaseModel):
    dataset_id: str
    name: str
    column_mappings: List[ColumnMapping]
    techniques: List[TechniqueConfig]
    global_params: Dict[str, Any]

class ProcessRequest(BaseModel):
    dataset_id: str
    config_id: str

def get_current_user():
    return "public-user"

def log_audit(user_id: str, action: str, resource_type: str, resource_id: str, details: Dict = None):
    try:
        db.insert_returning("audit_logs", {
            "user_id": user_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "details": json.dumps(details or {}),
            "timestamp": datetime.utcnow()
        })
    except Exception as e:
        logger.error(f"Failed to log audit: {str(e)}")

@app.get("/", response_class=HTMLResponse)
def read_root():
    html_content = """
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Data Anonymization System API</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 40px 20px;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            }

            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 60px 40px;
                text-align: center;
            }

            .header h1 {
                font-size: 3rem;
                margin-bottom: 10px;
                font-weight: 700;
            }

            .header p {
                font-size: 1.2rem;
                opacity: 0.95;
                margin-bottom: 20px;
            }

            .badges {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
                margin-top: 30px;
            }

            .badge {
                background: rgba(255, 255, 255, 0.2);
                padding: 8px 20px;
                border-radius: 20px;
                font-size: 0.9rem;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.3);
            }

            .content {
                padding: 40px;
            }

            .section {
                margin-bottom: 50px;
            }

            .section-title {
                font-size: 2rem;
                color: #667eea;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 3px solid #667eea;
            }

            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }

            .card {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 25px;
                border: 2px solid #e9ecef;
                transition: all 0.3s ease;
            }

            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
                border-color: #667eea;
            }

            .endpoint {
                background: white;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin-bottom: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }

            .method {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 6px;
                font-weight: 700;
                font-size: 0.85rem;
                margin-right: 10px;
            }

            .method.get {
                background: #10b981;
                color: white;
            }

            .method.post {
                background: #3b82f6;
                color: white;
            }

            .path {
                font-family: 'Courier New', monospace;
                color: #667eea;
                font-weight: 600;
                font-size: 1.1rem;
                margin-bottom: 10px;
            }

            .description {
                color: #6b7280;
                line-height: 1.6;
                margin-top: 10px;
            }

            .params {
                margin-top: 12px;
                padding: 12px;
                background: #f9fafb;
                border-radius: 6px;
            }

            .params-title {
                font-weight: 600;
                color: #374151;
                margin-bottom: 8px;
                font-size: 0.9rem;
            }

            .param-item {
                padding: 6px 12px;
                background: white;
                border-radius: 4px;
                margin: 4px 0;
                font-size: 0.85rem;
                color: #4b5563;
                font-family: 'Courier New', monospace;
            }

            .technique {
                padding: 10px 15px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 8px;
                margin: 8px 0;
                font-size: 0.9rem;
            }

            .metric-card {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 20px;
                border-radius: 12px;
                margin: 10px 0;
            }

            .metric-title {
                font-weight: 700;
                font-size: 1.1rem;
                margin-bottom: 8px;
            }

            .metric-desc {
                opacity: 0.95;
                line-height: 1.5;
            }

            .model-item {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                margin: 10px 0;
                font-weight: 500;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }

            .info-item {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 10px;
                border-left: 4px solid #667eea;
            }

            .info-label {
                font-size: 0.85rem;
                color: #6b7280;
                margin-bottom: 5px;
                text-transform: uppercase;
                font-weight: 600;
            }

            .info-value {
                font-size: 1.1rem;
                color: #111827;
                font-weight: 600;
            }

            .footer {
                background: #1f2937;
                color: white;
                text-align: center;
                padding: 30px;
                font-size: 0.9rem;
            }

            @media (max-width: 768px) {
                .header h1 {
                    font-size: 2rem;
                }

                .content {
                    padding: 20px;
                }

                .section-title {
                    font-size: 1.5rem;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Data Anonymization System</h1>
                <p>API para anonimización de datos con técnicas avanzadas de privacidad</p>
                <div class="badges">
                    <span class="badge">✅ Online</span>
                    <span class="badge">v1.0.0</span>
                    <span class="badge">PostgreSQL</span>
                    <span class="badge">FastAPI</span>
                </div>
            </div>

            <div class="content">
                <div class="section">
                    <h2 class="section-title">📊 Información del Sistema</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Formatos</div>
                            <div class="info-value">CSV, Excel</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Tamaño máximo</div>
                            <div class="info-value">50 MB</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">CORS</div>
                            <div class="info-value">Habilitado</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Autenticación</div>
                            <div class="info-value">Pública</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">🚀 Endpoints de la API</h2>

                    <div class="endpoint">
                        <div>
                            <span class="method get">GET</span>
                            <span class="path">/</span>
                        </div>
                        <div class="description">Información general de la API y documentación completa</div>
                    </div>

                    <div class="endpoint">
                        <div>
                            <span class="method post">POST</span>
                            <span class="path">/api/datasets/upload</span>
                        </div>
                        <div class="description">Subir un nuevo dataset (CSV o Excel) para su posterior anonimización</div>
                        <div class="params">
                            <div class="params-title">Parámetros:</div>
                            <div class="param-item">file: UploadFile (CSV o XLSX, máx 50MB)</div>
                        </div>
                    </div>

                    <div class="endpoint">
                        <div>
                            <span class="method get">GET</span>
                            <span class="path">/api/datasets</span>
                        </div>
                        <div class="description">Listar todos los datasets subidos con metadata (nombre, filas, columnas, fecha)</div>
                    </div>

                    <div class="endpoint">
                        <div>
                            <span class="method get">GET</span>
                            <span class="path">/api/datasets/{dataset_id}</span>
                        </div>
                        <div class="description">Obtener información detallada de un dataset específico con schema y preview</div>
                        <div class="params">
                            <div class="params-title">Parámetros:</div>
                            <div class="param-item">dataset_id: UUID</div>
                        </div>
                    </div>

                    <div class="endpoint">
                        <div>
                            <span class="method post">POST</span>
                            <span class="path">/api/configs</span>
                        </div>
                        <div class="description">Crear una nueva configuración de anonimización con técnicas específicas</div>
                        <div class="params">
                            <div class="params-title">Parámetros JSON:</div>
                            <div class="param-item">dataset_id: UUID</div>
                            <div class="param-item">name: string</div>
                            <div class="param-item">column_mappings: array</div>
                            <div class="param-item">techniques: array</div>
                            <div class="param-item">global_params: object</div>
                        </div>
                    </div>

                    <div class="endpoint">
                        <div>
                            <span class="method get">GET</span>
                            <span class="path">/api/configs</span>
                        </div>
                        <div class="description">Listar todas las configuraciones de anonimización guardadas</div>
                        <div class="params">
                            <div class="params-title">Query params (opcional):</div>
                            <div class="param-item">dataset_id: UUID</div>
                        </div>
                    </div>

                    <div class="endpoint">
                        <div>
                            <span class="method post">POST</span>
                            <span class="path">/api/process</span>
                        </div>
                        <div class="description">Procesar la anonimización de un dataset aplicando una configuración específica</div>
                        <div class="params">
                            <div class="params-title">Parámetros JSON:</div>
                            <div class="param-item">dataset_id: UUID</div>
                            <div class="param-item">config_id: UUID</div>
                        </div>
                    </div>

                    <div class="endpoint">
                        <div>
                            <span class="method get">GET</span>
                            <span class="path">/api/results</span>
                        </div>
                        <div class="description">Listar todos los resultados de anonimización con métricas de privacidad</div>
                    </div>

                    <div class="endpoint">
                        <div>
                            <span class="method get">GET</span>
                            <span class="path">/api/results/{result_id}</span>
                        </div>
                        <div class="description">Obtener un resultado específico con datos anonimizados y métricas detalladas</div>
                        <div class="params">
                            <div class="params-title">Parámetros:</div>
                            <div class="param-item">result_id: UUID</div>
                        </div>
                    </div>

                    <div class="endpoint">
                        <div>
                            <span class="method get">GET</span>
                            <span class="path">/api/stats</span>
                        </div>
                        <div class="description">Obtener estadísticas generales del sistema (datasets, configs, resultados)</div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">🛠️ Técnicas de Anonimización</h2>
                    <div class="technique">
                        <strong>Generalization</strong> - Generalizar valores en rangos o categorías más amplias
                    </div>
                    <div class="technique">
                        <strong>Suppression</strong> - Suprimir valores sensibles reemplazándolos con asteriscos
                    </div>
                    <div class="technique">
                        <strong>Pseudonymization</strong> - Reemplazar datos reales con pseudónimos consistentes
                    </div>
                    <div class="technique">
                        <strong>Noise Addition</strong> - Agregar ruido aleatorio usando privacidad diferencial
                    </div>
                    <div class="technique">
                        <strong>Masking</strong> - Enmascarar parcialmente datos sensibles (ej: email, teléfono)
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">📈 Métricas de Privacidad</h2>
                    <div class="metric-card">
                        <div class="metric-title">K-Anonymity</div>
                        <div class="metric-desc">
                            Garantiza que cada registro es indistinguible de al menos K-1 registros similares,
                            protegiendo contra ataques de re-identificación
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-title">L-Diversity</div>
                        <div class="metric-desc">
                            Garantiza al menos L valores diferentes en atributos sensibles por cada grupo equivalente,
                            protegiendo contra ataques de homogeneidad
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-title">Information Loss</div>
                        <div class="metric-desc">
                            Mide el porcentaje de información perdida durante el proceso de anonimización,
                            permitiendo evaluar el balance entre privacidad y utilidad
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">🔐 Modelos de Privacidad</h2>
                    <div class="model-item">
                        <strong>K-Anonymity</strong> - Indistinguibilidad en grupos de K registros
                    </div>
                    <div class="model-item">
                        <strong>L-Diversity</strong> - Diversidad en atributos sensibles dentro de grupos
                    </div>
                    <div class="model-item">
                        <strong>Differential Privacy</strong> - Privacidad con garantías matemáticas formales
                    </div>
                </div>
            </div>

            <div class="footer">
                <p><strong>Data Anonymization System API v1.0.0</strong></p>
                <p>Sistema de anonimización con técnicas avanzadas de privacidad | PostgreSQL | FastAPI</p>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.post("/api/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    logger.info(f"User {user_id} uploading file: {file.filename}")

    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Only Excel (.xlsx, .xls) and CSV files are supported")

    max_size_mb = credentials['backend'].get('max_upload_size_mb', 50)
    if file.size and file.size > max_size_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File size must be less than {max_size_mb}MB")

    try:
        contents = await file.read()

        if file.filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(contents))
        else:
            df = pd.read_excel(BytesIO(contents))

        df = df.replace({np.nan: None})

        data_json = df.to_dict(orient='records')
        column_names = df.columns.tolist()

        dataset = {
            "user_id": user_id,
            "name": file.filename.rsplit('.', 1)[0],
            "original_filename": file.filename,
            "file_size": len(contents),
            "row_count": len(df),
            "column_count": len(df.columns),
            "column_names": json.dumps(column_names),
            "data": json.dumps(data_json),
            "status": "ready",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = db.insert_returning("datasets", dataset)

        log_audit(user_id, "upload_dataset", "dataset", result["id"], {
            "filename": file.filename,
            "rows": len(df),
            "columns": len(df.columns)
        })

        # result['column_names'] = json.loads(result['column_names'])
        # result['data'] = json.loads(result['data'])
        result['column_names'] = json.loads(result['column_names']) if isinstance(result.get('column_names'), str) else result.get('column_names', [])
        result['data'] = json.loads(result['data']) if isinstance(result.get('data'), str) else result.get('data', [])


        logger.info(f"Dataset uploaded successfully: {result['id']}")
        return result

    except Exception as e:
        linea_error = e.__traceback__.tb_lineno
        logger.error(f"Error uploading dataset: {str(e)} - Line: {linea_error}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)} - Line: {linea_error}")

@app.get("/api/datasets")
def get_datasets(user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} fetching datasets")
    try:
        results = db.execute_query(
            "SELECT * FROM datasets WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,),
            fetch=True
        )

        for result in results:
            if isinstance(result.get('column_names'), str):
                result['column_names'] = json.loads(result['column_names'])
            if isinstance(result.get('data'), str):
                result['data'] = json.loads(result['data'])

        return results
    except Exception as e:
        logger.error(f"Error fetching datasets: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/datasets/{dataset_id}")
def get_dataset(dataset_id: str, user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} fetching dataset {dataset_id}")
    try:
        result = db.select_one("datasets", {"id": dataset_id, "user_id": user_id})
        if not result:
            raise HTTPException(status_code=404, detail="Dataset not found")

        if isinstance(result.get('column_names'), str):
            result['column_names'] = json.loads(result['column_names'])
        if isinstance(result.get('data'), str):
            result['data'] = json.loads(result['data'])

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching dataset: {str(e)}")
        raise HTTPException(status_code=404, detail="Dataset not found")

@app.post("/api/configs")
def create_config(config: AnonymizationConfig, user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} creating config for dataset {config.dataset_id}")
    try:
        config_data = {
            "user_id": user_id,
            "dataset_id": config.dataset_id,
            "name": config.name,
            "column_mappings": json.dumps([mapping.dict() for mapping in config.column_mappings]),
            "techniques": json.dumps([tech.dict() for tech in config.techniques]),
            "global_params": json.dumps(config.global_params),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = db.insert_returning("anonymization_configs", config_data)

        log_audit(user_id, "create_config", "config", result["id"], {
            "dataset_id": config.dataset_id,
            "name": config.name
        })

        # result['column_mappings'] = json.loads(result['column_mappings'])
        # result['techniques'] = json.loads(result['techniques'])
        # result['global_params'] = json.loads(result['global_params'])

        result['column_mappings'] = json.loads(result['column_mappings']) if isinstance(result.get('column_mappings'), str) else result.get('column_mappings', [])
        result['techniques'] = json.loads(result['techniques']) if isinstance(result.get('techniques'), str) else result.get('techniques', [])
        result['global_params'] = json.loads(result['global_params']) if isinstance(result.get('global_params'), str) else result.get('global_params', {})

        logger.info(f"Config created successfully: {result['id']}")
        return result

    except Exception as e:
        logger.error(f"Error creating config: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/configs")
def get_configs(dataset_id: Optional[str] = None, user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} fetching configs")
    try:
        if dataset_id:
            query = "SELECT * FROM anonymization_configs WHERE user_id = %s AND dataset_id = %s ORDER BY created_at DESC"
            params = (user_id, dataset_id)
        else:
            query = "SELECT * FROM anonymization_configs WHERE user_id = %s ORDER BY created_at DESC"
            params = (user_id,)

        results = db.execute_query(query, params, fetch=True)

        for result in results:
            if isinstance(result.get('column_mappings'), str):
                result['column_mappings'] = json.loads(result['column_mappings'])
            if isinstance(result.get('techniques'), str):
                result['techniques'] = json.loads(result['techniques'])
            if isinstance(result.get('global_params'), str):
                result['global_params'] = json.loads(result['global_params'])

        return results
    except Exception as e:
        logger.error(f"Error fetching configs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------
# MÉTRICAS
# --------------------------------------------------
def calculate_k_anonymity(df: pd.DataFrame, quasi_identifiers: List[str]) -> int:
    if not quasi_identifiers:
        return len(df)
    groups = df.groupby(quasi_identifiers).size()
    return int(groups.min()) if len(groups) > 0 else 0

def calculate_l_diversity(df: pd.DataFrame, quasi_identifiers: List[str], sensitive_attr: str) -> float:
    if not quasi_identifiers or not sensitive_attr:
        return 0.0
    groups = df.groupby(quasi_identifiers)[sensitive_attr]
    return float(groups.apply(lambda x: len(x.unique())).min())

def calculate_information_loss(original_df: pd.DataFrame, anonymized_df: pd.DataFrame, columns: List[str]) -> float:
    total_loss = 0.0
    for col in columns:
        if col not in original_df.columns or col not in anonymized_df.columns:
            continue

        if pd.api.types.is_numeric_dtype(original_df[col]):
            try:
                orig_range = original_df[col].max() - original_df[col].min()
                if orig_range == 0:
                    continue
                anon_range = anonymized_df[col].max() - anonymized_df[col].min()
                loss = 1 - (anon_range / orig_range)
                total_loss += loss
            except (TypeError, ValueError):
                # If anonymized column became non-numeric (e.g., generalization to ranges)
                # Calculate loss based on unique values instead
                orig_unique = len(original_df[col].unique())
                anon_unique = len(anonymized_df[col].unique())
                if orig_unique > 0:
                    loss = 1 - (anon_unique / orig_unique)
                    total_loss += loss
        else:
            orig_unique = len(original_df[col].unique())
            anon_unique = len(anonymized_df[col].unique())
            if orig_unique > 0:
                loss = 1 - (anon_unique / orig_unique)
                total_loss += loss

    return (total_loss / len(columns)) * 100 if columns else 0.0

# --------------------------------------------------
# FUNCIONES DE APOYO
# --------------------------------------------------
def generalize_numeric(series: pd.Series, bins: int = 5) -> pd.Series:
    try:
        labels = [f"Rango {i+1}" for i in range(bins)]
        return pd.cut(series, bins=bins, labels=labels, duplicates='drop')
    except Exception:
        return series.astype(str)

def generalize_categorical(series: pd.Series, levels: int = 1) -> pd.Series:
    if levels == 1:
        return pd.Series(['Generalizado'] * len(series), index=series.index)
    counts = series.value_counts()
    top = counts.head(levels).index.tolist()
    return series.apply(lambda x: x if x in top else 'Otros')

def suppress_data(series: pd.Series, threshold: float = 0.1) -> pd.Series:
    result = series.copy()
    n = int(len(series) * threshold)
    if n > 0:
        idx = np.random.choice(series.index, size=n, replace=False)
        result.loc[idx] = '*'
    return result

def apply_differential_privacy(series: pd.Series, epsilon: float = 1.0) -> pd.Series:
    if not pd.api.types.is_numeric_dtype(series):
        return series
    sensitivity = series.max() - series.min()
    if sensitivity == 0:
        return series
    scale = sensitivity / epsilon
    noise = np.random.laplace(0, scale, size=len(series))
    return series + noise

# --------------------------------------------------
# K-ANONIMATO
# --------------------------------------------------
def apply_k_anonymity_algorithm(df, quasi_identifiers, k, technique_details):
    result_df = df.copy()
    changes = []

    for col in quasi_identifiers:
        if col not in result_df.columns:
            continue

        original_unique = result_df[col].nunique()

        if pd.api.types.is_numeric_dtype(result_df[col]):
            result_df[col] = generalize_numeric(result_df[col], bins=max(2, k))
            changes.append(f"Se generalizó la columna numérica '{col}' en rangos")
        else:
            result_df[col] = generalize_categorical(result_df[col], levels=2)
            changes.append(f"Se generalizó la columna categórica '{col}'")

        new_unique = result_df[col].nunique()
        changes.append(f"→ Se redujeron los valores únicos de {original_unique} a {new_unique}")

    achieved_k = calculate_k_anonymity(result_df, quasi_identifiers)

    technique_details["k_anonymity"] = {
        "technique": "K-Anonimato",
        "target_k": k,
        "achieved_k": achieved_k,
        "quasi_identifiers": quasi_identifiers,
        "changes": changes,
        "explanation": (
            "Se agruparon los registros para que cada fila del conjunto de datos "
            f"no pueda diferenciarse de al menos {k - 1} registros adicionales. "
            f"K objetivo: {k}. K logrado: {achieved_k}."
        )
    }
    return result_df

# --------------------------------------------------
# L-DIVERSIDAD
# --------------------------------------------------
def apply_l_diversity_algorithm(df, quasi_identifiers, sensitive_col, l, technique_details):
    result_df = df.copy()
    changes = []

    for _, group in result_df.groupby(quasi_identifiers):
        diversity = group[sensitive_col].nunique()
        if diversity < l:
            changes.append(
                f"Se detectó un grupo con {diversity} valores sensibles distintos "
                f"(menor al mínimo esperado de {l})"
            )

    achieved_l = calculate_l_diversity(result_df, quasi_identifiers, sensitive_col)

    technique_details["l_diversity"] = {
        "technique": "L-Diversidad",
        "target_l": l,
        "achieved_l": achieved_l,
        "sensitive_attribute": sensitive_col,
        "quasi_identifiers": quasi_identifiers,
        "changes": changes,
        "explanation": (
            "Se validó que cada grupo de registros tenga suficientes valores distintos "
            "en la información sensible, reduciendo el riesgo de inferencia directa. "
            f"L objetivo: {l}. L logrado: {achieved_l}."
        )
    }
    return result_df

# --------------------------------------------------
# APLICACIÓN DE TÉCNICAS
# --------------------------------------------------
def apply_techniques(df, config, technique_details):
    result_df = df.copy()

    # column_mappings = json.loads(config["column_mappings"])
    # techniques = json.loads(config["techniques"])
    # global_params = json.loads(config["global_params"])

    column_mappings = (
        json.loads(config["column_mappings"])
        if isinstance(config.get("column_mappings"), str)
        else config.get("column_mappings", [])
    )

    techniques = (
        json.loads(config["techniques"])
        if isinstance(config.get("techniques"), str)
        else config.get("techniques", [])
    )

    global_params = (
        json.loads(config["global_params"])
        if isinstance(config.get("global_params"), str)
        else config.get("global_params", {})
    )

    quasi_identifiers = [m["column"] for m in column_mappings if m["type"] == "quasi-identifier"]
    sensitive_columns = [m["column"] for m in column_mappings if m["type"] == "sensitive"]
    identifiers = [m["column"] for m in column_mappings if m["type"] == "identifier"]

    # Eliminar identificadores directos
    for col in identifiers:
        if col in result_df.columns:
            result_df.drop(columns=[col], inplace=True)
            technique_details[f"identifier_{col}"] = {
                "technique": "Supresión de Identificadores",
                "changes": [f"Se eliminó completamente la columna '{col}'"],
                "explanation": (
                    "Los identificadores directos permiten reconocer a una persona "
                    "sin esfuerzo, por lo que se eliminan completamente."
                )
            }

    for tech in techniques:
        col = tech["column"]
        if col not in result_df.columns:
            continue

        params = tech.get("params", {})
        sample_before = result_df[col].iloc[0]

        if tech["technique"] == "generalization":
            if pd.api.types.is_numeric_dtype(result_df[col]):
                bins = params.get("bins", 5)
                result_df[col] = generalize_numeric(result_df[col], bins)
                explanation = (
                    "Los valores numéricos exactos fueron reemplazados por rangos "
                    "para disminuir el nivel de detalle del dato."
                )
            else:
                levels = params.get("levels", 1)
                result_df[col] = generalize_categorical(result_df[col], levels)
                explanation = (
                    "Los valores específicos fueron agrupados en categorías "
                    "más generales para evitar valores únicos."
                )

            technique_details[f"generalization_{col}"] = {
                "technique": "Generalización",
                "column": col,
                "params": params,
                "changes": [f"Ejemplo: {sample_before} → {result_df[col].iloc[0]}"],
                "explanation": explanation
            }

        elif tech["technique"] == "suppression":
            threshold = params.get("threshold", 0.1)
            result_df[col] = suppress_data(result_df[col], threshold)
            suppressed_count = (result_df[col] == '*').sum()
            technique_details[f"suppression_{col}"] = {
                "technique": "Supresión",
                "column": col,
                "params": params,
                "changes": [
                    f"Se ocultaron {suppressed_count} valores ({threshold*100}%) usando '*'"
                ],
                "explanation": (
                    "Una parte de los datos fue ocultada aleatoriamente "
                    "para reducir la posibilidad de identificación directa."
                )
            }

        elif tech["technique"] == "differential_privacy":
            epsilon = params.get("epsilon", 1.0)
            result_df[col] = apply_differential_privacy(result_df[col], epsilon)
            technique_details[f"differential_privacy_{col}"] = {
                "technique": "Privacidad Diferencial",
                "column": col,
                "params": params,
                "changes": [f"Ejemplo: {sample_before} → {result_df[col].iloc[0]}"],
                "explanation": (
                    f"Se añadió ruido aleatorio controlado (epsilon={epsilon}) "
                    "para proteger la información individual."
                )
            }

    # Aplicar métricas globales
    k = global_params.get("k", 2)
    if quasi_identifiers and k > 1:
        result_df = apply_k_anonymity_algorithm(result_df, quasi_identifiers, k, technique_details)

    l = global_params.get("l", 2)
    if quasi_identifiers and sensitive_columns and l > 1:
        result_df = apply_l_diversity_algorithm(
            result_df, quasi_identifiers, sensitive_columns[0], l, technique_details
        )

    if not technique_details:
        technique_details["no_changes"] = {
            "technique": "Sin Transformaciones",
            "explanation": (
                "No se aplicaron técnicas de anonimización adicionales porque la "
                "configuración no requería generalización, supresión o ajustes globales. "
                "Los datos ya cumplían las condiciones mínimas definidas."
            ),
            "changes": []
        }
    return result_df


@app.post("/api/process")
async def process_anonymization(request: ProcessRequest, user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} processing dataset {request.dataset_id} with config {request.config_id}")
    start_time = time.time()

    try:
        dataset = db.select_one("datasets", {"id": request.dataset_id, "user_id": user_id})
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")

        config = db.select_one("anonymization_configs", {"id": request.config_id, "user_id": user_id})
        if not config:
            raise HTTPException(status_code=404, detail="Config not found")

        data = dataset["data"]
        if isinstance(data, str):
            data = json.loads(data)
        df = pd.DataFrame(data)

        technique_details = {}
        anonymized_df = apply_techniques(df, config, technique_details)

        column_mappings = config["column_mappings"]
        if isinstance(column_mappings, str):
            column_mappings = json.loads(column_mappings)

        quasi_identifiers = [m["column"] for m in column_mappings if m["type"] == "quasi-identifier"]
        sensitive_columns = [m["column"] for m in column_mappings if m["type"] == "sensitive"]

        k_value = calculate_k_anonymity(anonymized_df, quasi_identifiers) if quasi_identifiers else 0
        l_value = calculate_l_diversity(anonymized_df, quasi_identifiers, sensitive_columns[0]) if quasi_identifiers and sensitive_columns else 0.0
        info_loss = calculate_information_loss(df, anonymized_df, df.columns.tolist())

        metrics = {
            "k_anonymity": k_value,
            "l_diversity": l_value,
            "information_loss_percentage": round(info_loss, 2),
            "original_rows": len(df),
            "anonymized_rows": len(anonymized_df),
            "original_columns": len(df.columns),
            "anonymized_columns": len(anonymized_df.columns),
            "quasi_identifiers": quasi_identifiers,
            "sensitive_attributes": sensitive_columns
        }

        processing_time = int((time.time() - start_time) * 1000)

        result_data = {
            "user_id": user_id,
            "dataset_id": request.dataset_id,
            "config_id": request.config_id,
            "anonymized_data": json.dumps(anonymized_df.to_dict(orient='records')),
            "metrics": json.dumps(metrics),
            "technique_details": json.dumps(technique_details),
            "status": "completed",
            "processing_time_ms": processing_time,
            "completed_at": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }

        result = db.insert_returning("anonymization_results", result_data)

        log_audit(user_id, "process_anonymization", "result", result["id"], {
            "dataset_id": request.dataset_id,
            "config_id": request.config_id,
            "k_value": k_value,
            "processing_time_ms": processing_time
        })

        # result['anonymized_data'] = json.loads(result['anonymized_data'])
        # result['metrics'] = json.loads(result['metrics'])
        # result['technique_details'] = json.loads(result['technique_details'])

        result['anonymized_data'] = json.loads(result['anonymized_data']) if isinstance(result.get('anonymized_data'), str) else result.get('anonymized_data', [])
        result['metrics'] = json.loads(result['metrics']) if isinstance(result.get('metrics'), str) else result.get('metrics', {})
        result['technique_details'] = json.loads(result['technique_details']) if isinstance(result.get('technique_details'), str) else result.get('technique_details', {})

        logger.info(f"Processing completed in {processing_time}ms, result: {result['id']}")
        return result

    except Exception as e:
        logger.error(f"Error processing anonymization: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/results")
def get_results(dataset_id: Optional[str] = None, user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} fetching results")
    try:
        if dataset_id:
            query = "SELECT * FROM anonymization_results WHERE user_id = %s AND dataset_id = %s ORDER BY created_at DESC"
            params = (user_id, dataset_id)
        else:
            query = "SELECT * FROM anonymization_results WHERE user_id = %s ORDER BY created_at DESC"
            params = (user_id,)

        results = db.execute_query(query, params, fetch=True)

        for result in results:
            if isinstance(result.get('anonymized_data'), str):
                result['anonymized_data'] = json.loads(result['anonymized_data'])
            if isinstance(result.get('metrics'), str):
                result['metrics'] = json.loads(result['metrics'])
            if isinstance(result.get('technique_details'), str):
                result['technique_details'] = json.loads(result['technique_details'])

        return results
    except Exception as e:
        logger.error(f"Error fetching results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/results/{result_id}")
def get_result(result_id: str, user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} fetching result {result_id}")
    try:
        result = db.select_one("anonymization_results", {"id": result_id, "user_id": user_id})
        if not result:
            raise HTTPException(status_code=404, detail="Result not found")

        if isinstance(result.get('anonymized_data'), str):
            result['anonymized_data'] = json.loads(result['anonymized_data'])
        if isinstance(result.get('metrics'), str):
            result['metrics'] = json.loads(result['metrics'])
        if isinstance(result.get('technique_details'), str):
            result['technique_details'] = json.loads(result['technique_details'])

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching result: {str(e)}")
        raise HTTPException(status_code=404, detail="Result not found")

@app.get("/api/stats")
def get_stats(user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} fetching statistics")
    try:
        datasets = db.execute_query("SELECT * FROM datasets WHERE user_id = %s", (user_id,), fetch=True)
        configs = db.execute_query("SELECT * FROM anonymization_configs WHERE user_id = %s", (user_id,), fetch=True)
        results = db.execute_query("SELECT * FROM anonymization_results WHERE user_id = %s", (user_id,), fetch=True)

        total_rows_processed = 0
        total_processing_time = 0

        for r in results:
            metrics = r.get("metrics")
            if isinstance(metrics, str):
                metrics = json.loads(metrics)
            total_rows_processed += metrics.get("original_rows", 0)
            total_processing_time += r.get("processing_time_ms", 0)

        avg_processing_time = total_processing_time / len(results) if results else 0

        return {
            "total_datasets": len(datasets),
            "total_configs": len(configs),
            "total_results": len(results),
            "total_rows_processed": total_rows_processed,
            "avg_processing_time_ms": round(avg_processing_time, 2)
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    backend_config = credentials['backend']
    uvicorn.run(
        app,
        host=backend_config.get('host', '0.0.0.0'),
        port=backend_config.get('port', 8000)
    )
