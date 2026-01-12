"""Smoke test para validar que las generalizaciones numéricas produzcan range_mapping en technique_details.
Este script carga `sample_dataset.csv`, crea una configuración mínima que aplica generalización sobre `age` y ejecuta `apply_techniques`.
"""
import json
import pandas as pd
from main import apply_techniques


def load_sample():
    import os
    base = os.path.dirname(__file__)
    path = os.path.join(base, "sample_dataset.csv")
    df = pd.read_csv(path)
    return df


if __name__ == "__main__":
    df = load_sample()

    # Configuración mínima: column_mappings y techniques como espera apply_techniques
    config = {
        "column_mappings": json.dumps([
            {"column": "age", "type": "quasi-identifier"},
            {"column": "medical_condition", "type": "sensitive"}
        ]),
        "techniques": json.dumps([
            {"column": "age", "technique": "generalization", "params": {"bins": 3}}
        ]),
        "global_params": json.dumps({})
    }

    technique_details = {}
    anonymized = apply_techniques(df, config, technique_details)

    print("Technique details:")
    print(json.dumps(technique_details, indent=2, ensure_ascii=False))

    print("Anonymized sample rows:")
    print(anonymized.head().to_string())
