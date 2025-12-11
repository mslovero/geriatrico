import React from 'react';

/**
 * Componente profesional para mostrar estados vacíos con ilustraciones sutiles
 * Uso: <EmptyState type="no-data" title="Sin datos" message="No hay información" />
 */
export default function EmptyState({ type = 'no-data', title, message, action }) {
  const illustrations = {
    'no-data': (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#f8f9fa" stroke="#dee2e6" strokeWidth="2"/>
        <path d="M70 90 L90 110 L130 70" stroke="#0d6efd" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.3"/>
        <circle cx="100" cy="100" r="50" fill="none" stroke="#dee2e6" strokeWidth="2" strokeDasharray="5,5"/>
        <foreignObject x="80" y="80" width="40" height="40">
            <div xmlns="http://www.w3.org/1999/xhtml" className="d-flex justify-content-center align-items-center h-100">
                <i className="bi bi-clipboard fs-1" style={{color: '#adb5bd'}}></i>
            </div>
        </foreignObject>
      </svg>
    ),
    'no-patients': (
      <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="110" cy="110" r="90" fill="#f0f8ff" opacity="0.5"/>
        <circle cx="110" cy="85" r="25" fill="#e3f2fd" stroke="#90caf9" strokeWidth="2"/>
        <path d="M70 150 Q110 130 150 150" fill="#e3f2fd" stroke="#90caf9" strokeWidth="2"/>
        <circle cx="110" cy="85" r="15" fill="#bbdefb"/>
        <foreignObject x="90" y="72" width="40" height="40">
            <div xmlns="http://www.w3.org/1999/xhtml" className="d-flex justify-content-center align-items-center h-100">
                <i className="bi bi-person fs-3" style={{color: '#64b5f6'}}></i>
            </div>
        </foreignObject>
      </svg>
    ),
    'no-stock': (
      <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="110" cy="110" r="90" fill="#fff8e1" opacity="0.5"/>
        <rect x="75" y="75" width="70" height="70" rx="8" fill="#fff3e0" stroke="#ffb74d" strokeWidth="2"/>
        <rect x="85" y="85" width="50" height="50" rx="4" fill="#ffe0b2" stroke="#ffa726" strokeWidth="1" strokeDasharray="3,3"/>
        <foreignObject x="90" y="95" width="40" height="40">
            <div xmlns="http://www.w3.org/1999/xhtml" className="d-flex justify-content-center align-items-center h-100">
                <i className="bi bi-box-seam fs-1" style={{color: '#ff9800'}}></i>
            </div>
        </foreignObject>
      </svg>
    ),
    'success': (
      <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="110" cy="110" r="90" fill="#e8f5e9" opacity="0.5"/>
        <circle cx="110" cy="110" r="60" fill="#c8e6c9" stroke="#66bb6a" strokeWidth="2"/>
        <path d="M85 110 L100 125 L135 90" stroke="#2e7d32" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <foreignObject x="90" y="150" width="40" height="40">
            <div xmlns="http://www.w3.org/1999/xhtml" className="d-flex justify-content-center align-items-center h-100">
                <i className="bi bi-check-lg" style={{color: '#388e3c', fontSize: '16px'}}></i>
            </div>
        </foreignObject>
      </svg>
    ),
    'medical-care': (
      <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="140" cy="140" r="120" fill="#f3e5f5" opacity="0.3"/>
        <circle cx="140" cy="120" r="35" fill="#e1bee7" stroke="#ba68c8" strokeWidth="2"/>
        <path d="M90 200 Q140 175 190 200" fill="#e1bee7" stroke="#ba68c8" strokeWidth="2"/>
        <rect x="125" y="90" width="30" height="10" rx="2" fill="#ab47bc"/>
        <rect x="135" y="80" width="10" height="30" rx="2" fill="#ab47bc"/>
        <circle cx="115" y="115" r="3" fill="#6a1b9a"/>
        <circle cx="165" y="115" r="3" fill="#6a1b9a"/>
        <path d="M125 130 Q140 135 155 130" stroke="#6a1b9a" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    'welcome': (
      <svg width="320" height="280" viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="160" cy="240" rx="140" ry="20" fill="#e3f2fd" opacity="0.4"/>
        <rect x="80" y="120" width="160" height="120" rx="8" fill="#f5f5f5" stroke="#90caf9" strokeWidth="2"/>
        <rect x="100" y="140" width="50" height="40" rx="4" fill="#e3f2fd" stroke="#64b5f6" strokeWidth="1"/>
        <rect x="170" y="140" width="50" height="40" rx="4" fill="#e3f2fd" stroke="#64b5f6" strokeWidth="1"/>
        <rect x="100" y="190" width="50" height="40" rx="4" fill="#e3f2fd" stroke="#64b5f6" strokeWidth="1"/>
        <rect x="170" y="190" width="50" height="40" rx="4" fill="#e3f2fd" stroke="#64b5f6" strokeWidth="1"/>
        <path d="M80 120 L160 60 L240 120" fill="#bbdefb" stroke="#42a5f5" strokeWidth="2"/>
        <circle cx="200" y="100" r="8" fill="#fff9c4" stroke="#ffd54f" strokeWidth="2"/>
        <rect x="145" y="180" width="30" height="50" rx="2" fill="#90caf9"/>
        <circle cx="160" cy="200" r="3" fill="#1976d2"/>
      </svg>
    )
  };

  return (
    <div className="text-center py-5 px-4">
      <div className="d-flex justify-content-center mb-4" style={{ opacity: 0.85 }}>
        {illustrations[type] || illustrations['no-data']}
      </div>
      {title && (
        <h5 className="fw-bold text-secondary mb-2">{title}</h5>
      )}
      {message && (
        <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
          {message}
        </p>
      )}
      {action}
    </div>
  );
}
