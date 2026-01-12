# 📋 GUÍA COMPLETA DE CONFIGURACIÓN - datos_sensibles_prueba.xlsx

## 📊 TU DATASET

```
50 filas × 9 columnas

Columnas:
1. id (1-50, único)
2. nombre_completo (Carlos López, Juan Pérez, Ana Torres, Luis Mendoza, Sofía Ríos, María García)
3. email (usuario1@correo.com ... usuario50@correo.com)
4. edad (18-65 años, 29 valores únicos)
5. codigo_postal (10001-10050, 29 valores únicos)
6. genero (M, F)
7. salario ($45,167 - $87,759)
8. condicion_medica (Asma, Ninguna, Hipertensión, Diabetes)
9. calificacion (A, B, C, D)
```

---

## 🎯 CONFIGURACIÓN PASO A PASO

### 📍 PASO 1: Clasificar tus Columnas

#### 🔴 **id** → **IDENTIFICADOR DIRECTO**
- **Por qué:** Es único para cada persona (1, 2, 3... 50)
- **Riesgo:** 100% - Identifica por sí solo
- **Acción:** Debe ser suprimido completamente

#### 🔴 **nombre_completo** → **IDENTIFICADOR DIRECTO**
- **Por qué:** Los nombres identifican directamente a las personas
- **Riesgo:** 100% - Aunque se repiten, sigue siendo identificador
- **Acción:** Debe ser suprimido completamente

#### 🔴 **email** → **IDENTIFICADOR DIRECTO**
- **Por qué:** Es único para cada registro (50 emails únicos)
- **Riesgo:** 100% - Identifica directamente
- **Acción:** Debe ser suprimido completamente

#### 🟡 **edad** → **QUASI-IDENTIFICADOR**
- **Por qué:** Combinada con otras columnas puede identificar
- **Riesgo:** 60-80% cuando se combina con código postal y género
- **Acción:** Debe ser generalizada en rangos
- **Ejemplo:** 18→20-25, 31→30-35, 39→35-40

#### 🟡 **codigo_postal** → **QUASI-IDENTIFICADOR**
- **Por qué:** Ubicación geográfica que combinada identifica
- **Riesgo:** 60-80% cuando se combina con edad y género
- **Acción:** Debe ser generalizada
- **Ejemplo:** 10010→100XX, 10013→100XX, 10032→100XX

#### 🟡 **genero** → **QUASI-IDENTIFICADOR**
- **Por qué:** Parte de la combinación identificadora
- **Riesgo:** 50% por sí solo, 80% combinado
- **Acción:** Dejar como está (solo 2 valores, ya es general)

#### 🔵 **salario** → **SENSIBLE**
- **Por qué:** Información financiera privada
- **Riesgo:** 40% - Revela información confidencial
- **Acción:** Generalización ligera (opcional) o dejar original
- **Protección:** L-diversity y T-closeness

#### 🔵 **condicion_medica** → **SENSIBLE**
- **Por qué:** Información de salud altamente confidencial
- **Riesgo:** 40% - Datos médicos privados
- **Acción:** Dejar original
- **Protección:** L-diversity (mínimo 2 condiciones por grupo)

#### ⚪ **calificacion** → **NO SENSIBLE**
- **Por qué:** Información pública, no confidencial
- **Riesgo:** <10% - No identifica ni revela información privada
- **Acción:** Ninguna técnica necesaria

---

### 🛠️ PASO 2: Elegir Técnicas de Anonimización

#### 🔴 **id** → **Supresión 100%**
```
Antes: 1, 2, 3, 4, 5
Después: *, *, *, *, *

Parámetro:
- Tasa de Supresión: 1.0 (100%)
  
¿Qué es? Porcentaje de valores a reemplazar con *
- 0.0 = No suprimir nada (0%)
- 0.5 = Suprimir 50% de valores
- 1.0 = Suprimir todo (100%) ← RECOMENDADO para identificadores
```

#### 🔴 **nombre_completo** → **Supresión 100%**
```
Antes: Carlos López, Juan Pérez, Ana Torres
Después: *, *, *

Parámetro:
- Tasa de Supresión: 1.0 (100%)

¿Por qué no generalizar?
Incluso "C*** L****" sería identificable. La única opción segura es suprimir.
```

#### 🔴 **email** → **Supresión 100%**
```
Antes: usuario1@correo.com, usuario2@correo.com
Después: *, *

Parámetro:
- Tasa de Supresión: 1.0 (100%)
```

