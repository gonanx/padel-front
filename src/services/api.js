const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

/**
 * Función base para peticiones HTTP con manejo de Auth
 */
async function fetchConfig(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');

    // 1. Rutas públicas
    const publicEndpoints = ['/login', '/register'];
    const isPublic = publicEndpoints.includes(endpoint);

    // 2. Control preventivo de Token
    if (!isPublic && !token) {
        console.warn(`Acceso denegado a ${endpoint}: Sin token.`);
        return { error: "No autenticado", pistas: [], horarios: [] };
    }

    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Si el token expiró (401), limpiamos y forzamos reinicio
        if (response.status === 401 && !isPublic) {
            localStorage.removeItem('token');
            throw new Error("Sesión expirada. Por favor, inicia sesión de nuevo.");
        }

        const contentType = response.headers.get("content-type");
        let data = {};
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (!response.ok) {
            // Lanzamos el error que viene del backend (ej: "Horario ya ocupado")
            throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
        }

        return data;

    } catch (error) {
        if (error.message === 'Failed to fetch') {
            throw new Error("Error de conexión: El servidor Flask no responde.");
        }
        throw error;
    }
}

// --- SERVICIOS DE LA API ---

export const apiService = {
    // Autenticación
    login: async (credentials) => {
        const data = await fetchConfig('/login', 'POST', credentials);
        if (data.access_token) {
            localStorage.setItem('token', data.access_token);
        }
        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    // Perfil de Usuario
    getMe: () => fetchConfig('/me'),

    // Catálogo de Pistas y Horarios
    getPistas: () => fetchConfig('/pistas'),

    getHorarios: () => fetchConfig('/horarios'),

    // Disponibilidad (Sincronizado con Flask)
    getDisponibilidadPista: (pistaId, fecha) =>
        fetchConfig('/disponibilidadpista', 'POST', { pista_id: pistaId, fecha }),

    getDisponibilidadTodas: (fecha) =>
        fetchConfig('/disponibilidad', 'POST', { fecha }),

    // Proceso de Reserva
    calcularPrecio: (pistaId, fecha, horarioIds) =>
        fetchConfig('/calcular_precio', 'POST', {
            pista_id: pistaId,
            fecha,
            horario_ids: horarioIds
        }),

    // Cambiado de crearReserva a reservar para coincidir con Dashboard.jsx
    reservar: (pistaId, fecha, horarioIds) =>
        fetchConfig('/reservar', 'POST', {
            pista_id: pistaId,
            fecha,
            horario_ids: horarioIds
        }),

    // Gestión de Reservas del Usuario
    getMisReservas: () => fetchConfig('/mis_reservas'),

    cancelarReserva: (reservaId) =>
        fetchConfig('/cancelar_reserva', 'POST', { reserva_id: reservaId }),

    // Administración
    getTodasLasReservas: () => fetchConfig('/admin/todas_reservas'),
};