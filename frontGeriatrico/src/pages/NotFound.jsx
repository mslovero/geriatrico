import React from 'react';
import { Link } from 'react-router-dom';
import { House, ExclamationTriangle } from 'react-bootstrap-icons';

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
      <div className="text-center">
        <div 
          className="mb-4 d-inline-block p-4 rounded-circle bg-white shadow-sm"
          style={{ width: '120px', height: '120px' }}
        >
          <ExclamationTriangle size={56} className="text-warning animate-bounce" />
        </div>
        
        <h1 className="display-1 fw-bold text-dark mb-2">404</h1>
        <h2 className="h4 text-muted mb-4 fw-normal">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </h2>
        
        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mt-5">
          <Link 
            to="/" 
            className="btn btn-primary btn-lg px-4 py-3 d-flex align-items-center justify-content-center gap-2 shadow-sm border-0"
            style={{ borderRadius: '12px' }}
          >
            <House size={20} />
            Volver al Inicio
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="btn btn-outline-secondary btn-lg px-4 py-3 shadow-none border-0"
            style={{ borderRadius: '12px' }}
          >
            Regresar
          </button>
        </div>
        
        <p className="mt-5 text-muted small">
          Sistema de Gestión Geriátrica &copy; {new Date().getFullYear()}
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .text-gradient {
          background: linear-gradient(45deg, #2563eb, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite ease-in-out;
        }
      `}} />
    </div>
  );
};

export default NotFound;
