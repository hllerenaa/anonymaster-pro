import React, { useState } from 'react';
import { Book, Shield, Eye, Grid, Zap, Lock, AlertCircle, HelpCircle, FileText } from 'lucide-react';

export const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Introducción', icon: Book },
    { id: 'k-anonymity', label: 'K-Anonimato', icon: Shield },
    { id: 'l-diversity', label: 'L-Diversidad', icon: Grid },
    { id: 't-closeness', label: 'T-Cercanía', icon: Zap },
    { id: 'diff-privacy', label: 'Privacidad Diferencial', icon: Lock },
    { id: 'generalization', label: 'Generalización', icon: Eye },
    { id: 'suppression', label: 'Supresión', icon: AlertCircle },
    { id: 'guide', label: 'Guía Paso a Paso', icon: FileText },
    { id: 'faq', label: 'Preguntas Frecuentes', icon: HelpCircle },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200 sticky top-4">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Contenido</h2>
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="md:col-span-3 space-y-6">
        {activeSection === 'overview' && (
          <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">¿Qué es la Anonimización de Datos?</h1>

            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                La anonimización de datos es el proceso de proteger información privada o sensible eliminando o modificando
                detalles identificativos de los conjuntos de datos. Es como quitar las etiquetas con nombres de una foto
                grupal para poder compartirla sin revelar quién está en ella.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mb-3 mt-8">¿Por qué es Importante?</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-slate-900">Protección de Privacidad:</strong>
                      <span className="text-slate-700"> Mantiene segura la información personal de las personas para que no puedan ser identificadas</span>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-slate-900">Cumplimiento Legal:</strong>
                      <span className="text-slate-700"> Ayuda a cumplir con requisitos de leyes como GDPR, HIPAA y CCPA</span>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Grid className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <strong className="text-slate-900">Compartir Datos:</strong>
                      <span className="text-slate-700"> Permite compartir datos de forma segura para investigación y análisis</span>
                    </div>
                  </li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-3 mt-8">Casos de Uso Comunes</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-bold text-slate-900 mb-2">Salud</h3>
                  <p className="text-slate-600 text-sm">Proteger registros de pacientes permitiendo la investigación médica</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-bold text-slate-900 mb-2">Finanzas</h3>
                  <p className="text-slate-600 text-sm">Analizar patrones de transacciones sin exponer identidades de clientes</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-bold text-slate-900 mb-2">Educación</h3>
                  <p className="text-slate-600 text-sm">Estudiar datos de rendimiento estudiantil manteniendo la privacidad</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-bold text-slate-900 mb-2">Marketing</h3>
                  <p className="text-slate-600 text-sm">Analizar comportamiento de clientes sin revelar detalles personales</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'k-anonymity' && (
          <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">K-Anonimato</h1>
            </div>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-bold text-slate-900 mb-3">¿Qué es K-Anonimato?</h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                Imagina que estás en una multitud vistiendo el mismo atuendo que al menos K-1 personas más. Incluso si
                alguien te ve, no puede distinguir cuál persona en ese grupo eres tú. ¡Eso es exactamente lo que hace
                K-anonimato con los datos!
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Explicación Simple:</h3>
                <p className="text-slate-700 mb-3">
                  K-anonimato asegura que cada persona en tu conjunto de datos se vea igual a al menos K-1 personas más.
                  Si K=5, entonces cada persona es idéntica a al menos 4 otras basándose en ciertas características.
                </p>
                <p className="text-slate-700">
                  <strong>Ejemplo:</strong> En lugar de tener una persona de 28 años del código postal 10001, tendrías al
                  menos 5 personas con esas mismas características, haciendo imposible identificar a un individuo específico.
                </p>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3">Cómo Funciona:</h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-6">
                <li>Identifica "cuasi-identificadores" - información que podría identificarte cuando se combina (como edad, código postal, género)</li>
                <li>Agrupa personas con características similares</li>
                <li>Se asegura de que cada grupo tenga al menos K personas</li>
                <li>Si un grupo es muy pequeño, generaliza los datos (ej. edad 28 se convierte en "25-30")</li>
              </ol>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-slate-900 mb-2">Analogía del Mundo Real:</h3>
                <p className="text-slate-700">
                  Piensa en una rueda de reconocimiento en una película - si todos en la rueda se ven lo suficientemente
                  similares, el testigo no puede identificar a la persona específica que vio. ¡K-anonimato es la protección
                  de rueda de reconocimiento de tus datos!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'l-diversity' && (
          <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Grid className="w-6 h-6 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">L-Diversidad</h1>
            </div>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-bold text-slate-900 mb-3">¿Qué es L-Diversidad?</h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                K-anonimato es genial, ¿pero qué pasa si todos en un grupo tienen la misma condición médica? ¡Un atacante
                aún podría conocer información sensible! L-diversidad resuelve esto asegurando diversidad dentro de cada grupo.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Explicación Simple:</h3>
                <p className="text-slate-700 mb-3">
                  L-diversidad se asegura de que dentro de cada grupo de personas similares, haya al menos L valores
                  diferentes para información sensible. Si L=3, cada grupo debe tener al menos 3 condiciones médicas
                  diferentes, rangos salariales u otros datos sensibles.
                </p>
                <p className="text-slate-700">
                  <strong>Ejemplo:</strong> En un grupo de 5 personas con la misma edad y código postal, en lugar de que
                  todas tengan "diabetes", podrían tener diabetes, hipertensión, asma, enfermedad cardíaca y alergias -
                  haciendo imposible adivinar la condición de un individuo.
                </p>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3">Por qué es Importante:</h3>
              <div className="space-y-3 text-slate-700 mb-6">
                <p>
                  <strong>El Problema:</strong> Imagina que todas las personas de 28 años del código postal 10001 en tu
                  conjunto de datos tienen diabetes. Aunque no puedas identificar a una persona específica, ¡sabes que
                  cualquier persona de 28 años de ese código postal tiene diabetes!
                </p>
                <p>
                  <strong>La Solución:</strong> L-diversidad asegura que los atributos sensibles varíen dentro de cada grupo,
                  previniendo este tipo de inferencias.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-slate-900 mb-2">Analogía del Mundo Real:</h3>
                <p className="text-slate-700">
                  Piensa en una caja de chocolates surtidos. K-anonimato asegura que tengas múltiples cajas que se vean
                  idénticas desde afuera. L-diversidad asegura que dentro de cada caja, tengas al menos L tipos diferentes
                  de chocolates, ¡no todos del mismo sabor!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 't-closeness' && (
          <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">T-Cercanía</h1>
            </div>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-bold text-slate-900 mb-3">¿Qué es T-Cercanía?</h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                L-diversidad es buena, ¿pero qué pasa si la distribución de un grupo es muy diferente de la población
                general? T-cercanía va un paso más allá asegurando que la distribución de valores sensibles en cada grupo
                coincida estrechamente con la distribución general.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Explicación Simple:</h3>
                <p className="text-slate-700 mb-3">
                  T-cercanía asegura que el patrón de información sensible en cada grupo sea similar al patrón en todo
                  el conjunto de datos. El valor "T" mide qué tan cercanas deben estar las distribuciones (T menor =
                  coincidencia más cercana).
                </p>
                <p className="text-slate-700">
                  <strong>Ejemplo:</strong> Si el 10% de todas las personas en tu conjunto de datos tienen diabetes,
                  entonces cada grupo también debería tener aproximadamente 10% con diabetes, no 90% o 0%. Esto previene
                  que alguien aprenda patrones inusuales sobre grupos específicos.
                </p>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3">Por qué Importa:</h3>
              <div className="space-y-3 text-slate-700 mb-6">
                <p>
                  <strong>El Problema:</strong> Incluso con L-diversidad, si un grupo tiene 80% de salarios altos mientras
                  que el conjunto de datos general tiene solo 20% de salarios altos, puedes inferir que este grupo es
                  probablemente rico.
                </p>
                <p>
                  <strong>La Solución:</strong> T-cercanía asegura que la distribución de cada grupo coincida con la
                  distribución general, previniendo estas inferencias estadísticas.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-slate-900 mb-2">Analogía del Mundo Real:</h3>
                <p className="text-slate-700">
                  Imagina una bolsa de canicas de colores donde 30% son rojas, 50% azules y 20% verdes. T-cercanía es
                  como asegurar que cuando agarres un puñado al azar, tu puñado tenga aproximadamente la misma distribución
                  de colores que toda la bolsa - ¡no todas rojas o todas azules!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'diff-privacy' && (
          <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Privacidad Diferencial</h1>
            </div>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-bold text-slate-900 mb-3">¿Qué es Privacidad Diferencial?</h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                ¡Esta es una de las técnicas de privacidad más poderosas! En lugar de modificar la estructura de datos,
                la privacidad diferencial agrega ruido aleatorio cuidadosamente calculado a los datos, haciendo matemáticamente
                imposible determinar si los datos de una persona específica fueron incluidos.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Explicación Simple:</h3>
                <p className="text-slate-700 mb-3">
                  Piensa en desenfocar ligeramente una foto. Aún puedes ver la imagen general y los patrones, pero los
                  detalles específicos están borrosos. La privacidad diferencial agrega "ruido" aleatorio a los números
                  para que no puedas saber si los datos de una persona específica están en el conjunto de datos o no.
                </p>
                <p className="text-slate-700">
                  <strong>Ejemplo:</strong> Si el salario de alguien es $50,000, podríamos agregar o restar una cantidad
                  aleatoria (como $2,342) para hacerlo $52,342. Al observar miles de salarios, el promedio general se
                  mantiene preciso, pero los valores individuales están protegidos.
                </p>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3">Entendiendo Epsilon:</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                <p className="text-slate-700 mb-3">
                  Epsilon es tu "presupuesto de privacidad" - controla cuánto ruido agregar:
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li><strong>Epsilon más bajo (ej. 0.1):</strong> Más ruido = privacidad más fuerte pero menos precisión</li>
                  <li><strong>Epsilon más alto (ej. 10):</strong> Menos ruido = privacidad más débil pero más precisión</li>
                </ul>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3">Beneficios Clave:</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6">
                <li>Garantía matemática de privacidad - no solo un intento de mejor esfuerzo</li>
                <li>Protege contra cualquier ataque futuro, incluso con poder computacional ilimitado</li>
                <li>Permite control preciso sobre el equilibrio privacidad-utilidad</li>
                <li>Usado por Apple, Google y Microsoft para recopilar datos de usuarios de forma privada</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-slate-900 mb-2">Analogía del Mundo Real:</h3>
                <p className="text-slate-700">
                  Imagina pedir a todos en una sala que escriban su edad, pero antes de compartirla, lancen una moneda.
                  Si es cara, escriben su edad real. Si es cruz, agregan o restan un número aleatorio entre 1-5. El
                  promedio de edad de la sala se mantiene aproximadamente preciso, ¡pero nadie conoce tu edad exacta!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'generalization' && (
          <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-slate-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Generalización</h1>
            </div>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-bold text-slate-900 mb-3">¿Qué es Generalización?</h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                La generalización es como alejarse en un mapa. En lugar de mostrar tu dirección exacta, muestra solo tu
                vecindario o ciudad. La información se vuelve menos específica pero aún útil para análisis.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Explicación Simple:</h3>
                <p className="text-slate-700 mb-3">
                  La generalización reemplaza valores específicos con categorías más amplias. En lugar de números exactos
                  o detalles, usas rangos o grupos generales.
                </p>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3">Ejemplos:</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-2">Edad</h4>
                  <p className="text-sm text-slate-600 mb-2">Original: 28, 31, 29, 32</p>
                  <p className="text-sm text-green-700">Generalizado: "25-35", "25-35", "25-35", "25-35"</p>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-2">Código Postal</h4>
                  <p className="text-sm text-slate-600 mb-2">Original: 10001, 10002, 10003</p>
                  <p className="text-sm text-green-700">Generalizado: "1000*", "1000*", "1000*"</p>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-2">Salario</h4>
                  <p className="text-sm text-slate-600 mb-2">Original: $55,000, $58,000, $52,000</p>
                  <p className="text-sm text-green-700">Generalizado: "$50k-$60k" para todos</p>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-2">Título de Trabajo</h4>
                  <p className="text-sm text-slate-600 mb-2">Original: "Ingeniero Senior", "Ingeniero Junior"</p>
                  <p className="text-sm text-green-700">Generalizado: "Ingeniero", "Ingeniero"</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3">Tipos de Generalización:</h3>
              <div className="space-y-3 mb-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-2">Para Números:</h4>
                  <p className="text-slate-700">Crear rangos o intervalos (ej. 20-30, 30-40, 40-50)</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-2">Para Categorías:</h4>
                  <p className="text-slate-700">Agrupar elementos similares (ej. todas las ciudades se convierten en "Urbano", todas las áreas rurales en "Rural")</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-slate-900 mb-2">Analogía del Mundo Real:</h3>
                <p className="text-slate-700">
                  En lugar de decir "Vivo en Calle Principal 123, Apartamento 4B," dices "Vivo en el centro."
                  En lugar de "Tengo 28 años y 143 días," dices "Estoy en mis veinte años."
                  ¡Sigue siendo informativo, pero menos identificable!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'suppression' && (
          <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Supresión</h1>
            </div>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-bold text-slate-900 mb-3">¿Qué es Supresión?</h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                La supresión es la técnica de privacidad más simple - ¡cuando tienes dudas, ocúltala! Es como usar un
                marcador negro para redactar información sensible en un documento. Reemplazas valores específicos con
                un símbolo (como * u "oculto") o los eliminas por completo.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Explicación Simple:</h3>
                <p className="text-slate-700 mb-3">
                  La supresión oculta o elimina datos que son demasiado riesgosos para compartir. Piensa en censurar
                  información personal - la reemplazas con asteriscos o espacios en blanco.
                </p>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3">Tipos de Supresión:</h3>
              <div className="space-y-4 mb-6">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-2">Supresión Completa</h4>
                  <p className="text-slate-700 mb-2">Eliminar columnas enteras que son demasiado identificativas:</p>
                  <div className="bg-slate-50 rounded p-3">
                    <p className="text-sm text-slate-600 mb-1">Antes: ID, Nombre, Email, Edad, Ciudad</p>
                    <p className="text-sm text-green-700">Después: Edad, Ciudad (eliminado ID, Nombre, Email completamente)</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-2">Supresión Parcial</h4>
                  <p className="text-slate-700 mb-2">Ocultar algunos valores aleatoriamente:</p>
                  <div className="bg-slate-50 rounded p-3">
                    <p className="text-sm text-slate-600 mb-1">Antes: $55k, $62k, $58k, $71k, $49k</p>
                    <p className="text-sm text-green-700">Después: $55k, *, $58k, *, $49k (ocultar 20% aleatoriamente)</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-2">Supresión de Registros</h4>
                  <p className="text-slate-700 mb-2">Eliminar filas enteras que son demasiado únicas:</p>
                  <div className="bg-slate-50 rounded p-3">
                    <p className="text-sm text-slate-600">Si alguien es la única persona de 98 años en el conjunto de datos, elimina su registro completo</p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-3">Cuándo Usar Supresión:</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6">
                <li><strong>Identificadores Directos:</strong> Siempre suprimir IDs, nombres, emails, teléfonos, números de seguro social</li>
                <li><strong>Valores Únicos:</strong> Suprimir combinaciones raras que podrían identificar a alguien</li>
                <li><strong>Valores Atípicos Extremos:</strong> Ocultar valores inusualmente altos o bajos que destacan</li>
                <li><strong>Grupos Pequeños:</strong> Cuando un grupo tiene menos de K personas, suprimir esos registros</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-slate-900 mb-2">Compromiso:</h3>
                <p className="text-slate-700">
                  La supresión es muy segura para la privacidad, pero pierdes información. Demasiada supresión hace
                  que tus datos sean menos útiles para análisis. Es mejor usarla selectivamente en los campos más sensibles.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-slate-900 mb-2">Analogía del Mundo Real:</h3>
                <p className="text-slate-700">
                  ¡Como protección de testigos para datos! Así como alguien en protección de testigos obtiene una nueva
                  identidad (nombre cambiado) o desaparece (ubicación oculta), los datos suprimidos son enmascarados
                  (*****) o eliminados completamente para proteger la privacidad.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'guide' && (
          <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Guía Paso a Paso</h1>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h2 className="text-xl font-bold text-slate-900 mb-3">Paso 1: Sube tus Datos</h2>
                <ol className="list-decimal list-inside space-y-2 text-slate-700">
                  <li>Ve a la página "Cargar Datos"</li>
                  <li>Arrastra y suelta tu archivo Excel o CSV (máx. 50MB)</li>
                  <li>Espera la validación y previsualiza tus datos</li>
                  <li>Haz clic en "Configurar" para continuar</li>
                </ol>
              </div>

              <div className="border-l-4 border-green-500 pl-6">
                <h2 className="text-xl font-bold text-slate-900 mb-3">Paso 2: Mapea tus Columnas</h2>
                <p className="text-slate-700 mb-3">Clasifica cada columna en uno de cuatro tipos:</p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-medium">Identificador</span>
                    <span className="text-slate-700">Identificadores directos como ID, email, número de seguro - serán eliminados completamente</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">Cuasi-ID</span>
                    <span className="text-slate-700">Campos que pueden identificar cuando se combinan - edad, código postal, género</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">Sensible</span>
                    <span className="text-slate-700">Información privada - salario, condiciones médicas, calificaciones</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">No Sensible</span>
                    <span className="text-slate-700">Información pública que no necesita protección</span>
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-500 pl-6">
                <h2 className="text-xl font-bold text-slate-900 mb-3">Paso 3: Elige Técnicas</h2>
                <p className="text-slate-700 mb-3">Para cada columna que no sea identificador, selecciona una técnica de anonimización:</p>
                <ul className="space-y-2 text-slate-700">
                  <li><strong>Ninguna:</strong> Mantener los valores originales (para datos no sensibles)</li>
                  <li><strong>Generalización:</strong> Mejor para cuasi-identificadores - convierte valores exactos en rangos</li>
                  <li><strong>Supresión:</strong> Buena para valores atípicos o valores individuales altamente sensibles</li>
                  <li><strong>Privacidad Diferencial:</strong> Protección avanzada para datos numéricos</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-6">
                <h2 className="text-xl font-bold text-slate-900 mb-3">Paso 4: Establece Parámetros</h2>
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-bold text-slate-900 mb-2">Valor K (recomendado: 5-10)</h3>
                    <p className="text-slate-700 text-sm">K más alto = privacidad más fuerte pero más generalización</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-bold text-slate-900 mb-2">Valor L (recomendado: 3-5)</h3>
                    <p className="text-slate-700 text-sm">Asegura diversidad en atributos sensibles</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-bold text-slate-900 mb-2">Nombre de Configuración</h3>
                    <p className="text-slate-700 text-sm">Dale a tu configuración un nombre memorable</p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-slate-500 pl-6">
                <h2 className="text-xl font-bold text-slate-900 mb-3">Paso 5: Procesar y Revisar</h2>
                <ol className="list-decimal list-inside space-y-2 text-slate-700">
                  <li>Haz clic en "Procesar y Ver Resultados"</li>
                  <li>Espera a que se complete la anonimización (usualmente unos segundos)</li>
                  <li>Revisa las métricas y explicaciones detalladas de las técnicas</li>
                  <li>Descarga el conjunto de datos anonimizado si estás satisfecho</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'faq' && (
          <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Preguntas Frecuentes</h1>

            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">¿Qué valor de K debo usar?</h3>
                <p className="text-slate-700">
                  Comienza con K=5 para privacidad moderada. Usa K=10 o mayor para datos altamente sensibles.
                  Recuerda: K más alto = más privacidad pero más generalización de datos y potencial pérdida de información.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">¿La anonimización afectará mi análisis de datos?</h3>
                <p className="text-slate-700">
                  Sí, siempre hay un compromiso entre privacidad y utilidad de datos. Sin embargo, nuestras técnicas están
                  diseñadas para preservar propiedades estadísticas y patrones mientras protegen la privacidad individual.
                  La métrica "Pérdida de Información" te muestra cuánta precisión se perdió.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">¿Es reversible la anonimización?</h3>
                <p className="text-slate-700">
                  ¡No! Ese es el punto. Una vez que los datos están apropiadamente anonimizados, no pueden ser des-anonimizados.
                  Por eso es importante mantener un respaldo de tus datos originales en una ubicación segura.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">¿Cuál es la diferencia entre anonimización y encriptación?</h3>
                <p className="text-slate-700">
                  La encriptación revuelve datos con una clave - puede ser desencriptada. La anonimización elimina información
                  identificativa permanentemente - no puede ser revertida. Usa encriptación para almacenamiento/transmisión,
                  anonimización para compartir/análisis.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">¿Esto cumple con GDPR/HIPAA?</h3>
                <p className="text-slate-700">
                  Nuestro sistema implementa técnicas reconocidas por regulaciones de privacidad, pero el cumplimiento depende de
                  tu caso de uso específico, la sensibilidad de tus datos y los parámetros que elijas. Recomendamos
                  consultar con un experto en privacidad para requisitos de cumplimiento.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">¿Pueden los datos anonimizados aún ser atacados?</h3>
                <p className="text-slate-700">
                  Ninguna técnica es 100% infalible, especialmente si se combina con fuentes de datos externas. Por eso
                  implementamos múltiples capas (K-anonimato + L-diversidad + privacidad diferencial) para proporcionar
                  protección fuerte contra varios tipos de ataques.
                </p>
              </div>

              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">¿Dónde se almacenan mis datos?</h3>
                <p className="text-slate-700">
                  Tus datos se almacenan de forma segura en tu base de datos Supabase con Seguridad a Nivel de Fila (RLS) habilitada.
                  Solo tú puedes acceder a tus conjuntos de datos y resultados. Todos los datos están encriptados en reposo y en tránsito.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">¿Qué formatos de archivo se admiten?</h3>
                <p className="text-slate-700">
                  Actualmente admitimos archivos Excel (.xlsx, .xls) y CSV hasta 50MB. Los datos deben estar en
                  formato tabular con encabezados en la primera fila.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
