import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Swal from 'sweetalert2';
import '../styles/MisReservas.css';


const formatUserName = (name) => {
    if (!name) return "";
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};


const MisReservas = () => {
    const [reservas, setReservas] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    const cargarDatos = async () => {
        try {
            const [userData, reservasData] = await Promise.all([
                apiService.getMe(),
                apiService.getMisReservas()
            ]);
            setUser(userData);
            setReservas(reservasData.reservas || []);
        } catch (err) {
            Swal.fire({
                title: 'ERROR DE CONEXIÓN',
                text: 'No pudimos obtener tus datos del servidor',
                icon: 'error',
                background: '#141414',
                color: '#fff',
                confirmButtonColor: '#8ce600',
                customClass: {
                    popup: 'swal2-popup-custom',
                    title: 'swal2-title-custom',
                    confirmButton: 'swal2-confirm-custom'
                }
            });
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        cargarDatos();
    }, []);


    const handleCancelar = (reservaId) => {
        Swal.fire({
            title: '¿CONFIRMAS LA CANCELACIÓN?',
            text: "Esta acción liberará la pista inmediatamente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'SÍ, CANCELAR',
            cancelButtonText: 'MANTENER RESERVA',
            reverseButtons: true,
            background: '#141414',
            color: '#fff',
            customClass: {
                popup: 'swal2-popup-custom',
                title: 'swal2-title-custom',
                confirmButton: 'swal2-confirm-custom',
                cancelButton: 'swal2-cancel-custom'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await apiService.cancelarReserva(reservaId);
                    Swal.fire({
                        title: 'RESERVA CANCELADA',
                        text: 'La pista ha sido liberada con éxito.',
                        icon: 'success',
                        background: '#141414',
                        color: '#fff',
                        confirmButtonText: 'ENTENDIDO',
                        customClass: {
                            popup: 'swal2-popup-custom',
                            title: 'swal2-title-custom',
                            confirmButton: 'swal2-confirm-custom'
                        }
                    });
                    cargarDatos();
                } catch (err) {
                    Swal.fire({
                        title: 'NO SE PUDO CANCELAR',
                        text: err.message,
                        icon: 'error',
                        background: '#141414',
                        color: '#fff',
                        customClass: {
                            popup: 'swal2-popup-custom',
                            title: 'swal2-title-custom',
                            confirmButton: 'swal2-confirm-custom'
                        }
                    });
                }
            }
        });
    };


    const handleLogout = () => {
        apiService.logout();
        navigate('/');
    };


    if (loading) return <div className="loading">Cargando tus reservas...</div>;


    return (
        <div className="reservas-page">
            <header className="main-app-header">
                <Link to="/dashboard" className="header-logo">
                    PADEL<span>APP</span> <span className="separator">|</span> <span className="user-name">{formatUserName(user?.nombre)}</span>
                </Link>
                <div className="header-nav">
                    <button className="logout-button-circle" onClick={handleLogout} title="Cerrar sesión">✕</button>
                </div>
            </header>


            <div className="reservas-container">
                <h2 className="page-title">Tu historial de <span>Reservas</span></h2>


                {reservas.length === 0 ? (
                    <div className="no-reservas">
                        <div className="empty-icon">🎾</div>
                        <p>Aún no tienes ninguna reserva confirmada.</p>
                        <button className="btn-primary-reservas" onClick={() => navigate('/dashboard')}>
                            Reservar mi primera pista
                        </button>
                    </div>
                ) : (
                    <div className="reservas-grid">
                        {reservas.map((res) => (
                            <div key={res.id} className="reserva-card">
                                <div className="reserva-body">
                                    <div className="reserva-header-card">
                                        <h3>{res.pista_nombre}</h3>
                                        <span className="reserva-status-tag">Confirmada</span>
                                    </div>
                                    <p className="reserva-date"><span>📅</span> {res.fecha}</p>
                                    <div className="reserva-horarios">
                                        {res.horarios.map((h, index) => (
                                            <span key={index} className="tag-horario">{h.franja}</span>
                                        ))}
                                    </div>
                                    <div className="reserva-footer">
                                        <div className="total-wrapper">
                                            <span className="total-label">Total</span>
                                            <span className="reserva-total">{res.total}€</span>
                                        </div>
                                        <button
                                            className="cancel-btn"
                                            onClick={() => handleCancelar(res.id)}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
