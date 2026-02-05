import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Swal from 'sweetalert2';
import '../styles/MisReservas.css';

const MisReservasPage = () => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reservasData, userData] = await Promise.all([
                    apiService.getMisReservas(),
                    apiService.getMe()
                ]);
                setReservas(reservasData.reservas || []);
                setUserName(userData.nombre || 'Usuario');
            } catch (err) {
                setError(err.message || 'Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCancelar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'Volver',
            customClass: {
                popup: 'swal2-popup-custom',
                title: 'swal2-title-custom',
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom'
            }
        });

        if (result.isConfirmed) {
            try {
                await apiService.cancelarReserva(id);
                setReservas(reservas.filter(r => r.id !== id));
                Swal.fire({
                    title: 'Cancelada',
                    text: 'Tu reserva ha sido eliminada.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: 'swal2-popup-custom', title: 'swal2-title-custom' }
                });
            } catch (err) {
                Swal.fire('Error', err.message, 'error');
            }
        }
    };

    if (loading) return <div className="reservas-page"><div className="loading">Cargando...</div></div>;

    return (
        <div className="reservas-page">
            <header className="main-app-header">
                <Link to="/dashboard" className="header-logo">
                    PADEL<span>APP</span>
                    <span className="separator">/</span>
                    <span className="user-name">{userName}</span>
                </Link>
                <nav className="header-nav">
                    <button className="logout-button-circle" onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                    }}>✕</button>
                </nav>
            </header>

            <div className="reservas-container">
                <h1 className="page-title">Mis <span>Reservas</span></h1>

                {error && <div className="error-message">{error}</div>}

                <div className="reservas-grid">
                    {reservas.length === 0 ? (
                        <div className="no-reservas">
                            <div className="empty-icon">🎾</div>
                            <p>Aún no tienes reservas realizadas.</p>
                            <Link to="/dashboard" className="btn-primary-reservas">Reservar ahora</Link>
                        </div>
                    ) : (
                        reservas.map(reserva => (
                            <div key={reserva.id} className="reserva-card">
                                <div className="reserva-body">
                                    <div className="reserva-header-card">
                                        <h3>{reserva.pista_nombre}</h3>
                                        <span className="reserva-status-tag">Confirmada</span>
                                    </div>
                                    <p className="reserva-date">📅 {reserva.fecha}</p>
                                    <div className="reserva-horarios">
                                        {reserva.horarios.map((h, index) => (
                                            <span key={index} className="tag-horario">{h.franja}</span>
                                        ))}
                                    </div>
                                    <div className="reserva-footer">
                                        <div className="total-wrapper">
                                            <span className="total-label">Pago total</span>
                                            <span className="reserva-total">{reserva.total}€</span>
                                        </div>
                                        <button
                                            className="cancel-btn"
                                            onClick={() => handleCancelar(reserva.id)}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MisReservasPage;