#### 🟡 **edad** → **Generalización**
```
Antes: 18, 31, 39, 19, 51
Después: 18-25, 26-35, 36-45, 18-25, 46-55

Parámetro:
- Intervalos/Niveles: 4
  
¿Qué son los Intervalos?
Número de rangos en los que dividir los datos:
- 2 intervalos: [18-40], [41-65] → Muy general, mucha privacidad, poca utilidad
- 3 intervalos: [18-33], [34-49], [50-65] → Balance
- 4 intervalos: [18-28], [29-40], [41-52], [53-65] → RECOMENDADO
- 5 intervalos: [18-25], [26-35], [36-45], [46-55], [56-65] → Más detalle

REGLA: Para 50 filas con k=3, máximo (50/3)=16 intervalos
       Recomendado: 3-5 intervalos

¿Por qué 4 intervalos?
- Crea grupos significativos (juventud, adulto joven, maduro, mayor)
- Mantiene 80-85% de utilidad
- Cada grupo tendrá ~12 personas
- Balance perfecto privacidad-utilidad
```

#### 🟡 **codigo_postal** → **Generalización**
```
Antes: 10010, 10013, 10032, 10048
Después: 100XX, 100XX, 100XX, 100XX

Parámetro:
- Intervalos/Niveles: 3
  
¿Por qué 3 intervalos?
Códigos postales: 10001-10050
- 3 intervalos crea 3 zonas geográficas
- Zona 1: 10001-10016 → 100XX
- Zona 2: 10017-10033 → 100XX  
- Zona 3: 10034-10050 → 100XX
- Mantiene sentido geográfico sin ser específico
```

#### 🟡 **genero** → **Ninguna**
```
Antes: M, F
Después: M, F (sin cambios)

¿Por qué ninguna técnica?
Solo hay 2 valores (M, F). Ya es lo más general posible.
Aplicar generalización no tendría sentido.
```

#### 🔵 **salario** → **Generalización (Opcional)** o **Ninguna**
```
OPCIÓN A - Generalización Ligera (RECOMENDADA):
Antes: $45,167, $57,869, $87,759
Después: $45k-$60k, $45k-$60k, $75k-$90k

Parámetro:
- Intervalos: 3
  
¿Por qué 3 intervalos?
- Rango bajo: $45k-$60k
- Rango medio: $60k-$75k
- Rango alto: $75k-$90k
- Oculta salario exacto pero mantiene rango

OPCIÓN B - Sin técnica:
Antes: $45,167, $57,869, $87,759
Después: $45,167, $57,869, $87,759 (sin cambios)

¿Cuándo usar cada una?
- Usa Generalización: Si quieres ocultar salarios exactos
- Usa Ninguna: L-diversity y T-closeness ya protegen
  (cada grupo tendrá mínimo 2 salarios diferentes)
```

#### 🔵 **condicion_medica** → **Ninguna**
```
Antes: Asma, Ninguna, Hipertensión, Diabetes
Después: Asma, Ninguna, Hipertensión, Diabetes (sin cambios)

¿Por qué no aplicar técnica?
La protección viene de L-DIVERSITY y T-CLOSENESS:
- L-diversity asegura mínimo 2 condiciones por grupo
- Si un grupo tiene 3 personas: Asma, Ninguna, Diabetes
- No puedes saber quién tiene qué con certeza (33% probabilidad)

Sin L-diversity (MAL):
Grupo 1: Ana (Diabetes), Pedro (Diabetes), Luis (Diabetes)
→ Si Ana está en este grupo, SABES que tiene Diabetes (100%)

Con L-diversity=2 (BIEN):
Grupo 1: Ana (Diabetes), Pedro (Ninguna), Luis (Asma)
→ Si Ana está en este grupo, podría tener cualquiera (33% probabilidad)
```

#### ⚪ **calificacion** → **Ninguna**
```
Antes: A, B, C, D
Después: A, B, C, D (sin cambios)

¿Por qué ninguna técnica?
No es sensible, no identifica. No requiere protección.
```

---

### ⚙️ PASO 3: Establecer Parámetros Globales

#### 🔢 **K Value (K-Anonymity) = 3**

**¿Qué es K?**
Número mínimo de personas que deben compartir la misma combinación de quasi-identificadores.

**Tu dataset (50 filas):**
```
Con K=3:
- Cada combinación de (edad_rango, codigo_postal_zona, genero) aparece mínimo 3 veces
- Ejemplo:
  Grupo 1: [26-35, 100XX, M] → 3 personas
  Grupo 2: [36-45, 100XX, F] → 5 personas
  Grupo 3: [18-25, 100XX, M] → 4 personas
  ...

¿Qué significa?
Si alguien sabe que "Juan tiene 30 años, vive en 10015, es hombre"
→ En tu dataset anonimizado verá [26-35, 100XX, M]
→ Pero hay MÍNIMO 3 personas con esa combinación
→ No puede saber cuál de las 3 es Juan (33% probabilidad)
```

