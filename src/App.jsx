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

  const checkUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const data = await apiService.getMe();
        setCurrentUser(data);
      } catch (err) {
        apiService.logout();
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkUser();
  }, [location.pathname]);

  if (loading) return null;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/registro" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/mis-reservas" element={<PageTransition><MisReservasPage /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
        <Route
          path="/admin"
          element={
            <AdminRoute user={currentUser}>
              <PageTransition>
                <div>¡Bienvenido al Panel de Admin!</div>
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