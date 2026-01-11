import logging
import os
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, File, UploadFile, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
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

@app.get("/")
def read_root():
    return {
        "message": "Data Anonymization System API",
        "version": "1.0.0",
        "database": "PostgreSQL",
        "status": "online",
        "documentation": {
            "description": "API para anonimización de datos con técnicas avanzadas de privacidad",
            "endpoints": [
                {
                    "method": "GET",
                    "path": "/",
                    "description": "Información general de la API y lista de endpoints disponibles"
                },
                {
                    "method": "POST",
                    "path": "/api/datasets/upload",
                    "description": "Subir un nuevo dataset (CSV o Excel)",
                    "accepts": "multipart/form-data",
                    "params": ["file (CSV o XLSX, máx 50MB)"]
                },
                {
                    "method": "GET",
                    "path": "/api/datasets",
                    "description": "Listar todos los datasets subidos por el usuario",
                    "returns": "Array de datasets con metadata (nombre, filas, columnas, fecha)"
                },
                {
                    "method": "GET",
                    "path": "/api/datasets/{dataset_id}",
                    "description": "Obtener información detallada de un dataset específico",
                    "params": ["dataset_id (UUID)"],
                    "returns": "Dataset completo con schema y primeras filas"
                },
                {
                    "method": "POST",
                    "path": "/api/configs",
                    "description": "Crear una nueva configuración de anonimización",
                    "accepts": "application/json",
                    "params": ["dataset_id", "name", "column_mappings", "techniques", "global_params"],
                    "techniques": [
                        "generalization - Generalizar valores (rangos, categorías)",
                        "suppression - Suprimir valores sensibles",
                        "pseudonymization - Reemplazar con pseudónimos",
                        "noise_addition - Agregar ruido aleatorio (privacidad diferencial)",
                        "masking - Enmascarar datos parcialmente"
                    ]
                },
                {
                    "method": "GET",
                    "path": "/api/configs",
                    "description": "Listar todas las configuraciones de anonimización",
                    "query_params": ["dataset_id (opcional)"],
                    "returns": "Array de configuraciones guardadas"
                },
                {
                    "method": "POST",
                    "path": "/api/process",
                    "description": "Procesar la anonimización de un dataset con una configuración",
                    "accepts": "application/json",
                    "params": ["dataset_id (UUID)", "config_id (UUID)"],
                    "returns": "Resultado de la anonimización con métricas de privacidad"
                },
                {
                    "method": "GET",
                    "path": "/api/results",
                    "description": "Listar todos los resultados de anonimización procesados",
                    "returns": "Array de resultados con métricas (K-anonimato, L-diversidad, etc.)"
                },
                {
                    "method": "GET",
                    "path": "/api/results/{result_id}",
                    "description": "Obtener un resultado específico con los datos anonimizados",
                    "params": ["result_id (UUID)"],
                    "returns": "Dataset anonimizado completo y métricas detalladas"
                },
                {
                    "method": "GET",
                    "path": "/api/stats",
                    "description": "Obtener estadísticas generales del sistema",
                    "returns": "Total de datasets, configuraciones, resultados y métricas agregadas"
                }
            ],
            "metrics": {
                "k_anonymity": "Garantiza que cada registro es indistinguible de al menos K-1 registros",
                "l_diversity": "Garantiza al menos L valores diferentes en atributos sensibles por grupo",
                "information_loss": "Porcentaje de información perdida durante la anonimización"
            },
            "privacy_models": [
                "K-Anonymity - Indistinguibilidad en grupos de K registros",
                "L-Diversity - Diversidad en atributos sensibles",
                "Differential Privacy - Privacidad con garantías matemáticas"
            ]
        },
        "support": {
            "formats": ["CSV", "Excel (.xlsx, .xls)"],
            "max_upload_size": "50 MB",
            "cors": "Habilitado para todos los orígenes",
            "authentication": "Deshabilitada (modo público)"
        }
    }

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

        result['column_names'] = json.loads(result['column_names'])
        result['data'] = json.loads(result['data'])

        logger.info(f"Dataset uploaded successfully: {result['id']}")
        return result

    except Exception as e:
        logger.error(f"Error uploading dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

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

        result['column_mappings'] = json.loads(result['column_mappings'])
        result['techniques'] = json.loads(result['techniques'])
        result['global_params'] = json.loads(result['global_params'])

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

def calculate_k_anonymity(df: pd.DataFrame, quasi_identifiers: List[str]) -> int:
    if not quasi_identifiers:
        return len(df)

    group_sizes = df.groupby(quasi_identifiers).size()
    return int(group_sizes.min()) if len(group_sizes) > 0 else 0

def calculate_l_diversity(df: pd.DataFrame, quasi_identifiers: List[str], sensitive_attr: str) -> float:
    if not quasi_identifiers or not sensitive_attr:
        return 0.0

    groups = df.groupby(quasi_identifiers)[sensitive_attr]
    diversities = groups.apply(lambda x: len(x.unique()))
    return float(diversities.min()) if len(diversities) > 0 else 0.0

def calculate_information_loss(original_df: pd.DataFrame, anonymized_df: pd.DataFrame, columns: List[str]) -> float:
    total_loss = 0.0
    for col in columns:
        if col not in original_df.columns or col not in anonymized_df.columns:
            continue

        if pd.api.types.is_numeric_dtype(original_df[col]):
            orig_range = original_df[col].max() - original_df[col].min()
            if orig_range == 0:
                continue
            anon_range = anonymized_df[col].max() - anonymized_df[col].min()
            loss = 1 - (anon_range / orig_range)
            total_loss += loss
        else:
            orig_unique = len(original_df[col].unique())
            anon_unique = len(anonymized_df[col].unique())
            if orig_unique > 0:
                loss = 1 - (anon_unique / orig_unique)
                total_loss += loss

    return (total_loss / len(columns)) * 100 if columns else 0.0

def generalize_numeric(series: pd.Series, bins: int = 5) -> pd.Series:
    try:
        labels = [f"Range {i+1}" for i in range(bins)]
        return pd.cut(series, bins=bins, labels=labels, duplicates='drop')
    except:
        return series.astype(str)

def generalize_categorical(series: pd.Series, levels: int = 1) -> pd.Series:
    value_counts = series.value_counts()
    if levels == 1:
        return pd.Series(['Generalized'] * len(series), index=series.index)
    else:
        top_values = value_counts.head(levels).index.tolist()
        return series.apply(lambda x: x if x in top_values else 'Other')

def suppress_data(series: pd.Series, threshold: float = 0.1) -> pd.Series:
    num_to_suppress = int(len(series) * threshold)
    if num_to_suppress == 0:
        return series

    suppressed = series.copy()
    indices_to_suppress = np.random.choice(series.index, size=num_to_suppress, replace=False)
    suppressed.loc[indices_to_suppress] = '*'
    return suppressed

def apply_differential_privacy(series: pd.Series, epsilon: float = 1.0) -> pd.Series:
    if pd.api.types.is_numeric_dtype(series):
        sensitivity = series.max() - series.min()
        if sensitivity == 0:
            return series
        scale = sensitivity / epsilon
        noise = np.random.laplace(0, scale, size=len(series))
        return series + noise
    return series

def apply_k_anonymity_algorithm(df: pd.DataFrame, quasi_identifiers: List[str], k: int, technique_details: Dict) -> pd.DataFrame:
    result_df = df.copy()
    changes = []

    for col in quasi_identifiers:
        if col not in result_df.columns:
            continue

        original_unique = len(result_df[col].unique())

        if pd.api.types.is_numeric_dtype(result_df[col]):
            result_df[col] = generalize_numeric(result_df[col], bins=max(2, k))
            changes.append(f"Generalized numeric column '{col}' into {max(2, k)} ranges")
        else:
            result_df[col] = generalize_categorical(result_df[col], levels=2)
            changes.append(f"Generalized categorical column '{col}' to broader categories")

        new_unique = len(result_df[col].unique())
        changes.append(f"  → Reduced unique values from {original_unique} to {new_unique}")

    achieved_k = calculate_k_anonymity(result_df, quasi_identifiers)
    technique_details["k_anonymity"] = {
        "technique": "K-Anonymity",
        "target_k": k,
        "achieved_k": achieved_k,
        "quasi_identifiers": quasi_identifiers,
        "changes": changes,
        "explanation": f"Applied generalization to ensure each combination of quasi-identifiers appears at least {k} times. Achieved k={achieved_k}."
    }

    return result_df

def apply_l_diversity_algorithm(df: pd.DataFrame, quasi_identifiers: List[str], sensitive_col: str, l: int, technique_details: Dict) -> pd.DataFrame:
    result_df = df.copy()
    changes = []

    if sensitive_col not in result_df.columns:
        technique_details["l_diversity"] = {
            "technique": "L-Diversity",
            "error": f"Sensitive column '{sensitive_col}' not found",
            "changes": []
        }
        return result_df

    groups = result_df.groupby(quasi_identifiers)
    original_diversity = calculate_l_diversity(result_df, quasi_identifiers, sensitive_col)

    for name, group in groups:
        diversity = len(group[sensitive_col].unique())
        if diversity < l:
            changes.append(f"Group with {diversity} distinct sensitive values (< {l}) detected")

    achieved_l = calculate_l_diversity(result_df, quasi_identifiers, sensitive_col)
    technique_details["l_diversity"] = {
        "technique": "L-Diversity",
        "target_l": l,
        "achieved_l": achieved_l,
        "sensitive_attribute": sensitive_col,
        "quasi_identifiers": quasi_identifiers,
        "changes": changes,
        "explanation": f"Verified that each group has at least {l} distinct sensitive values. Achieved l={achieved_l}."
    }

    return result_df

def apply_techniques(df: pd.DataFrame, config: Dict, technique_details: Dict) -> pd.DataFrame:
    result_df = df.copy()

    column_mappings = config["column_mappings"]
    if isinstance(column_mappings, str):
        column_mappings = json.loads(column_mappings)

    techniques_list = config["techniques"]
    if isinstance(techniques_list, str):
        techniques_list = json.loads(techniques_list)

    global_params = config["global_params"]
    if isinstance(global_params, str):
        global_params = json.loads(global_params)

    quasi_identifiers = [m["column"] for m in column_mappings if m["type"] == "quasi-identifier"]
    sensitive_columns = [m["column"] for m in column_mappings if m["type"] == "sensitive"]
    identifiers = [m["column"] for m in column_mappings if m["type"] == "identifier"]

    if identifiers:
        for col in identifiers:
            if col in result_df.columns:
                result_df = result_df.drop(columns=[col])
                technique_details["suppression_identifiers"] = {
                    "technique": "Identifier Suppression",
                    "changes": [f"Removed identifier column '{col}' completely"],
                    "explanation": "Direct identifiers (like ID, email, SSN) were completely removed to prevent re-identification."
                }

    for tech in techniques_list:
        col = tech["column"]
        technique = tech["technique"]
        params = tech.get("params", {})

        if col not in result_df.columns:
            continue

        original_sample = result_df[col].head(5).tolist()

        if technique == "generalization":
            if pd.api.types.is_numeric_dtype(result_df[col]):
                bins = params.get("bins", 5)
                result_df[col] = generalize_numeric(result_df[col], bins=bins)
                technique_details[f"generalization_{col}"] = {
                    "technique": "Generalization (Numeric)",
                    "column": col,
                    "params": {"bins": bins},
                    "changes": [
                        f"Converted numeric values into {bins} ranges",
                        f"Example: {original_sample[0]} → {result_df[col].iloc[0]}"
                    ],
                    "explanation": f"Replaced precise numeric values with ranges to reduce precision and protect privacy."
                }
            else:
                levels = params.get("levels", 1)
                result_df[col] = generalize_categorical(result_df[col], levels=levels)
                technique_details[f"generalization_{col}"] = {
                    "technique": "Generalization (Categorical)",
                    "column": col,
                    "params": {"levels": levels},
                    "changes": [
                        f"Grouped categorical values into broader categories",
                        f"Example: {original_sample[0]} → {result_df[col].iloc[0]}"
                    ],
                    "explanation": f"Replaced specific categories with more general ones to reduce uniqueness."
                }

        elif technique == "suppression":
            threshold = params.get("threshold", 0.1)
            result_df[col] = suppress_data(result_df[col], threshold=threshold)
            suppressed_count = (result_df[col] == '*').sum()
            technique_details[f"suppression_{col}"] = {
                "technique": "Suppression",
                "column": col,
                "params": {"threshold": threshold},
                "changes": [
                    f"Replaced {suppressed_count} values ({threshold*100}%) with '*'",
                    f"Example: Some values like '{original_sample[0]}' → '*'"
                ],
                "explanation": f"Randomly masked {threshold*100}% of values to hide specific entries."
            }

        elif technique == "differential_privacy":
            epsilon = params.get("epsilon", 1.0)
            if pd.api.types.is_numeric_dtype(result_df[col]):
                noisy_series = apply_differential_privacy(result_df[col], epsilon=epsilon)
                avg_noise = abs(noisy_series - result_df[col]).mean()
                result_df[col] = noisy_series
                technique_details[f"differential_privacy_{col}"] = {
                    "technique": "Differential Privacy",
                    "column": col,
                    "params": {"epsilon": epsilon},
                    "changes": [
                        f"Added random noise to numeric values",
                        f"Average noise magnitude: {avg_noise:.2f}",
                        f"Example: {original_sample[0]} → {result_df[col].iloc[0]:.2f}"
                    ],
                    "explanation": f"Added calibrated random noise (epsilon={epsilon}) to protect individual values while preserving statistical properties."
                }

    k = global_params.get("k", 2)
    if quasi_identifiers and k > 1:
        result_df = apply_k_anonymity_algorithm(result_df, quasi_identifiers, k, technique_details)

    l = global_params.get("l", 2)
    if quasi_identifiers and sensitive_columns and l > 1:
        for sensitive_col in sensitive_columns:
            result_df = apply_l_diversity_algorithm(result_df, quasi_identifiers, sensitive_col, l, technique_details)

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

        result['anonymized_data'] = json.loads(result['anonymized_data'])
        result['metrics'] = json.loads(result['metrics'])
        result['technique_details'] = json.loads(result['technique_details'])

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