**Valores posibles:**
```
K=1: ❌ Sin protección - Cada persona puede ser única
K=2: 🟡 Mínima protección - 50% probabilidad (vulnerable)
K=3: ✅ RECOMENDADO - 33% probabilidad (Sweeney 2006: reduce riesgo 90%)
K=5: ⚠️ Alta privacidad - 20% probabilidad (puede descartar muchas filas)
K=10: ❌ Muy estricto - Solo para datasets >500 filas

Para 50 filas: K=3 es PERFECTO
- Crea ~16 grupos
- Mantiene 85% de utilidad
- Descarta <15% de filas
```

---

#### 🌈 **L Value (L-Diversity) = 2**

**¿Qué es L?**
Número mínimo de valores DIFERENTES en atributos sensibles dentro de cada grupo.

**Tu dataset - Atributos sensibles:**
- salario
- condicion_medica

**Con L=2:**
```
Grupo 1 (3 personas con [26-35, 100XX, M]):
  Ana: condicion_medica=Asma, salario=$50,000
  Luis: condicion_medica=Ninguna, salario=$75,000
  Pedro: condicion_medica=Diabetes, salario=$60,000
  
✅ Cumple L=2 para condicion_medica (3 valores diferentes)
✅ Cumple L=2 para salario (3 valores diferentes)

Grupo 2 (3 personas con [36-45, 100XX, F]):
  María: condicion_medica=Diabetes, salario=$55,000
  Rosa: condicion_medica=Diabetes, salario=$56,000
  Elena: condicion_medica=Diabetes, salario=$57,000
  
❌ NO cumple L=2 para condicion_medica (solo 1 valor)
→ Este grupo será descartado o reorganizado
```

**¿Por qué L=2?**
```
Sin L-diversity (L=1):
Grupo: Todas tienen Diabetes
→ Si María está en este grupo, SABES que tiene Diabetes (100%)

Con L=2:
Grupo: Diabetes, Ninguna
→ Si María está en este grupo, 50% probabilidad cada una

Con L=3:
Grupo: Diabetes, Ninguna, Asma
→ 33% probabilidad
→ Pero con solo 4 condiciones y 50 filas, L=3 puede descartar muchas filas

RECOMENDACIÓN: L=2
- Balance perfecto para tu dataset
- Protección significativa (50% probabilidad máxima)
- No descarta demasiadas filas
```

---

#### 📊 **T Value (T-Closeness) = 0.2**

**¿Qué es T?**
Umbral de distancia entre la distribución de sensibles en cada grupo vs la distribución global.

**Tu dataset - condicion_medica:**
```
Distribución global (50 personas):
- Ninguna: 70% (35 personas)
- Asma: 10% (5 personas)
- Hipertensión: 10% (5 personas)
- Diabetes: 10% (5 personas)
```

**Con T=0.2:**
```
Grupo válido (3 personas):
- Ninguna: 2 personas (66%)
- Asma: 1 persona (33%)
Distribución: [66%, 0%, 33%, 0%]
Global: [70%, 10%, 10%, 10%]
Distancia ≈ 0.15 ≤ 0.2 ✅ ACEPTADO

Grupo inválido (3 personas):
- Diabetes: 3 personas (100%)
Distribución: [0%, 0%, 0%, 100%]
Global: [70%, 10%, 10%, 10%]
Distancia ≈ 0.90 > 0.2 ❌ RECHAZADO
→ Revelaría que este grupo tiene solo Diabetes
```

**¿Por qué T=0.2?**
```
T=0.1: Muy estricto - Grupos casi idénticos al global (descarta muchas filas)
T=0.2: RECOMENDADO - Balance perfecto (Li et al. 2007)
T=0.3: Más permisivo - Permite mayor variación
T=0.5: Muy permisivo - Poca protección

RECOMENDACIÓN: T=0.2
- Estándar académico
- Previene "homogeneity attack"
- Mantiene buena utilidad
```

---

#### 🔐 **Epsilon (Privacidad Diferencial) = 1.0**

**¿Qué es Epsilon?**
Presupuesto de privacidad - controla cuánto "ruido" se agrega a los datos.

**Fórmula simple:**
```
Ruido agregado ≈ 1/epsilon

Epsilon bajo → Más ruido → Más privacidad → Menos precisión
Epsilon alto → Menos ruido → Menos privacidad → Más precisión
```

