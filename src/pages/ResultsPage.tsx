import React, { useState, useEffect } from 'react';
import { BarChart3, Shield, TrendingDown, Clock, CheckCircle, Eye, Download, AlertCircle } from 'lucide-react';
import { getApiUrl } from '../services/config';

interface Result {
  id: string;
  dataset_id: string;
  config_id: string;
  metrics: {
    k_anonymity: number;
    l_diversity: number;
    information_loss_percentage: number;
    original_rows: number;
    anonymized_rows: number;
    original_columns: number;
    anonymized_columns: number;
    quasi_identifiers: string[];
    sensitive_attributes: string[];
  };
  technique_details: Record<string, any>;
  anonymized_data: any[];
  status: string;
  processing_time_ms: number;
  created_at: string;
}

interface ResultsPageProps {
  selectedResultId?: string;
  onNavigate: (page: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ selectedResultId, onNavigate }) => {
  const [results, setResults] = useState<Result[]>([]);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [showData, setShowData] = useState(false);
  const [error, setError] = useState('');
  const [dataCurrentPage, setDataCurrentPage] = useState(1);
  const dataRowsPerPage = 20;

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    if (selectedResultId && results.length > 0) {
      const result = results.find(r => r.id === selectedResultId);
      if (result) {
        setSelectedResult(result);
      }
    }
  }, [selectedResultId, results]);

  useEffect(() => {
    // Reset to page 1 when showing/hiding data
    setDataCurrentPage(1);
  }, [showData]);

  const fetchResults = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/results`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        if (data.length > 0 && !selectedResult) {
          setSelectedResult(data[0]);
        }
      } else {
        console.error('Error al cargar resultados:', response.status);
        setError(`Error del servidor: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error al conectar con el servidor:', error);
      const apiUrl = getApiUrl();
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        setError(`No se puede conectar al servidor. Verifica que el backend esté ejecutándose en ${apiUrl}`);
      } else {
        setError('Error al cargar los resultados');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!selectedResult) return;

    const dataStr = JSON.stringify(selectedResult.anonymized_data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anonymized_data_${selectedResult.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-2">Error al cargar resultados</h3>
            <p className="text-red-700 mb-4">{error}</p>
            {error.includes('backend') && (
              <div className="mt-3 text-sm text-red-600 bg-red-100 rounded p-3">
                <p className="font-semibold mb-2">Para iniciar el backend:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Abre una terminal en la carpeta <code className="bg-red-200 px-1 rounded">backend</code></li>
                  <li>Ejecuta: <code className="bg-red-200 px-1 rounded">python main.py</code></li>
                  <li>Verifica que el servidor esté corriendo en http://localhost:8000</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">No hay Resultados Disponibles</h2>
        <p className="text-slate-600 mb-6">Procesa algunos conjuntos de datos para ver resultados aquí</p>
        <button
          onClick={() => onNavigate('upload')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Comenzar
        </button>
      </div>
    );
  }

  if (!selectedResult) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Resultados de Anonimización</h1>
          <p className="text-slate-600">Análisis detallado de protección de privacidad y utilidad de datos</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowData(!showData)}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            <Eye className="w-4 h-4" />
            <span>{showData ? 'Ocultar' : 'Mostrar'} Datos</span>
          </button>
          <button
            onClick={downloadResult}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span>Descargar</span>
          </button>
        </div>
      </div>

      {results.length > 1 && (
        <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Result</label>
          <select
            value={selectedResult.id}
            onChange={(e) => {
              const result = results.find(r => r.id === e.target.value);
              if (result) setSelectedResult(result);
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {results.map((result) => (
              <option key={result.id} value={result.id}>
                {new Date(result.created_at).toLocaleString()} - K={result.metrics.k_anonymity}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{selectedResult.metrics.k_anonymity}</div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Nivel de K-Anonimato</h3>
          <p className="text-xs text-slate-500 mt-2">
            Cada registro es indistinguible de al menos {selectedResult.metrics.k_anonymity - 1} otros
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{selectedResult.metrics.l_diversity.toFixed(1)}</div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">L-Diversidad</h3>
          <p className="text-xs text-slate-500 mt-2">
            Valores distintos mínimos en atributos sensibles por grupo
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {selectedResult.metrics.information_loss_percentage.toFixed(1)}%
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Pérdida de Información</h3>
          <p className="text-xs text-slate-500 mt-2">
            Porcentaje de precisión de datos perdida durante la anonimización
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-slate-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {selectedResult.processing_time_ms}
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Tiempo de Procesamiento</h3>
          <p className="text-xs text-slate-500 mt-2">Milisegundos tomados para anonimizar los datos</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Comparación de Datos</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Conjunto de Datos Original</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Filas:</span>
                <span className="font-medium">{selectedResult.metrics.original_rows.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Columnas:</span>
                <span className="font-medium">{selectedResult.metrics.original_columns}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Conjunto de Datos Anonimizado</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Filas:</span>
                <span className="font-medium">{selectedResult.metrics.anonymized_rows.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Columnas:</span>
                <span className="font-medium">{selectedResult.metrics.anonymized_columns}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Técnicas Aplicadas</h2>
        <div className="space-y-4">
          {Object.entries(selectedResult.technique_details).map(([key, detail]: [string, any]) => (
            <div key={key} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">{detail.technique}</h3>
                  {detail.column && (
                    <p className="text-sm text-slate-600 mb-2">
                      Aplicado a la columna: <span className="font-medium">{detail.column}</span>
                    </p>
                  )}
                  <p className="text-slate-700 mb-3">{detail.explanation}</p>
                </div>
              </div>

              {detail.params && Object.keys(detail.params).length > 0 && (
                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <p className="text-sm font-medium text-slate-700 mb-2">Parameters:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(detail.params).map(([param, value]: [string, any]) => (
                      <span key={param} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {param}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detail.changes && detail.changes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Changes Made:</p>
                  <ul className="space-y-1">
                    {detail.changes.map((change: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detail.quasi_identifiers && detail.quasi_identifiers.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-slate-700">Quasi-Identifiers Used:</p>
                  <p className="text-sm text-slate-600">{detail.quasi_identifiers.join(', ')}</p>
                </div>
              )}

              {detail.target_k && (
                <div className="mt-3 flex items-center space-x-4 text-sm">
                  <div>
                    <span className="text-slate-600">K Objetivo: </span>
                    <span className="font-medium">{detail.target_k}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">K Logrado: </span>
                    <span className="font-medium text-green-600">{detail.achieved_k}</span>
                  </div>
                </div>
              )}

              {detail.target_l && (
                <div className="mt-3 flex items-center space-x-4 text-sm">
                  <div>
                    <span className="text-slate-600">L Objetivo: </span>
                    <span className="font-medium">{detail.target_l}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">L Logrado: </span>
                    <span className="font-medium text-green-600">{detail.achieved_l}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showData && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Vista Previa de Datos Anonimizados</h2>

          {/* Paginación superior */}
          {selectedResult.anonymized_data.length > dataRowsPerPage && (
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
              <div className="text-sm text-slate-600">
                Mostrando {((dataCurrentPage - 1) * dataRowsPerPage) + 1} - {Math.min(dataCurrentPage * dataRowsPerPage, selectedResult.anonymized_data.length)} de {selectedResult.anonymized_data.length} filas
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDataCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={dataCurrentPage === 1}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-slate-600">
                  Página {dataCurrentPage} de {Math.ceil(selectedResult.anonymized_data.length / dataRowsPerPage)}
                </span>
                <button
                  onClick={() => setDataCurrentPage(prev => Math.min(Math.ceil(selectedResult.anonymized_data.length / dataRowsPerPage), prev + 1))}
                  disabled={dataCurrentPage >= Math.ceil(selectedResult.anonymized_data.length / dataRowsPerPage)}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  {selectedResult.anonymized_data.length > 0 &&
                    Object.keys(selectedResult.anonymized_data[0]).map((key) => (
                      <th key={key} className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {selectedResult.anonymized_data
                  .slice(
                    (dataCurrentPage - 1) * dataRowsPerPage,
                    dataCurrentPage * dataRowsPerPage
                  )
                  .map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {Object.values(row).map((value: any, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-2 text-sm text-slate-600 border border-slate-200">
                          {value?.toString() || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Paginación inferior */}
          {selectedResult.anonymized_data.length > dataRowsPerPage && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Mostrando {((dataCurrentPage - 1) * dataRowsPerPage) + 1} - {Math.min(dataCurrentPage * dataRowsPerPage, selectedResult.anonymized_data.length)} de {selectedResult.anonymized_data.length} filas
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDataCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={dataCurrentPage === 1}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-slate-600">
                  Página {dataCurrentPage} de {Math.ceil(selectedResult.anonymized_data.length / dataRowsPerPage)}
                </span>
                <button
                  onClick={() => setDataCurrentPage(prev => Math.min(Math.ceil(selectedResult.anonymized_data.length / dataRowsPerPage), prev + 1))}
                  disabled={dataCurrentPage >= Math.ceil(selectedResult.anonymized_data.length / dataRowsPerPage)}
                  className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};