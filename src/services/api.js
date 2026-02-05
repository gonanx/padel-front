const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

async function fetchConfig(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    const publicEndpoints = ['/login', '/register'];
    const isPublic = publicEndpoints.includes(endpoint);

    if (!isPublic && !token) {
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

export const apiService = {
    login: async (credentials) => {
        const data = await fetchConfig('/login', 'POST', credentials);
        if (data.access_token) {
            localStorage.setItem('token', data.access_token);
        }
        return data;
    },

    register: (userData) => fetchConfig('/register', 'POST', userData),

    logout: () => {
        localStorage.removeItem('token');
    },

    getMe: () => fetchConfig('/me'),

    getPistas: () => fetchConfig('/pistas'),

    getHorarios: () => fetchConfig('/horarios'),

    getDisponibilidadPista: (pistaId, fecha) =>
        fetchConfig('/disponibilidadpista', 'POST', { pista_id: pistaId, fecha }),

    getDisponibilidadTodas: (fecha) =>
        fetchConfig('/disponibilidad', 'POST', { fecha }),

    calcularPrecio: (pistaId, fecha, horarioIds) =>
        fetchConfig('/calcular_precio', 'POST', {
            pista_id: pistaId,
            fecha,
            horario_ids: horarioIds
        }),

    reservar: (pistaId, fecha, horarioIds) =>
        fetchConfig('/reservar', 'POST', {
            pista_id: pistaId,
            fecha,
            horario_ids: horarioIds
        }),

    getMisReservas: () => fetchConfig('/mis_reservas'),

    cancelarReserva: (reservaId) =>
        fetchConfig('/cancelar_reserva', 'POST', { reserva_id: reservaId }),

    getTodasLasReservas: () => fetchConfig('/admin/todas_reservas'),
};