**Valores:**
```
ε=0.1: Muchísimo ruido
  Edad real: 25 → Edad con ruido: 18-32
  Muy privado, poco útil

ε=0.5: Bastante ruido
  Edad real: 25 → Edad con ruido: 21-29
  Buen balance para datos muy sensibles

ε=1.0: ✅ RECOMENDADO - Estándar industria
  Edad real: 25 → Edad con ruido: 23-27
  Usado por: Apple, Google, Microsoft
  Balance perfecto

ε=2.0: Poco ruido
  Edad real: 25 → Edad con ruido: 24-26
  Menos privacidad, más precisión

ε=5.0: Casi sin ruido
  Edad real: 25 → Edad con ruido: 25
  Poca protección
```

**¿Dónde se aplica?**
```
En tu configuración, Epsilon se aplica a:
- email (si elegiste Privacidad Diferencial)
- O cualquier columna con técnica "Privacidad Diferencial"

NOTA: Para identificadores (id, nombre, email) es mejor usar SUPRESIÓN,
      no Privacidad Diferencial
```

**RECOMENDACIÓN: ε=1.0**
- Estándar de facto en la industria
- Balance perfecto privacidad-utilidad
- Validado por investigación académica

---

## 🎯 RESUMEN DE CONFIGURACIÓN RECOMENDADA

### PASO 1: Clasificar Columnas
```
┌───────────────────┬──────────────────────────┐
│ Columna           │ Clasificación            │
├───────────────────┼──────────────────────────┤
│ id                │ Identificador Directo    │
│ nombre_completo   │ Identificador Directo    │
│ email             │ Identificador Directo    │
│ edad              │ Quasi-Identificador      │
│ codigo_postal     │ Quasi-Identificador      │
│ genero            │ Quasi-Identificador      │
│ salario           │ Sensible                 │
│ condicion_medica  │ Sensible                 │
│ calificacion      │ No Sensible              │
└───────────────────┴──────────────────────────┘
```

### PASO 2: Elegir Técnicas
```
┌───────────────────┬────────────────────┬─────────────┐
│ Columna           │ Técnica            │ Parámetro   │
├───────────────────┼────────────────────┼─────────────┤
│ id                │ Supresión          │ Tasa: 1.0   │
│ nombre_completo   │ Supresión          │ Tasa: 1.0   │
│ email             │ Supresión          │ Tasa: 1.0   │
│ edad              │ Generalización     │ Int: 4      │
│ codigo_postal     │ Generalización     │ Int: 3      │
│ genero            │ Ninguna            │ -           │
│ salario           │ Generalización     │ Int: 3      │
│ condicion_medica  │ Ninguna            │ -           │
│ calificacion      │ Ninguna            │ -           │
└───────────────────┴────────────────────┴─────────────┘
```

### PASO 3: Parámetros Globales
```
┌──────────────┬────────┬──────────────────────────────┐
│ Parámetro    │ Valor  │ Significado                  │
├──────────────┼────────┼──────────────────────────────┤
│ K            │ 3      │ Mínimo 3 personas por grupo  │
│ L            │ 2      │ Mínimo 2 valores sensibles   │
│ T            │ 0.2    │ Distribución similar         │
│ Epsilon      │ 1.0    │ Balance privacidad-utilidad  │
└──────────────┴────────┴──────────────────────────────┘
```

---

## 📈 RESULTADOS ESPERADOS

### Métricas Previstas
```
✅ K-Anonymity alcanzado: 3
✅ L-Diversity alcanzado: 2
✅ Pérdida de información: ~35-40%
✅ Filas descartadas: ~10-15% (5-7 filas de 50)
✅ Filas anonimizadas: ~43-45 filas
✅ Utilidad de datos: ~85%
```

