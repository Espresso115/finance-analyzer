import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import { ApiKeysPage } from './pages/ApiKeysPage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { SettingsPage } from './pages/SettingsPage';
import { SymbolPage } from './pages/SymbolPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { PageTransition } from './components/motion/PageTransition';

function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // If we're loading, just render routes normally (ProtectedRoute handles loading state)
  // If authenticated and on root, redirect to dashboard
  const renderRoot = () => {
    if (status === 'authenticated') {
      return <Navigate to="/dashboard" replace />;
    }
    return <LandingPage />;
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition>{renderRoot()}</PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
          <Route path="/api-keys" element={<PageTransition><ApiKeysPage /></PageTransition>} />
          <Route path="/symbol/:symbol" element={<PageTransition><SymbolPage /></PageTransition>} />
          <Route path="/symbol" element={<PageTransition><SymbolPage /></PageTransition>} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
