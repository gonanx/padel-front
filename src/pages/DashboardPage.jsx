import { useEffect, useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Swal from 'sweetalert2';
import '../styles/Dashboard.css';

const formatUserName = (name) => {
    if (!name) return "";
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const PistaCard = ({ pista, isSelected, onSelect }) => {
    const [currentImg, setCurrentImg] = useState(0);
    const fotos = (pista.fotos && pista.fotos.length > 0) ? pista.fotos : [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=500',
        'https://images.unsplash.com/photo-1593114051523-2895f366b445?q=80&w=500',
        'https://images.unsplash.com/photo-1554062614-69021c38cc9b?q=80&w=500'
    ];

    const nextImg = (e) => {
        e.stopPropagation();
        setCurrentImg((prev) => (prev + 1) % fotos.length);
    };

    const prevImg = (e) => {
        e.stopPropagation();
        setCurrentImg((prev) => (prev - 1 + fotos.length) % fotos.length);
    };

    return (
        <div className={`pista-premium-card ${isSelected ? 'active' : ''}`} onClick={() => onSelect(pista)}>
            <div className="carousel-container">
                <div className="carousel-image" style={{ backgroundImage: `url(${fotos[currentImg]})` }}>
                    <button className="carousel-btn prev" onClick={prevImg} type="button">‹</button>
                    <button className="carousel-btn next" onClick={nextImg} type="button">›</button>
                </div>
                <div className="carousel-dots">
                    {fotos.map((_, i) => (
                        <span key={i} className={`dot ${i === currentImg ? 'active' : ''}`} />
                    ))}
                </div>
            </div>
            <div className="pista-info">
                <h3>{pista.nombre}</h3>
                <div className="pista-badges">
                    <span>{pista.cubierta ? 'CUBIERTA' : 'EXTERIOR'}</span>
                    <span className="price-tag">{pista.precio_base}€/H</span>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pistas, setPistas] = useState([]);
    const [pistaSeleccionada, setPistaSeleccionada] = useState(null);
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const [resumenPrecio, setResumenPrecio] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) { setLoading(false); return; }

        Promise.all([apiService.getMe(), apiService.getPistas()])
            .then(([userData, pistasData]) => {
                setUser(userData);
                setPistas(pistasData.pistas || []);
                setLoading(false);
            })
            .catch(() => {
                apiService.logout();
                navigate('/');
            });
    }, [token, navigate]);

    useEffect(() => {
        if (pistaSeleccionada && fecha) {
            setSeleccionados([]);
            apiService.getDisponibilidadPista(pistaSeleccionada.id, fecha)
                .then(data => setHorariosDisponibles(data.disponibilidades || []))
                .catch(() => {
                    Swal.fire('Error', 'No se pudieron cargar los horarios', 'error');
                });
        }
    }, [pistaSeleccionada, fecha]);

    useEffect(() => {
        if (seleccionados.length > 0 && pistaSeleccionada) {
            apiService.calcularPrecio(pistaSeleccionada.id, fecha, seleccionados)
                .then(data => setResumenPrecio(data))
                .catch(() => setResumenPrecio(null));
        } else {
            setResumenPrecio(null);
        }
    }, [seleccionados, pistaSeleccionada, fecha]);

    const handleConfirmarReserva = async () => {
        if (seleccionados.length === 0) return;

        Swal.fire({
            title: 'Procesando...',
            text: 'Estamos confirmando tu pista',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            await apiService.reservar(pistaSeleccionada.id, fecha, seleccionados);

            Swal.fire({
                icon: 'success',
                title: '¡Pista Reservada!',
                text: `Has completado tu reserva para ${pistaSeleccionada.nombre}.`,
                showCancelButton: true,
                confirmButtonText: 'Ver mis reservas',
                cancelButtonText: 'Seguir aquí',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#6c757d',
                reverseButtons: true,
                customClass: {
                    popup: 'swal2-popup-custom',
                    title: 'swal2-title-custom',
                    confirmButton: 'swal2-confirm-custom',
                    cancelButton: 'swal2-cancel-custom'
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/mis-reservas');
                } else {
                    setSeleccionados([]);
                    apiService.getDisponibilidadPista(pistaSeleccionada.id, fecha)
                        .then(data => setHorariosDisponibles(data.disponibilidades || []));
                }
            });

        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error al reservar',
                text: err.message || 'El horario ya no está disponible.',
            });
        }
    };

    const handleLogout = () => {
        apiService.logout();
        navigate('/');
    };

    if (!token) return <Navigate to="/landing" replace />;
    if (loading) return <div className="loading">CONECTANDO AL SISTEMA...</div>;

    return (
        <div className="dashboard-container">
            <header className="main-app-header">
                <Link to="/dashboard" className="header-logo">
                    PADEL<span>APP</span> <span className="separator">|</span> <span className="user-name">{formatUserName(user?.nombre)}</span>
                </Link>
                <div className="header-nav">
                    <button className="nav-link-btn" onClick={() => navigate('/mis-reservas')}>MIS RESERVAS</button>
                    {user?.rol === 'Administrador' && (
                        <button className="admin-link-btn" onClick={() => navigate('/admin')}>ADMIN</button>
                    )}
                    <button className="logout-button-circle" onClick={handleLogout} title="Cerrar sesión">✕</button>
                </div>
            </header>

            <main className="booking-main">
                <div className="booking-content">
                    <section className="booking-section">
                        <label className="section-title">1. Selecciona tu Pista</label>
                        <div className="pistas-premium-grid">
                            {pistas.map(p => (
                                <PistaCard
                                    key={p.id}
                                    pista={p}
                                    isSelected={pistaSeleccionada?.id === p.id}
                                    onSelect={setPistaSeleccionada}
                                />
                            ))}
                        </div>

                        <label className="section-title">2. Fecha y Horarios</label>
                        <div className="controls-flex">
                            <input
                                type="date"
                                value={fecha}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setFecha(e.target.value)}
                                className="date-input-premium"
                            />
                        </div>

                        {!pistaSeleccionada ? (
                            <div className="empty-horarios">Selecciona una pista para ver la disponibilidad</div>
                        ) : (
                            <div className="horarios-grid">
                                {horariosDisponibles.map(h => (
                                    <button
                                        key={h.id}
                                        className={`time-slot ${seleccionados.includes(h.id) ? 'selected' : ''}`}
                                        onClick={() => setSeleccionados(prev =>
                                            prev.includes(h.id) ? prev.filter(x => x !== h.id) : [...prev, h.id]
                                        )}
                                    >
                                        {h.franja}
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <aside className={`summary-container ${resumenPrecio ? 'active' : ''}`}>
                    <div className="summary-card">
                        {resumenPrecio ? (
                            <div className="summary-layout">
                                <div className="summary-info">
                                    <h3>Resumen</h3>
                                    <p className="mobile-hide"><strong>{pistaSeleccionada?.nombre}</strong></p>
                                    <p className="mobile-hide">{fecha}</p>
                                    {resumenPrecio.extra_aplicado && (
                                        <p className="extra-badge">{resumenPrecio.extra_aplicado.nombre}</p>
                                    )}
                                </div>
                                <div className="summary-action">
                                    <div className="price-display">
                                        <span className="total-amount">{resumenPrecio.total_precio}€</span>
                                    </div>
                                    <button className="confirm-btn" onClick={handleConfirmarReserva}>RESERVAR AHORA</button>
                                </div>
                            </div>
                        ) : (
                            <div className="summary-empty">
                                <p>Selecciona pista y horario para continuar</p>
                            </div>
                        )}
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default Dashboard;