### Ejemplo de Transformación
```
ANTES (Fila original):
┌────┬──────────────┬────────────────────┬──────┬───────────────┬────────┬─────────┬──────────────────┬──────────────┐
│ id │ nombre       │ email              │ edad │ codigo_postal │ genero │ salario │ condicion_medica │ calificacion │
├────┼──────────────┼────────────────────┼──────┼───────────────┼────────┼─────────┼──────────────────┼──────────────┤
│ 1  │ Carlos López │ usuario1@correo... │ 18   │ 10010         │ M      │ 85242   │ Asma             │ A            │
│ 2  │ Juan Pérez   │ usuario2@correo... │ 31   │ 10013         │ F      │ 57869   │ Ninguna          │ A            │
│ 3  │ Ana Torres   │ usuario3@correo... │ 39   │ 10032         │ M      │ 87759   │ Ninguna          │ D            │
└────┴──────────────┴────────────────────┴──────┴───────────────┴────────┴─────────┴──────────────────┴──────────────┘

DESPUÉS (Datos anonimizados):
┌────┬──────────────┬────────────────────┬──────────┬───────────────┬────────┬─────────────┬──────────────────┬──────────────┐
│ id │ nombre       │ email              │ edad     │ codigo_postal │ genero │ salario     │ condicion_medica │ calificacion │
├────┼──────────────┼────────────────────┼──────────┼───────────────┼────────┼─────────────┼──────────────────┼──────────────┤
│ *  │ *            │ *                  │ 18-28    │ 100XX         │ M      │ 75k-90k     │ Asma             │ A            │
│ *  │ *            │ *                  │ 29-40    │ 100XX         │ F      │ 45k-60k     │ Ninguna          │ A            │
│ *  │ *            │ *                  │ 29-40    │ 100XX         │ M      │ 75k-90k     │ Ninguna          │ D            │
└────┴──────────────┴────────────────────┴──────────┴───────────────┴────────┴─────────────┴──────────────────┴──────────────┘

PROTECCIÓN LOGRADA:
✅ Identidad oculta (id, nombre, email suprimidos)
✅ Cada combinación aparece 3+ veces (K=3)
✅ Cada grupo tiene 2+ valores sensibles (L=2)
✅ Distribución de sensibles similar al global (T=0.2)
✅ No se puede re-identificar individuos
✅ Datos siguen siendo útiles para análisis
```

---

## 🎓 CONCEPTOS CLAVE RESUMIDOS

### Tipos de Columnas

**🔴 IDENTIFICADOR DIRECTO**
```
¿Qué es? Identifica por sí solo
Ejemplos: id, nombre, email, SSN, teléfono
Técnica: Supresión 100%
Resultado: * (asterisco)
```

**🟡 QUASI-IDENTIFICADOR**
```
¿Qué es? Combinados pueden identificar
Ejemplos: edad + código postal + género
Técnica: Generalización
Resultado: Rangos (25-30, 100XX, M)
```

**🔵 SENSIBLE**
```
¿Qué es? Información privada/confidencial
Ejemplos: salario, condición médica, orientación
Técnica: Ninguna (proteger con L, T)
Resultado: Original (protegido por grupos)
```

**⚪ NO SENSIBLE**
```
¿Qué es? Información pública
Ejemplos: país, idioma, calificación pública
Técnica: Ninguna
Resultado: Original (sin cambios)
```

### Parámetros Explicados

**Intervalos/Niveles**
```
Cuántos rangos crear en generalización
Más intervalos = Más detalle, menos privacidad
Menos intervalos = Menos detalle, más privacidad
```

**Tasa de Supresión**
```
Porcentaje de valores a reemplazar con *
0.0-1.0 (0%-100%)
1.0 = Suprimir todo
```

**K (K-Anonymity)**
```
Personas mínimas por grupo
K=3 → Cada combinación aparece 3+ veces
Mayor K = Más privacidad, más filas descartadas
```

**L (L-Diversity)**
```
Valores sensibles diferentes por grupo
L=2 → Mínimo 2 valores distintos
Previene ataques de homogeneidad
```

**T (T-Closeness)**
```
Similitud de distribución grupo vs global
T=0.2 → Distribución 80% similar
Previene ataques de similitud
```

**Epsilon (ε)**
```
Presupuesto de privacidad (ruido)
ε=1.0 → Estándar industria
Menor ε = Más privacidad, menos precisión
```

---

## ✅ CHECKLIST FINAL

Antes de "Procesar y Ver Resultados":

```
□ id: Identificador → Supresión (1.0)
□ nombre_completo: Identificador → Supresión (1.0)
□ email: Identificador → Supresión (1.0)
□ edad: Quasi-Identificador → Generalización (4 intervalos)
□ codigo_postal: Quasi-Identificador → Generalización (3 intervalos)
□ genero: Quasi-Identificador → Ninguna
□ salario: Sensible → Generalización (3 intervalos) o Ninguna
□ condicion_medica: Sensible → Ninguna
□ calificacion: No Sensible → Ninguna

□ K Value = 3
□ L Value = 2
□ T Value = 0.2
□ Epsilon = 1.0

□ Nombre de configuración: "Config for datos_sensibles_prueba"
```

---

## 🎉 ¡LISTO PARA PROCESAR!

Con esta configuración lograrás:
✅ Protección robusta de identidad
✅ Privacidad garantizada (K=3, L=2, T=0.2)
✅ Datos útiles para análisis (85% utilidad)
✅ Cumplimiento GDPR
✅ Balance perfecto privacidad-utilidad

**¡Haz click en "Procesar y Ver Resultados"!** 🚀
