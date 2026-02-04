import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { apiService } from './services/api';

import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MisReservasPage from './pages/MisReservasPage';
import PageTransition from './components/PageTransitions';

const AdminRoute = ({ children, user }) => {
  const token = localStorage.getItem('token');
  if (!token || user?.rol_id !== 2) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiService.getMe()
        .then(data => setCurrentUser(data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return null;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/registro" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/mis-reservas" element={<PageTransition><MisReservasPage /></PageTransition>} />

        {/* Ruta para cualquier usuario logueado */}
        <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />

        {/* Ruta SOLO para administradores */}
        <Route
          path="/admin"
          element={
            <AdminRoute user={currentUser}>
              <PageTransition>
                <div>¡Bienvenido al Panel de Admin!</div> {/* Sustituye por tu <AdminPanel /> */}
              </PageTransition>
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <HashRouter>
      <AnimatedRoutes />
    </HashRouter>
  );
}

export default App;