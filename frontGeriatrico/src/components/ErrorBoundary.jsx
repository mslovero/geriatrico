import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar estado para que el siguiente renderizado muestre la UI de respaldo
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Registrar el error en un servicio de logging
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Aquí podrías enviar el error a un servicio como Sentry
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Recargar la página como último recurso
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>

            <h1>Algo salió mal</h1>
            <p className="error-message">
              Lo sentimos, ocurrió un error inesperado en la aplicación.
            </p>

            <div className="error-actions">
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
              >
                Volver al inicio
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-outline-secondary"
              >
                Recargar página
              </button>
            </div>

            {/* Mostrar detalles del error solo en desarrollo */}
            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Detalles técnicos (solo visible en desarrollo)</summary>
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre>{this.state.error.toString()}</pre>

                  {this.state.errorInfo && (
                    <>
                      <h4>Stack trace:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>

          <style>{`
            .error-boundary-container {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .error-boundary-content {
              background: white;
              border-radius: 16px;
              padding: 3rem;
              max-width: 600px;
              width: 100%;
              text-align: center;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }

            .error-icon {
              color: #dc3545;
              margin-bottom: 1.5rem;
              animation: shake 0.5s ease-in-out;
            }

            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-10px); }
              75% { transform: translateX(10px); }
            }

            .error-boundary-content h1 {
              font-size: 2rem;
              color: #212529;
              margin-bottom: 1rem;
              font-weight: 700;
            }

            .error-message {
              color: #6c757d;
              font-size: 1.1rem;
              margin-bottom: 2rem;
              line-height: 1.6;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
            }

            .error-actions button {
              padding: 0.75rem 1.5rem;
              font-size: 1rem;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.3s ease;
              border: none;
              font-weight: 500;
            }

            .btn-primary {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }

            .btn-primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            }

            .btn-outline-secondary {
              background: white;
              color: #6c757d;
              border: 2px solid #dee2e6;
            }

            .btn-outline-secondary:hover {
              background: #f8f9fa;
              border-color: #adb5bd;
            }

            .error-details {
              margin-top: 2rem;
              text-align: left;
              background: #f8f9fa;
              border-radius: 8px;
              padding: 1rem;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #495057;
              padding: 0.5rem;
              user-select: none;
            }

            .error-details summary:hover {
              color: #212529;
            }

            .error-stack {
              margin-top: 1rem;
              max-height: 300px;
              overflow-y: auto;
            }

            .error-stack h4 {
              font-size: 0.9rem;
              color: #6c757d;
              margin-top: 1rem;
              margin-bottom: 0.5rem;
            }

            .error-stack pre {
              background: white;
              padding: 1rem;
              border-radius: 4px;
              font-size: 0.85rem;
              color: #dc3545;
              overflow-x: auto;
              border: 1px solid #dee2e6;
              white-space: pre-wrap;
              word-wrap: break-word;
            }

            @media (max-width: 768px) {
              .error-boundary-content {
                padding: 2rem;
              }

              .error-boundary-content h1 {
                font-size: 1.5rem;
              }

              .error-actions {
                flex-direction: column;
              }

              .error-actions button {
                width: 100%;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
