import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { getRandomBackground } from '../utils/backgrounds';
import '../styles/AuthForm.css';


const LoginPage = () => {
    const [bgImage, setBgImage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const randomImg = getRandomBackground('login');
        setBgImage(randomImg);
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await apiService.login({ email, password });
            console.log("Login exitoso");
            navigate('/dashboard');
            window.location.reload();
        } catch (err) {
            setError(err.message || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="auth-container">
            {/* BOTÓN FLOTANTE PARA VOLVER */}
            <Link to="/" className="back-floating-btn" title="Volver al inicio">
                ✕
            </Link>


            {/* LADO VISUAL: Fondo dinámico */}
            <div
                className="auth-visual-side"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="auth-visual-content">
                    <h2>Vuelve a la <br /><span className="highlight">Pista</span></h2>
                    <p>Tus compañeros te esperan. Entra y reserva tu próximo partido.</p>
                </div>
            </div>


            {/* LADO DEL FORMULARIO */}
            <div className="auth-form-side">
                <div className="auth-card">
                    <h1 className="auth-title">Iniciar <span>Sesión</span></h1>
                    <p className="auth-subtitle">¡Qué bueno verte de nuevo!</p>


                    {error && <div className="error-message">{error}</div>}


                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="usuario@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Contraseña</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'CONECTANDO...' : 'ENTRAR A JUGAR'}
                        </button>
                    </form>


                    <p className="auth-footer">
                        ¿Aún no juegas? <Link to="/registro" className="auth-link">Regístrate gratis</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};


export default LoginPage;