import React, { useEffect, useState } from 'react';
import { Database, Shield, TrendingUp, Clock, ArrowRight, CheckCircle } from 'lucide-react';

interface Stats {
  total_datasets: number;
  total_configs: number;
  total_results: number;
  total_rows_processed: number;
  avg_processing_time_ms: number;
}

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Error al cargar estadísticas:', response.status);
      }
    } catch (error: any) {
      console.error('Error al conectar con el servidor:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'K-Anonimato',
      description: 'Asegura que cada registro sea indistinguible de al menos k-1 otros',
      color: 'bg-blue-500',
    },
    {
      icon: TrendingUp,
      title: 'L-Diversidad',
      description: 'Mantiene la diversidad en atributos sensibles para prevenir revelación de atributos',
      color: 'bg-green-500',
    },
    {
      icon: Database,
      title: 'Privacidad Diferencial',
      description: 'Agrega ruido calibrado para proteger la privacidad individual preservando patrones',
      color: 'bg-slate-500',
    },
  ];

  const quickActions = [
    {
      title: 'Cargar Nuevo Dataset',
      description: 'Comienza subiendo tus datos en formato Excel o CSV',
      action: () => onNavigate('upload'),
      icon: Database,
      color: 'bg-blue-600',
    },
    {
      title: 'Ver Documentación',
      description: 'Aprende sobre técnicas de anonimización y mejores prácticas',
      action: () => onNavigate('docs'),
      icon: Shield,
      color: 'bg-slate-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a Anonymaster</h1>
        <p className="text-xl text-blue-100 mb-6 max-w-2xl">
          Protege tus datos sensibles con técnicas avanzadas de anonimización mientras mantienes la utilidad de los datos para análisis
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onNavigate('upload')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <span>Comenzar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('docs')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-400 transition-colors"
          >
            Conocer Más
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {loading ? '...' : stats?.total_datasets || 0}
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Datasets Cargados</h3>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {loading ? '...' : stats?.total_results || 0}
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Anonimizaciones Completadas</h3>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-slate-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {loading ? '...' : stats?.total_rows_processed.toLocaleString() || 0}
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Registros Procesados</h3>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {loading ? '...' : Math.round(stats?.avg_processing_time_ms || 0)}
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600">Tiempo Prom. de Procesamiento (ms)</h3>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-all text-left group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {action.title}
              </h3>
              <p className="text-slate-600">{action.description}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Técnicas Disponibles</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex flex-col items-start">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Cómo Funciona</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-slate-700">Sube tu dataset en formato Excel o CSV</p>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-slate-700">Configura la anonimización mapeando columnas y seleccionando técnicas</p>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-slate-700">Procesa tus datos con algoritmos avanzados de privacidad</p>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-slate-700">Revisa resultados detallados y métricas para asegurar el cumplimiento de privacidad</p>
          </div>
        </div>
      </div>
    </div>
  );
};
