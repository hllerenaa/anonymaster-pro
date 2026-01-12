# Técnicas de Anonimización Implementadas

## 1. 🔢 GENERALIZACIÓN (Generalization)

**¿Qué hace?**
Reemplaza valores exactos por rangos o categorías más amplias.

**Ejemplos:**
- **Numéricos:** `28 años` → `27.98-35.33` (intervalo de edades)
- **Numéricos:** `$55,000` → `50000-60000` (rango salarial)
- **Categóricos:** `Madrid` → `Comunidad de Madrid` (región más amplia)

**Resultado en los datos:**
```json
{
  "edad": "27.98-35.33",
  "salario": "50000-60000",
  "codigo_postal": "28000-28999"
}
```

**Parámetros:**
- `bins`: Número de intervalos (para numéricos, default: 5)
- `levels`: Nivel de generalización (para categóricos, default: 1)

---

## 2. ❌ SUPRESIÓN (Suppression) - **LA QUE USA ASTERISCOS**

**¿Qué hace?**
OCULTA valores sensibles reemplazándolos con asteriscos `*` o eliminándolos completamente.

**Ejemplos:**
- **Antes:** `["Diabetes", "Asma", "Hipertensión", "Diabetes", "Ninguna"]`
- **Después:** `["*", "Asma", "*", "Diabetes", "Ninguna"]`

**Resultado en los datos:**
```json
{
  "condicion_medica": "*",
  "enfermedad": "*",
  "diagnostico": "*"
}
```

**Parámetros:**
- `threshold`: Porcentaje de valores a ocultar (0.0 a 1.0)
  - `0.1` = 10% de valores se ocultarán
  - `0.5` = 50% de valores se ocultarán

**Cuándo usar:**
- Cuando ciertos valores son demasiado sensibles para generalizarse
- Para proteger información médica, financiera o personal crítica
- Cuando un pequeño grupo de registros podría ser identificable

---

## 3. 🎭 PSEUDONIMIZACIÓN (Pseudonymization)

**¿Qué hace?**
Reemplaza datos reales con pseudónimos o identificadores ficticios consistentes.

**Ejemplos:**
- `"Juan Pérez"` → `"Usuario_12345"`
- `"maria@email.com"` → `"user_abc@anonymous.com"`

**Resultado en los datos:**
```json
{
  "nombre": "Usuario_12345",
  "email": "user_abc@anonymous.com"
}
```

---

## 4. 🔀 PRIVACIDAD DIFERENCIAL (Differential Privacy)

**¿Qué hace?**
Añade ruido aleatorio controlado a valores numéricos para proteger la información individual.

**Ejemplos:**
- `28 años` → `28.73 años` (ruido aleatorio añadido)
- `$55,000` → `$55,247` (perturbación controlada)

**Resultado en los datos:**
```json
{
  "edad": 28.73,
  "salario": 55247.12
}
```

**Parámetros:**
- `epsilon`: Control de privacidad (menor = más privacidad, default: 1.0)

---

## 5. 🚫 ELIMINACIÓN DE IDENTIFICADORES (Identifier Removal)

**¿Qué hace?**
Elimina completamente columnas con identificadores directos.

**Ejemplos:**
- Columnas eliminadas: `id`, `DNI`, `número_seguro_social`, `pasaporte`

**Resultado:**
Las columnas marcadas como "identifier" NO aparecen en los datos anonimizados.

---

## 6. 🎯 ENMASCARAMIENTO (Masking)

**¿Qué hace?**
Oculta parcialmente información sensible manteniendo el formato.

**Ejemplos:**
- `"juan.perez@email.com"` → `"j***@email.com"`
- `"612345678"` → `"612***678"`
- `"1234-5678-9012-3456"` → `"****-****-****-3456"`

---

## Resumen Visual

| Técnica | Antes | Después | Identificación |
|---------|-------|---------|----------------|
| **Generalización** | `28 años` | `27.98-35.33` | Intervalos numéricos |
| **Supresión** ⭐ | `Diabetes` | `*` | **Asteriscos** |
| **Pseudonimización** | `Juan Pérez` | `Usuario_12345` | IDs ficticios |
| **Privacidad Diferencial** | `55000` | `55247.12` | Ruido añadido |
| **Eliminación** | `DNI: 12345678X` | *(columna eliminada)* | No aparece |
| **Enmascaramiento** | `email@test.com` | `e***@test.com` | Asteriscos parciales |

---

## ⭐ Respuesta a tu pregunta

**"¿Qué técnica oculta valores con asteriscos como enfermedad → **?"**

**Respuesta:** La técnica de **SUPRESIÓN (Suppression)** es la que reemplaza valores con asteriscos `*`.

En el código:
```python
def suppress_data(series: pd.Series, threshold: float = 0.1) -> pd.Series:
    """
    TÉCNICA DE SUPRESIÓN (SUPPRESSION)
    
    Esta es la técnica que OCULTA valores reemplazándolos con asteriscos '*'.
    """
```

Para aplicarla en una configuración:
```json
{
  "column": "condicion_medica",
  "technique": "suppression",
  "params": {
    "threshold": 0.1
  }
}
```

---

## Configuración de Ejemplo Completa

```json
{
  "techniques": [
    {
      "column": "edad",
      "technique": "generalization",
      "params": {"bins": 5}
    },
    {
      "column": "condicion_medica",
      "technique": "suppression",
      "params": {"threshold": 0.2}
    },
    {
      "column": "salario",
      "technique": "differential_privacy",
      "params": {"epsilon": 1.0}
    }
  ]
}
```

**Resultado:**
```json
{
  "edad": "27.98-35.33",
  "condicion_medica": "*",
  "salario": 55247.12
}
```

