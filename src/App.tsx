import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { ConfigurePage } from './pages/ConfigurePage';
import { ResultsPage } from './pages/ResultsPage';
import { DocsPage } from './pages/DocsPage';
import { loadConfig } from './services/config';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | undefined>();
  const [selectedResultId, setSelectedResultId] = useState<string | undefined>();
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    loadConfig().then(() => {
      setConfigLoaded(true);
    });
  }, []);

  const handleNavigate = (page: string, id?: string) => {
    setCurrentPage(page);
    if (page === 'configure') {
      setSelectedDatasetId(id);
    } else if (page === 'results') {
      setSelectedResultId(id);
    }
  };

  if (!configLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
      {currentPage === 'upload' && <UploadPage onNavigate={handleNavigate} />}
      {currentPage === 'configure' && <ConfigurePage selectedDatasetId={selectedDatasetId} onNavigate={handleNavigate} />}
      {currentPage === 'results' && <ResultsPage selectedResultId={selectedResultId} onNavigate={handleNavigate} />}
      {currentPage === 'docs' && <DocsPage />}
    </Layout>
  );
}

export default App;
