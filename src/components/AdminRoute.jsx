import { Navigate } from 'react-router-dom';

export const AdminRoute = ({ children, user }) => {
    // Si no está logueado o su rol no es Admin (id 2)
    if (!user || user.rol_id !== 2) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};