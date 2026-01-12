"""
Test completo de todas las técnicas de anonimización,
especialmente verificando que:
1. Generalización muestra intervalos numéricos (ej: "28-35" en lugar de "Rango 1")
2. Supresión muestra asteriscos "*"
"""
import json
import pandas as pd
from main import apply_techniques


def test_complete_anonymization():
    # Dataset de prueba
    df = pd.DataFrame({
        'id': [1, 2, 3, 4, 5, 6, 7, 8],
        'edad': [28, 35, 42, 28, 35, 42, 50, 28],
        'salario': [55000, 72000, 89000, 56000, 73000, 91000, 105000, 57000],
        'enfermedad': ['Diabetes', 'Asma', 'Hipertensión', 'Diabetes', 'Ninguna', 'Asma', 'Diabetes', 'Ninguna']
    })

    # Configuración con TODAS las técnicas
    config = {
        "column_mappings": json.dumps([
            {"column": "id", "type": "identifier"},  # Se eliminará
            {"column": "edad", "type": "quasi-identifier"},
            {"column": "salario", "type": "quasi-identifier"},
            {"column": "enfermedad", "type": "sensitive"}
        ]),
        "techniques": json.dumps([
            {"column": "edad", "technique": "generalization", "params": {"bins": 3}},
            {"column": "salario", "technique": "generalization", "params": {"bins": 4}},
            {"column": "enfermedad", "technique": "suppression", "params": {"threshold": 0.3}}
        ]),
        "global_params": json.dumps({"k": 2, "l": 2})
    }

    technique_details = {}
    anonymized = apply_techniques(df, config, technique_details)

    print("="*80)
    print("RESULTADOS DE ANONIMIZACIÓN")
    print("="*80)

    print("\n📊 DATOS ORIGINALES:")
    print(df.head())

    print("\n🔒 DATOS ANONIMIZADOS:")
    print(anonymized.head())

    print("\n📋 TÉCNICAS APLICADAS:")
    print(json.dumps(technique_details, indent=2, ensure_ascii=False))

    print("\n✅ VALIDACIONES:")

    # Validar que 'id' fue eliminado
    if 'id' not in anonymized.columns:
        print("✓ Identificador 'id' fue eliminado correctamente")
    else:
        print("✗ ERROR: 'id' todavía existe")

    # Validar que edad muestra intervalos (no "Rango X")
    sample_edad = str(anonymized['edad'].iloc[0])
    if '-' in sample_edad and 'Rango' not in sample_edad:
        print(f"✓ Generalización de 'edad' muestra intervalos numéricos: {sample_edad}")
    else:
        print(f"✗ ERROR: 'edad' no muestra intervalos correctos: {sample_edad}")

    # Validar que salario muestra intervalos (no "Rango X")
    sample_salario = str(anonymized['salario'].iloc[0])
    if '-' in sample_salario and 'Rango' not in sample_salario:
        print(f"✓ Generalización de 'salario' muestra intervalos numéricos: {sample_salario}")
    else:
        print(f"✗ ERROR: 'salario' no muestra intervalos correctos: {sample_salario}")

    # Validar que enfermedad tiene supresión (asteriscos)
    suppressed_count = (anonymized['enfermedad'] == '*').sum()
    if suppressed_count > 0:
        print(f"✓ Supresión aplicada correctamente: {suppressed_count} valores ocultados con '*'")
    else:
        print("✗ ERROR: No se aplicó supresión")

    # Validar que NO hay etiquetas "Rango X"
    has_rango_labels = any(
        'Rango' in str(val)
        for col in anonymized.columns
        for val in anonymized[col].unique()
    )
    if not has_rango_labels:
        print("✓ No hay etiquetas 'Rango X', solo intervalos numéricos")
    else:
        print("✗ ERROR: Todavía existen etiquetas 'Rango X'")

    print("\n" + "="*80)
    print("TEST COMPLETADO")
    print("="*80)


if __name__ == "__main__":
    test_complete_anonymization()

