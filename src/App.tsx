import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { UploadPage } from './pages/UploadPage';
import { ConfigurePage } from './pages/ConfigurePage';
import { ResultsPage } from './pages/ResultsPage';
import { DocsPage } from './pages/DocsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | undefined>();
  const [selectedResultId, setSelectedResultId] = useState<string | undefined>();

  const handleNavigate = (page: string, id?: string) => {
    setCurrentPage(page);
    if (page === 'configure') {
      setSelectedDatasetId(id);
    } else if (page === 'results') {
      setSelectedResultId(id);
    }
  };

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
