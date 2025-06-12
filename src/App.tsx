import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/projects/ProjectsPage';
import NewProjectPage from './pages/projects/NewProjectPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import DeliveryNoteDetailPage from './pages/deliveryNotes/DeliveryNoteDetailPage';
import IncidentsPage from './pages/incidents/IncidentsPage';
import IncidentDetailPage from './pages/incidents/IncidentDetailPage';
import SettingsPage from './pages/SettingsPage';
import TestPage from './pages/TestPage';
import ProfilePage from './pages/ProfilePage';
import { suppressDndWarnings } from './utils/suppressWarnings';

function App() {
  // Apply warning suppression at the root level to catch all instances of the warning
  useEffect(() => {
    // Enable warning suppression on mount
    const cleanupWarningsSuppression = suppressDndWarnings();
    
    // Clean up on unmount
    return () => cleanupWarningsSuppression();
  }, []);
  
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a production environment, you would send this to an error reporting service
    console.error('Application error:', error, errorInfo);
  };
  
  return (
    <ErrorBoundary onError={handleError}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <ErrorBoundary>
            <Navbar />
          </ErrorBoundary>
          
          <main className="flex-1 bg-gray-50">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<HomePage />} />
                
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/new" element={<NewProjectPage />} />
                <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                <Route path="/projects/:projectId/orders/:orderId" element={<OrderDetailPage />} />
                <Route 
                  path="/projects/:projectId/orders/:orderId/deliveryNotes/:deliveryNoteId" 
                  element={<DeliveryNoteDetailPage />} 
                />
                
                <Route path="/incidents" element={<IncidentsPage />} />
                <Route path="/incidents/:incidentId" element={<IncidentDetailPage />} />
                
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </ErrorBoundary>
          </main>
          
          <ErrorBoundary>
            <Footer />
          </ErrorBoundary>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;