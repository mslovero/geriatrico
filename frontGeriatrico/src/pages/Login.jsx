import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                navigate('/');
            } else {
                setError('Credenciales incorrectas. Por favor, intente nuevamente.');
            }
        } catch (err) {
            setError('Ocurrió un error al intentar ingresar.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
            
            <div className="position-absolute rounded-circle bg-primary opacity-10" 
                 style={{ width: '600px', height: '600px', top: '-100px', right: '-100px', filter: 'blur(80px)', zIndex: 0 }}></div>
            <div className="position-absolute rounded-circle bg-info opacity-10" 
                 style={{ width: '400px', height: '400px', bottom: '-50px', left: '-50px', filter: 'blur(60px)', zIndex: 0 }}></div>

            <div className="card card-glass shadow-xl p-5 fade-in position-relative" style={{ maxWidth: '450px', width: '100%', zIndex: 1, border: '1px solid rgba(255,255,255,0.8)' }}>
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-gradient-primary text-white mb-3 shadow-lg" 
                         style={{ width: '80px', height: '80px' }}>
                        <i className="bi bi-hospital-fill" style={{ fontSize: '2.5rem' }}></i>
                    </div>
                    <h2 className="fw-bold text-gradient mb-1">Geriátrico Manager</h2>
                    <p className="text-muted small">Acceso al Sistema de Gestión</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="form-label small text-uppercase text-muted fw-bold">Correo Electrónico</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0 text-muted ps-3">
                                <i className="bi bi-envelope"></i>
                            </span>
                            <input
                                type="email"
                                className="form-control border-start-0 ps-2"
                                placeholder="nombre@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ height: '50px' }}
                            />
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="form-label small text-uppercase text-muted fw-bold">Contraseña</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0 text-muted ps-3">
                                <i className="bi bi-lock"></i>
                            </span>
                            <input
                                type="password"
                                className="form-control border-start-0 ps-2"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ height: '50px' }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger d-flex align-items-center small py-2 mb-4 border-0 shadow-sm" role="alert">
                            <i className="bi bi-exclamation-circle-fill me-2"></i>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 py-3 shadow-lg position-relative overflow-hidden"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        ) : (
                            <>
                                Ingresar al Sistema <i className="bi bi-arrow-right ms-2"></i>
                            </>
                        )}
                    </button>
                    
                    <div className="text-center mt-4">
                        <a href="#" className="small text-decoration-none text-muted hover-primary">
                            ¿Olvidó su contraseña?
                        </a>
                    </div>
                </form>
            </div>
            
            <div className="position-absolute bottom-0 w-100 text-center pb-3 text-muted small" style={{ zIndex: 1 }}>
                &copy; {new Date().getFullYear()} Geriátrico Manager. Todos los derechos reservados.
            </div>
        </div>
    );
}
