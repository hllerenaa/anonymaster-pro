"""
Test para validar las nuevas técnicas de Pseudonimización y Enmascaramiento
"""
import json
import pandas as pd
from main import apply_techniques, apply_pseudonymization, apply_masking


def test_pseudonymization():
    """Test de pseudonimización"""
    print("\n" + "="*80)
    print("TEST: PSEUDONIMIZACIÓN")
    print("="*80)

    # Dataset de prueba
    df = pd.DataFrame({
        'id': [1, 2, 3, 4],
        'nombre': ['Juan Pérez', 'María García', 'Juan Pérez', 'Pedro López'],
        'email': ['juan@email.com', 'maria@email.com', 'juan@email.com', 'pedro@email.com']
    })

    print("\n📊 DATOS ORIGINALES:")
    print(df)

    # Aplicar pseudonimización directamente
    df_pseudo = df.copy()
    df_pseudo['nombre'] = apply_pseudonymization(df_pseudo['nombre'], prefix="USER")
    df_pseudo['email'] = apply_pseudonymization(df_pseudo['email'], prefix="EMAIL")

    print("\n🔒 DATOS PSEUDONIMIZADOS:")
    print(df_pseudo)

    # Validaciones
    print("\n✅ VALIDACIONES:")

    # Verificar que Juan Pérez tenga el mismo pseudónimo
    if df_pseudo.loc[0, 'nombre'] == df_pseudo.loc[2, 'nombre']:
        print("✓ Consistencia: Mismo valor original → mismo pseudónimo")
    else:
        print("✗ ERROR: Valores iguales tienen pseudónimos diferentes")

    # Verificar que valores diferentes tengan pseudónimos diferentes
    if df_pseudo.loc[0, 'nombre'] != df_pseudo.loc[1, 'nombre']:
        print("✓ Unicidad: Valores diferentes → pseudónimos diferentes")
    else:
        print("✗ ERROR: Valores diferentes tienen el mismo pseudónimo")

    # Verificar formato
    if df_pseudo.loc[0, 'nombre'].startswith('USER_'):
        print("✓ Formato: Pseudónimos tienen el prefijo correcto")
    else:
        print("✗ ERROR: Formato de pseudónimo incorrecto")


def test_masking():
    """Test de enmascaramiento"""
    print("\n" + "="*80)
    print("TEST: ENMASCARAMIENTO")
    print("="*80)

    # Dataset de prueba
    df = pd.DataFrame({
        'nombre': ['Juan Pérez', 'María García', 'Pedro López'],
        'email': ['juan.perez@email.com', 'maria@email.com', 'pedro.lopez@email.com'],
        'telefono': ['612345678', '987654321', '555123456']
    })

    print("\n📊 DATOS ORIGINALES:")
    print(df)

    # Aplicar diferentes tipos de enmascaramiento
    df_masked = df.copy()
    df_masked['nombre'] = apply_masking(df_masked['nombre'], mask_type='partial')
    df_masked['email'] = apply_masking(df_masked['email'], mask_type='email')
    df_masked['telefono'] = apply_masking(df_masked['telefono'], mask_type='phone')

    print("\n🔒 DATOS ENMASCARADOS:")
    print(df_masked)

    # Validaciones
    print("\n✅ VALIDACIONES:")

    # Verificar nombres enmascarados
    if '*' in str(df_masked.loc[0, 'nombre']):
        print(f"✓ Enmascaramiento parcial de nombres: {df.loc[0, 'nombre']} → {df_masked.loc[0, 'nombre']}")
    else:
        print("✗ ERROR: Nombres no fueron enmascarados")

    # Verificar emails enmascarados
    if '*' in str(df_masked.loc[0, 'email']) and '@' in str(df_masked.loc[0, 'email']):
        print(f"✓ Enmascaramiento de email: {df.loc[0, 'email']} → {df_masked.loc[0, 'email']}")
    else:
        print("✗ ERROR: Emails no fueron enmascarados correctamente")

    # Verificar teléfonos enmascarados
    if '*' in str(df_masked.loc[0, 'telefono']):
        print(f"✓ Enmascaramiento de teléfono: {df.loc[0, 'telefono']} → {df_masked.loc[0, 'telefono']}")
    else:
        print("✗ ERROR: Teléfonos no fueron enmascarados")


