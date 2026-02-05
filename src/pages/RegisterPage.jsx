import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { getRandomBackground } from '../utils/backgrounds';
import '../styles/AuthForm.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [bgImage, setBgImage] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const randomImg = getRandomBackground('register');
        setBgImage(randomImg);
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("¡Las contraseñas no coinciden!");
            return;
        }

        setLoading(true);
        try {
            await apiService.register({
                nombre: formData.nombre,
                email: formData.email,
                password: formData.password
            });
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Error al crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Link to="/" className="back-floating-btn" title="Volver al inicio">✕</Link>
            <div
                className="auth-visual-side"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="auth-visual-content">
                    <h2>Únete a la <br /><span className="highlight">Comunidad</span></h2>
                    <p>Accede a las mejores pistas de la ciudad y organiza tus partidos en segundos.</p>
                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-card">
                    <h1 className="auth-title">Crear <span>Cuenta</span></h1>
                    <p className="auth-subtitle">Solo te llevará un minuto empezar a jugar.</p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Nombre Completo</label>
                            <input
                                name="nombre"
                                type="text"
                                placeholder="Ej: Juan Lebrón"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Contraseña</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirmar Contraseña</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                placeholder="Repite tu contraseña"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'CREANDO CUENTA...' : 'REGISTRARME AHORA'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        ¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;