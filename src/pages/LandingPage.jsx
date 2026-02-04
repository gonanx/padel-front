import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRandomBackground } from '../utils/backgrounds';
import '../styles/Landing.css';

const Landing = () => {
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        const randomImg = getRandomBackground('landing');
        setBgImage(randomImg);
    }, []);

    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="logo">
                    PADEL<span>APP</span>
                </div>
            </nav>

            <section className="hero">
                <div className="hero-content">
                    <h1>
                        Reserva tu pista de <br />
                        <span className="highlight">Pádel</span>
                    </h1>
                    <p>
                        La forma más rápida y sencilla de organizar tus partidos.
                        Únete a la comunidad más grande de jugadores.
                    </p>

                    <div className="hero-actions">
                        <Link to="/registro" className="btn-hero" style={{textDecoration: 'none'}}>
                            Crear cuenta
                        </Link>
                        <Link to="/login" className="btn-outline" style={{textDecoration: 'none'}}>
                            Iniciar sesión
                        </Link>
                    </div>

                    <div className="micro-features">
                        <div className="micro-item"><span>✓</span> Sin comisiones</div>
                        <div className="micro-item"><span>✓</span> Confirmación instantánea</div>
                        <div className="micro-item"><span>✓</span> +20 Pistas</div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div
                        className="hero-image-wrapper"
                        style={{
                            backgroundImage: `url(${bgImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;