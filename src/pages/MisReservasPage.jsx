import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import '../styles/Dashboard.css';

const MisReservasPage = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReservas = async () => {
            try {
                const data = await apiService.getMisReservas();
                setReservas(data.reservas || []);
            } catch (err) {
                setError(err.message || 'Error al cargar tus reservas');
            } finally {
                setLoading(false);
            }
        };

        fetchReservas();
    }, []);

    const handleCancelar = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;

        try {
            await apiService.cancelarReserva(id);
            setReservas(reservas.filter(r => r.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="loading">Cargando tus reservas...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="header-section">
                    <h1>Mis <span>Reservas</span></h1>
                    <p>Gestiona tus próximos partidos y el historial de juego.</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="reservas-grid">
                    {reservas.length === 0 ? (
                        <p className="no-data">Aún no tienes reservas realizadas.</p>
                    ) : (
                        reservas.map(reserva => (
                            <div key={reserva.id} className="reserva-card">
                                <div className="reserva-info">
                                    <h3>{reserva.pista_nombre}</h3>
                                    <p className="fecha">📅 {reserva.fecha}</p>
                                    <div className="horarios-list">
                                        {reserva.horarios.map((h, index) => (
                                            <span key={index} className="horario-tag">{h.franja}</span>
                                        ))}
                                    </div>
                                    <p className="total-pago">Total: <strong>{reserva.total}€</strong></p>
                                </div>
                                <button
                                    className="btn-cancelar"
                                    onClick={() => handleCancelar(reserva.id)}
                                >
                                    Cancelar Reserva
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MisReservasPage;