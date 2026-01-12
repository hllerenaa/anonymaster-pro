import React, {useState, useEffect, useCallback} from 'react';
import {Upload, FileSpreadsheet, CheckCircle, AlertCircle, Trash2, Eye, Info} from 'lucide-react';
import {getApiUrl, getConfig} from '../services/config';
import { getApiBaseUrl } from '../services/config';

interface Dataset {
    id: string;
    name: string;
    original_filename: string;
    row_count: number;
    column_count: number;
    column_names: string[];
    created_at: string;
    data: any[];
}

interface UploadPageProps {
    onNavigate: (page: string, datasetId?: string) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({onNavigate}) => {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [previewData, setPreviewData] = useState<Dataset | null>(null);
    const [previewPage, setPreviewPage] = useState(1);
    const previewRowsPerPage = 10;

    useEffect(() => {
        fetchDatasets();
    }, []);

    useEffect(() => {
        // Reset to page 1 when preview data changes
        setPreviewPage(1);
    }, [previewData]);

    const fetchDatasets = async () => {
        setLoading(true);
        try {
            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/api/datasets`);
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
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        setError('');
        setSuccess('');

        const config = getConfig();
        const acceptedFormats = config.upload.acceptedFormats.join('|').replace(/\./g, '\\.');
        const formatRegex = new RegExp(`\\.(${acceptedFormats.replace(/\|/g, '|').replace(/\\\./g, '')})$`);

        if (!formatRegex.test(file.name)) {
            setError(`Por favor sube un archivo válido (${config.upload.acceptedFormats.join(', ')})`);
            return;
        }

        if (file.size > config.upload.maxFileSizeMB * 1024 * 1024) {
            setError(`El tamaño del archivo debe ser menor a ${config.upload.maxFileSizeMB}MB`);
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/api/datasets/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setSuccess(`Archivo ${file.name} cargado exitosamente`);
                await fetchDatasets();
            } else {
                let errorMessage = 'Error al cargar el archivo';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } catch {
                    errorMessage = `Error del servidor (${response.status} ${response.statusText})`;
                }
                setError(errorMessage);
            }
        } catch (error: any) {
            console.error('Error al cargar archivo:', error);

            const apiUrl = getApiUrl();
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                setError(`No se puede conectar al servidor. Asegúrate de que el backend esté ejecutándose en ${apiUrl}`);
            } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                setError('Error de conexión. Verifica que el backend esté activo y accesible.');
            } else {
                setError(error.message || 'Ocurrió un error inesperado durante la carga');
            }
        } finally {
            setUploading(false);
        }
    };

    const viewPreview = async (datasetId: string) => {
        try {
            const apiUrl = getApiUrl();
            const response = await fetch(`${apiUrl}/api/datasets/${datasetId}`);
            if (response.ok) {
                const data = await response.json();
                setPreviewData(data);
            }
        } catch (error) {
            console.error('Error fetching dataset:', error);
        }
    };

    const apiBaseUrl = getApiBaseUrl();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Cargar Dataset</h1>
                <p className="text-slate-600">Sube tus datos en formato Excel o CSV para comenzar el proceso de
                    anonimización</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                    <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0"/>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-3">Formato del Archivo</h3>
                        <div className="space-y-3 text-sm text-slate-700">
                            <div>
                                <p className="font-semibold mb-1">Estructura Requerida:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>La primera fila debe contener los <strong>nombres de las columnas</strong></li>
                                    <li>Cada fila posterior representa un <strong>registro de datos</strong></li>
                                    <li>No dejar filas vacías entre los datos</li>
                                    <li>Evitar caracteres especiales en los nombres de columnas</li>
                                </ul>
                            </div>

                            <div>
                                <p className="font-semibold mb-1">Ejemplo de estructura correcta:</p>
                                <div className="bg-white border border-slate-300 rounded p-3 mt-2 overflow-x-auto">
                                    <table className="text-xs w-full border-collapse">
                                        <thead>
                                        <tr className="bg-slate-100">
                                            <th className="border border-slate-300 px-2 py-1 text-left">id</th>
                                            <th className="border border-slate-300 px-2 py-1 text-left">nombre</th>
                                            <th className="border border-slate-300 px-2 py-1 text-left">edad</th>
                                            <th className="border border-slate-300 px-2 py-1 text-left">codigo_postal</th>
                                            <th className="border border-slate-300 px-2 py-1 text-left">salario</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td className="border border-slate-300 px-2 py-1">1</td>
                                            <td className="border border-slate-300 px-2 py-1">Juan Pérez</td>
                                            <td className="border border-slate-300 px-2 py-1">28</td>
                                            <td className="border border-slate-300 px-2 py-1">10001</td>
                                            <td className="border border-slate-300 px-2 py-1">55000</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-slate-300 px-2 py-1">2</td>
                                            <td className="border border-slate-300 px-2 py-1">María García</td>
                                            <td className="border border-slate-300 px-2 py-1">35</td>
                                            <td className="border border-slate-300 px-2 py-1">10002</td>
                                            <td className="border border-slate-300 px-2 py-1">72000</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <p className="font-semibold mb-1">Tipos de Columnas:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li><strong>Identificadores:</strong> ID, email, nombre completo, SSN (se
                                        eliminarán)
                                    </li>
                                    <li><strong>Cuasi-identificadores:</strong> edad, código postal, género (se
                                        generalizarán)
                                    </li>
                                    <li><strong>Datos sensibles:</strong> salario, condición médica, calificaciones</li>
                                    <li><strong>Datos no sensibles:</strong> información pública general</li>
                                </ul>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                                <p className="font-semibold text-yellow-900 mb-1">Recomendaciones:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2 text-yellow-900">
                                    <li>Revisa que no haya celdas fusionadas</li>
                                    <li>Asegúrate de que todos los datos estén en una sola hoja (si es Excel)</li>
                                    <li>Verifica que los tipos de datos sean consistentes en cada columna</li>
                                    <li>Máximo 50MB de tamaño de archivo</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                    dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 bg-white hover:border-blue-400'
                }`}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileInput}
                    disabled={uploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-4">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                            dragActive ? 'bg-blue-100' : 'bg-slate-100'
                        }`}>
                            <Upload className={`w-10 h-10 ${dragActive ? 'text-blue-600' : 'text-slate-600'}`}/>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-slate-900">
                                {uploading ? 'Cargando...' : 'Arrastra tu archivo aquí o haz clic para buscar'}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                Soporta archivos Excel (.xlsx, .xls) y CSV hasta 50MB
                            </p>
                        </div>
                    </div>
                </label>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"/>
                        <div className="flex-1">
                            <p className="text-red-700 font-medium">{error}</p>
                            {error.includes('backend') && (
                                <div className="mt-3 text-sm text-red-600 bg-red-100 rounded p-3">
                                    <p className="font-semibold mb-2">Para iniciar el backend:</p>
                                    <ol className="list-decimal list-inside space-y-1 ml-2">
                                        <li>
                                            URL configurada:&nbsp;
                                            <code className="bg-red-200 px-1 rounded">
                                                {apiBaseUrl || 'No definida'}
                                            </code>
                                        </li>
                                        <li>Abre una terminal en la carpeta <code
                                            className="bg-red-200 px-1 rounded">backend</code></li>
                                        <li>Ejecuta: <code className="bg-red-200 px-1 rounded">python main.py</code>
                                        </li>
                                        <li>Verifica que el servidor esté corriendo en http://localhost:8000</li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"/>
                    <p className="text-green-700">{success}</p>
                </div>
            )}

            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Tus Datasets</h2>
                {loading ? (
                    <div className="text-center py-12">
                        <div
                            className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : datasets.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
                        <FileSpreadsheet className="w-16 h-16 text-slate-400 mx-auto mb-4"/>
                        <p className="text-slate-600">Aún no has cargado ningún dataset</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {datasets.map((dataset) => (
                            <div key={dataset.id}
                                 className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div
                                            className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileSpreadsheet className="w-6 h-6 text-blue-600"/>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">{dataset.name}</h3>
                                            <p className="text-sm text-slate-600 mb-3">{dataset.original_filename}</p>
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                                <span>{dataset.row_count.toLocaleString()} filas</span>
                                                <span>{dataset.column_count} columnas</span>
                                                <span>{new Date(dataset.created_at).toLocaleDateString('es-ES')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => viewPreview(dataset.id)}
                                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Vista previa"
                                        >
                                            <Eye className="w-5 h-5"/>
                                        </button>
                                        <button
                                            onClick={() => onNavigate('configure', dataset.id)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            Configurar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {previewData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{previewData.name}</h2>
                                <p className="text-sm text-slate-600 mt-1">
                                    {previewData.row_count} filas × {previewData.column_count} columnas
                                </p>
                            </div>
                            <button
                                onClick={() => setPreviewData(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5 text-slate-600"/>
                            </button>
                        </div>
                        <div className="p-6 overflow-auto flex-1">
                            {/* Paginación superior */}
                            {previewData.data.length > previewRowsPerPage && (
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                                    <div className="text-sm text-slate-600">
                                        Mostrando {((previewPage - 1) * previewRowsPerPage) + 1} - {Math.min(previewPage * previewRowsPerPage, previewData.data.length)} de {previewData.data.length} filas
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setPreviewPage(prev => Math.max(1, prev - 1))}
                                            disabled={previewPage === 1}
                                            className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Anterior
                                        </button>
                                        <span className="text-sm text-slate-600">
                      Página {previewPage} de {Math.ceil(previewData.data.length / previewRowsPerPage)}
                    </span>
                                        <button
                                            onClick={() => setPreviewPage(prev => Math.min(Math.ceil(previewData.data.length / previewRowsPerPage), prev + 1))}
                                            disabled={previewPage >= Math.ceil(previewData.data.length / previewRowsPerPage)}
                                            className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                        {previewData.column_names.map((col, idx) => (
                                            <th key={idx}
                                                className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border border-slate-200">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {previewData.data
                                        .slice(
                                            (previewPage - 1) * previewRowsPerPage,
                                            previewPage * previewRowsPerPage
                                        )
                                        .map((row, rowIdx) => (
                                            <tr key={rowIdx} className="hover:bg-slate-50">
                                                {previewData.column_names.map((col, colIdx) => (
                                                    <td key={colIdx}
                                                        className="px-4 py-2 text-sm text-slate-600 border border-slate-200">
                                                        {row[col]?.toString() || '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación inferior */}
                            {previewData.data.length > previewRowsPerPage && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                                    <div className="text-sm text-slate-600">
                                        Mostrando {((previewPage - 1) * previewRowsPerPage) + 1} - {Math.min(previewPage * previewRowsPerPage, previewData.data.length)} de {previewData.data.length} filas
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setPreviewPage(prev => Math.max(1, prev - 1))}
                                            disabled={previewPage === 1}
                                            className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Anterior
                                        </button>
                                        <span className="text-sm text-slate-600">
                      Página {previewPage} de {Math.ceil(previewData.data.length / previewRowsPerPage)}
                    </span>
                                        <button
                                            onClick={() => setPreviewPage(prev => Math.min(Math.ceil(previewData.data.length / previewRowsPerPage), prev + 1))}
                                            disabled={previewPage >= Math.ceil(previewData.data.length / previewRowsPerPage)}
                                            className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};