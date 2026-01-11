import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Save, Play, Info, CheckCircle2 } from 'lucide-react';

interface Dataset {
  id: string;
  name: string;
  column_names: string[];
  data: any[];
}

interface ColumnMapping {
  column: string;
  type: string;
}

interface TechniqueConfig {
  column: string;
  technique: string;
  params: Record<string, any>;
}

interface ConfigurePageProps {
  selectedDatasetId?: string;
  onNavigate: (page: string, resultId?: string) => void;
}

export const ConfigurePage: React.FC<ConfigurePageProps> = ({ selectedDatasetId, onNavigate }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [step, setStep] = useState(1);
  const [configName, setConfigName] = useState('');
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [techniques, setTechniques] = useState<TechniqueConfig[]>([]);
  const [globalParams, setGlobalParams] = useState({
    k: 2,
    l: 2,
    t: 0.2,
    epsilon: 1.0,
  });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    if (selectedDatasetId && datasets.length > 0) {
      const dataset = datasets.find(d => d.id === selectedDatasetId);
      if (dataset) {
        selectDataset(dataset);
      }
    }
  }, [selectedDatasetId, datasets]);

  useEffect(() => {
    if (selectedDataset) {
      loadSavedConfig();
    }
  }, [selectedDataset]);

  const fetchDatasets = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/datasets');
      if (response.ok) {
        const data = await response.json();
        setDatasets(data);
      } else {
        console.error('Error al cargar datasets:', response.status);
      }
    } catch (error: any) {
      console.error('Error al conectar con el servidor:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        setError('No se puede conectar al servidor. Verifica que el backend esté ejecutándose.');
      }
    }
  };

  const selectDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    const mappings = dataset.column_names.map(col => ({
      column: col,
      type: 'non-sensitive',
    }));
    setColumnMappings(mappings);
    setConfigName(`Config for ${dataset.name}`);
  };

  const loadSavedConfig = () => {
    if (!selectedDataset) return;
    const saved = localStorage.getItem(`config_${selectedDataset.id}`);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setColumnMappings(config.columnMappings || []);
        setTechniques(config.techniques || []);
        setGlobalParams(config.globalParams || { k: 2, l: 2, t: 0.2, epsilon: 1.0 });
        setConfigName(config.name || `Config for ${selectedDataset.name}`);
      } catch (e) {
        console.error('Error loading saved config:', e);
      }
    }
  };

  const saveToLocalStorage = () => {
    if (!selectedDataset) return;
    const config = {
      name: configName,
      columnMappings,
      techniques,
      globalParams,
    };
    localStorage.setItem(`config_${selectedDataset.id}`, JSON.stringify(config));
  };

  const updateColumnMapping = (column: string, type: string) => {
    setColumnMappings(prev => {
      const updated = prev.map(m => m.column === column ? { ...m, type } : m);
      return updated;
    });
  };

  const updateTechnique = (column: string, technique: string, params: Record<string, any> = {}) => {
    setTechniques(prev => {
      const existing = prev.find(t => t.column === column);
      if (existing) {
        return prev.map(t => t.column === column ? { column, technique, params } : t);
      }
      return [...prev, { column, technique, params }];
    });
  };

  const getTechniqueForColumn = (column: string) => {
    return techniques.find(t => t.column === column);
  };

  const handleSaveConfig = async () => {
    if (!selectedDataset || !configName) {
      setError('Please provide a configuration name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      saveToLocalStorage();

      const response = await fetch('http://localhost:8000/api/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataset_id: selectedDataset.id,
          name: configName,
          column_mappings: columnMappings,
          techniques: techniques,
          global_params: globalParams,
        }),
      });

      if (response.ok) {
        alert('Configuración guardada exitosamente');
      } else {
        let errorMessage = 'Error al guardar la configuración';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = `Error del servidor (${response.status} ${response.statusText})`;
        }
        setError(errorMessage);
      }
    } catch (error: any) {
      console.error('Error al guardar configuración:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        setError('No se puede conectar al servidor. Verifica que el backend esté ejecutándose en http://localhost:8000');
      } else {
        setError(error.message || 'Ocurrió un error inesperado');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (!selectedDataset) return;

    setProcessing(true);
    setError('');

    try {
      saveToLocalStorage();

      const configResponse = await fetch('http://localhost:8000/api/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataset_id: selectedDataset.id,
          name: configName,
          column_mappings: columnMappings,
          techniques: techniques,
          global_params: globalParams,
        }),
      });

      if (!configResponse.ok) {
        let errorMessage = 'Error al guardar la configuración';
        try {
          const errorData = await configResponse.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = `Error del servidor (${configResponse.status})`;
        }
        throw new Error(errorMessage);
      }

      const config = await configResponse.json();

      const processResponse = await fetch('http://localhost:8000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataset_id: selectedDataset.id,
          config_id: config.id,
        }),
      });

      if (processResponse.ok) {
        const result = await processResponse.json();
        onNavigate('results', result.id);
      } else {
        let errorMessage = 'Error al procesar la anonimización';
        try {
          const errorData = await processResponse.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = `Error del servidor (${processResponse.status})`;
        }
        setError(errorMessage);
      }
    } catch (error: any) {
      console.error('Error en el proceso:', error);
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        setError('No se puede conectar al servidor. Verifica que el backend esté ejecutándose en http://localhost:8000');
      } else {
        setError(error.message || 'Ocurrió un error inesperado');
      }
    } finally {
      setProcessing(false);
    }
  };

  const columnTypes = [
    { value: 'identifier', label: 'Identificador', description: 'Identificadores directos (ID, email, SSN) - serán eliminados' },
    { value: 'quasi-identifier', label: 'Cuasi-Identificador', description: 'Pueden identificar cuando se combinan (edad, código postal, género)' },
    { value: 'sensitive', label: 'Sensible', description: 'Información privada (salario, condición médica)' },
    { value: 'non-sensitive', label: 'No Sensible', description: 'Información pública' },
  ];

  const availableTechniques = [
    { value: 'none', label: 'Ninguna', description: 'Mantener valores originales' },
    { value: 'generalization', label: 'Generalización', description: 'Reemplazar valores específicos con categorías más amplias' },
    { value: 'suppression', label: 'Supresión', description: 'Ocultar o enmascarar valores' },
    { value: 'differential_privacy', label: 'Privacidad Diferencial', description: 'Agregar ruido aleatorio a los valores' },
  ];

  if (!selectedDataset) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Configurar Anonimización</h1>
          <p className="text-slate-600">Selecciona un conjunto de datos para comenzar la configuración</p>
        </div>

        <div className="grid gap-4">
          {datasets.map((dataset) => (
            <button
              key={dataset.id}
              onClick={() => selectDataset(dataset)}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all text-left"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">{dataset.name}</h3>
              <p className="text-sm text-slate-600">
                {dataset.data.length} filas × {dataset.column_names.length} columnas
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Configurar: {selectedDataset.name}</h1>
        <div className="flex items-center space-x-4 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  s === step
                    ? 'bg-blue-600 text-white'
                    : s < step
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              <span
                className={`ml-2 font-medium ${
                  s === step ? 'text-slate-900' : 'text-slate-500'
                }`}
              >
                {s === 1 ? 'Mapear Columnas' : s === 2 ? 'Seleccionar Técnicas' : 'Establecer Parámetros'}
              </span>
              {s < 3 && <ChevronRight className="w-5 h-5 text-slate-400 mx-2" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Paso 1: Clasifica tus columnas</p>
                <p>Identifica qué tipo de datos contiene cada columna para aplicar las técnicas de anonimización apropiadas.</p>
              </div>
            </div>

            <div className="space-y-3">
              {columnMappings.map((mapping) => (
                <div key={mapping.column} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1 font-medium text-slate-900">{mapping.column}</div>
                  <select
                    value={mapping.type}
                    onChange={(e) => updateColumnMapping(mapping.column, e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    {columnTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Paso 2: Elige técnicas de anonimización</p>
                <p>Selecciona cómo debe anonimizarse cada columna según su sensibilidad y tipo.</p>
              </div>
            </div>

            <div className="space-y-3">
              {columnMappings
                .filter(m => m.type !== 'identifier')
                .map((mapping) => {
                  const currentTechnique = getTechniqueForColumn(mapping.column);
                  return (
                    <div key={mapping.column} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-slate-900">{mapping.column}</div>
                          <div className="text-sm text-slate-600">{mapping.type}</div>
                        </div>
                        <select
                          value={currentTechnique?.technique || 'none'}
                          onChange={(e) => updateTechnique(mapping.column, e.target.value)}
                          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          {availableTechniques.map((tech) => (
                            <option key={tech.value} value={tech.value}>
                              {tech.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {currentTechnique && currentTechnique.technique === 'generalization' && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Intervalos/Niveles
                          </label>
                          <input
                            type="number"
                            min="2"
                            max="10"
                            value={currentTechnique.params.bins || currentTechnique.params.levels || 5}
                            onChange={(e) =>
                              updateTechnique(mapping.column, 'generalization', {
                                bins: parseInt(e.target.value),
                                levels: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      )}

                      {currentTechnique && currentTechnique.technique === 'suppression' && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tasa de Supresión (0.0 - 1.0)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={currentTechnique.params.threshold || 0.1}
                            onChange={(e) =>
                              updateTechnique(mapping.column, 'suppression', {
                                threshold: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      )}

                      {currentTechnique && currentTechnique.technique === 'differential_privacy' && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Epsilon (presupuesto de privacidad)
                          </label>
                          <input
                            type="number"
                            min="0.1"
                            max="10"
                            step="0.1"
                            value={currentTechnique.params.epsilon || 1.0}
                            onChange={(e) =>
                              updateTechnique(mapping.column, 'differential_privacy', {
                                epsilon: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Paso 3: Establece parámetros globales</p>
                <p>Configura los parámetros de privacidad que se aplican a todo el conjunto de datos.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre de Configuración
                </label>
                <input
                  type="text"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Ingresa el nombre de la configuración"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    K Value (K-Anonymity)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={globalParams.k}
                    onChange={(e) => setGlobalParams({ ...globalParams, k: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">Cada registro es indistinguible de al menos k-1 otros</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Valor L (L-Diversidad)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={globalParams.l}
                    onChange={(e) => setGlobalParams({ ...globalParams, l: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">Cada grupo tiene al menos l valores sensibles distintos</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Valor T (T-Cercanía)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={globalParams.t}
                    onChange={(e) => setGlobalParams({ ...globalParams, t: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">Umbral de distancia de distribución para atributos sensibles</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Epsilon (Privacidad Diferencial)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={globalParams.epsilon}
                    onChange={(e) => setGlobalParams({ ...globalParams, epsilon: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">Presupuesto de privacidad - más bajo es más privado</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center space-x-3">
            {step === 3 && (
              <button
                onClick={handleSaveConfig}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Config</span>
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleProcess}
                disabled={processing}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{processing ? 'Procesando...' : 'Procesar y Ver Resultados'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