def test_integration():
    """Test de integración con apply_techniques"""
    print("\n" + "="*80)
    print("TEST: INTEGRACIÓN CON APPLY_TECHNIQUES")
    print("="*80)

    # Dataset de prueba
    df = pd.DataFrame({
        'id': [1, 2, 3, 4],
        'nombre': ['Juan Pérez', 'María García', 'Pedro López', 'Ana Martínez'],
        'email': ['juan@email.com', 'maria@email.com', 'pedro@email.com', 'ana@email.com'],
        'edad': [28, 35, 42, 28],
        'telefono': ['612345678', '987654321', '555123456', '444222111']
    })

    print("\n📊 DATOS ORIGINALES:")
    print(df)

    # Configuración con todas las técnicas
    config = {
        "column_mappings": json.dumps([
            {"column": "id", "type": "identifier"},
            {"column": "nombre", "type": "quasi-identifier"},
            {"column": "email", "type": "quasi-identifier"},
            {"column": "edad", "type": "quasi-identifier"},
            {"column": "telefono", "type": "sensitive"}
        ]),
        "techniques": json.dumps([
            {"column": "nombre", "technique": "pseudonymization", "params": {"prefix": "USER"}},
            {"column": "email", "technique": "masking", "params": {"mask_type": "email"}},
            {"column": "edad", "technique": "generalization", "params": {"bins": 2}},
            {"column": "telefono", "technique": "masking", "params": {"mask_type": "phone"}}
        ]),
        "global_params": json.dumps({"k": 2})
    }

    technique_details = {}
    anonymized = apply_techniques(df, config, technique_details)

    print("\n🔒 DATOS ANONIMIZADOS:")
    print(anonymized)

    print("\n📋 TÉCNICAS APLICADAS:")
    for key, details in technique_details.items():
        print(f"\n{key}:")
        print(f"  - Técnica: {details.get('technique')}")
        if 'changes' in details:
            for change in details['changes']:
                print(f"  - {change}")

    # Validaciones
    print("\n✅ VALIDACIONES:")

    # Verificar que id fue eliminado
    if 'id' not in anonymized.columns:
        print("✓ Identificador 'id' fue eliminado")
    else:
        print("✗ ERROR: 'id' todavía existe")

    # Verificar pseudonimización
    if 'nombre' in anonymized.columns and 'USER_' in str(anonymized['nombre'].iloc[0]):
        print(f"✓ Pseudonimización aplicada: {anonymized['nombre'].iloc[0]}")
    else:
        print("✗ ERROR: Pseudonimización no funcionó")

    # Verificar enmascaramiento de email
    if 'email' in anonymized.columns and '*' in str(anonymized['email'].iloc[0]):
        print(f"✓ Enmascaramiento de email: {anonymized['email'].iloc[0]}")
    else:
        print("✗ ERROR: Enmascaramiento de email no funcionó")

    # Verificar generalización de edad
    if 'edad' in anonymized.columns and '-' in str(anonymized['edad'].iloc[0]):
        print(f"✓ Generalización de edad: {anonymized['edad'].iloc[0]}")
    else:
        print("✗ ERROR: Generalización no funcionó")

    # Verificar enmascaramiento de teléfono
    if 'telefono' in anonymized.columns and '*' in str(anonymized['telefono'].iloc[0]):
        print(f"✓ Enmascaramiento de teléfono: {anonymized['telefono'].iloc[0]}")
    else:
        print("✗ ERROR: Enmascaramiento de teléfono no funcionó")


if __name__ == "__main__":
    print("="*80)
    print("SUITE DE TESTS: PSEUDONIMIZACIÓN Y ENMASCARAMIENTO")
    print("="*80)

    test_pseudonymization()
    test_masking()
    test_integration()

    print("\n" + "="*80)
    print("TESTS COMPLETADOS")
    print("="*80)

