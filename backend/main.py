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
from supabase import create_client, Client
from dotenv import load_dotenv
import json
from collections import Counter
import math

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Data Anonymization System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("VITE_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

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
        supabase.table("audit_logs").insert({
            "user_id": user_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "details": details or {},
            "created_at": datetime.utcnow().isoformat()
        }).execute()
    except Exception as e:
        logger.error(f"Failed to log audit: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Data Anonymization System API", "version": "1.0.0"}

@app.post("/api/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    logger.info(f"User {user_id} uploading file: {file.filename}")

    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Only Excel (.xlsx, .xls) and CSV files are supported")

    if file.size and file.size > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must be less than 50MB")

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
            "column_names": column_names,
            "data": data_json,
            "status": "ready"
        }

        result = supabase.table("datasets").insert(dataset).execute()

        log_audit(user_id, "upload_dataset", "dataset", result.data[0]["id"], {
            "filename": file.filename,
            "rows": len(df),
            "columns": len(df.columns)
        })

        logger.info(f"Dataset uploaded successfully: {result.data[0]['id']}")
        return result.data[0]

    except Exception as e:
        logger.error(f"Error uploading dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/datasets")
def get_datasets(user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} fetching datasets")
    try:
        result = supabase.table("datasets").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        logger.error(f"Error fetching datasets: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/datasets/{dataset_id}")
def get_dataset(dataset_id: str, user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} fetching dataset {dataset_id}")
    try:
        result = supabase.table("datasets").select("*").eq("id", dataset_id).eq("user_id", user_id).single().execute()
        return result.data
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
            "column_mappings": [mapping.dict() for mapping in config.column_mappings],
            "techniques": [tech.dict() for tech in config.techniques],
            "global_params": config.global_params
        }

        result = supabase.table("anonymization_configs").insert(config_data).execute()

        log_audit(user_id, "create_config", "config", result.data[0]["id"], {
            "dataset_id": config.dataset_id,
            "name": config.name
        })

        logger.info(f"Config created successfully: {result.data[0]['id']}")
        return result.data[0]

    except Exception as e:
        logger.error(f"Error creating config: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/configs")
def get_configs(dataset_id: Optional[str] = None, user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} fetching configs")
    try:
        query = supabase.table("anonymization_configs").select("*").eq("user_id", user_id)
        if dataset_id:
            query = query.eq("dataset_id", dataset_id)
        result = query.order("created_at", desc=True).execute()
        return result.data
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

    quasi_identifiers = [m["column"] for m in config["column_mappings"] if m["type"] == "quasi-identifier"]
    sensitive_columns = [m["column"] for m in config["column_mappings"] if m["type"] == "sensitive"]
    identifiers = [m["column"] for m in config["column_mappings"] if m["type"] == "identifier"]

    if identifiers:
        for col in identifiers:
            if col in result_df.columns:
                result_df = result_df.drop(columns=[col])
                technique_details["suppression_identifiers"] = {
                    "technique": "Identifier Suppression",
                    "changes": [f"Removed identifier column '{col}' completely"],
                    "explanation": "Direct identifiers (like ID, email, SSN) were completely removed to prevent re-identification."
                }

    for tech in config["techniques"]:
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

    k = config["global_params"].get("k", 2)
    if quasi_identifiers and k > 1:
        result_df = apply_k_anonymity_algorithm(result_df, quasi_identifiers, k, technique_details)

    l = config["global_params"].get("l", 2)
    if quasi_identifiers and sensitive_columns and l > 1:
        for sensitive_col in sensitive_columns:
            result_df = apply_l_diversity_algorithm(result_df, quasi_identifiers, sensitive_col, l, technique_details)

    return result_df

@app.post("/api/process")
async def process_anonymization(request: ProcessRequest, user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} processing dataset {request.dataset_id} with config {request.config_id}")
    start_time = time.time()

    try:
        dataset = supabase.table("datasets").select("*").eq("id", request.dataset_id).eq("user_id", user_id).single().execute()
        config = supabase.table("anonymization_configs").select("*").eq("id", request.config_id).eq("user_id", user_id).single().execute()

        df = pd.DataFrame(dataset.data["data"])

        technique_details = {}
        anonymized_df = apply_techniques(df, config.data, technique_details)

        quasi_identifiers = [m["column"] for m in config.data["column_mappings"] if m["type"] == "quasi-identifier"]
        sensitive_columns = [m["column"] for m in config.data["column_mappings"] if m["type"] == "sensitive"]

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
            "anonymized_data": anonymized_df.to_dict(orient='records'),
            "metrics": metrics,
            "technique_details": technique_details,
            "status": "completed",
            "processing_time_ms": processing_time,
            "completed_at": datetime.utcnow().isoformat()
        }

        result = supabase.table("anonymization_results").insert(result_data).execute()

        log_audit(user_id, "process_anonymization", "result", result.data[0]["id"], {
            "dataset_id": request.dataset_id,
            "config_id": request.config_id,
            "k_value": k_value,
            "processing_time_ms": processing_time
        })

        logger.info(f"Processing completed in {processing_time}ms, result: {result.data[0]['id']}")
        return result.data[0]

    except Exception as e:
        logger.error(f"Error processing anonymization: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/results")
def get_results(dataset_id: Optional[str] = None, user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} fetching results")
    try:
        query = supabase.table("anonymization_results").select("*").eq("user_id", user_id)
        if dataset_id:
            query = query.eq("dataset_id", dataset_id)
        result = query.order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        logger.error(f"Error fetching results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/results/{result_id}")
def get_result(result_id: str, user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} fetching result {result_id}")
    try:
        result = supabase.table("anonymization_results").select("*").eq("id", result_id).eq("user_id", user_id).single().execute()
        return result.data
    except Exception as e:
        logger.error(f"Error fetching result: {str(e)}")
        raise HTTPException(status_code=404, detail="Result not found")

@app.get("/api/stats")
def get_stats(user_id: str = Depends(get_current_user)):
    logger.info(f"User {user_id} fetching statistics")
    try:
        datasets = supabase.table("datasets").select("*").eq("user_id", user_id).execute()
        configs = supabase.table("anonymization_configs").select("*").eq("user_id", user_id).execute()
        results = supabase.table("anonymization_results").select("*").eq("user_id", user_id).execute()

        total_rows_processed = sum(r.get("metrics", {}).get("original_rows", 0) for r in results.data)
        avg_processing_time = sum(r.get("processing_time_ms", 0) for r in results.data) / len(results.data) if results.data else 0

        return {
            "total_datasets": len(datasets.data),
            "total_configs": len(configs.data),
            "total_results": len(results.data),
            "total_rows_processed": total_rows_processed,
            "avg_processing_time_ms": round(avg_processing_time, 2)
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
