import { useState, useEffect } from 'react';
import { Sun, Moon } from 'react-bootstrap-icons';

/**
 * ThemeToggle - Componente para alternar entre modo claro y oscuro
 * Persiste la preferencia en localStorage y respeta las preferencias del sistema
 */
export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => {
    // Verificar si hay tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    
    // Si no, usar la preferencia del sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    // Aplicar tema al documento
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Solo cambiar automáticamente si no hay preferencia guardada
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`btn btn-light border-0 shadow-sm rounded-circle position-relative ${className}`}
      style={{ width: '40px', height: '40px' }}
      aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
      title={theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
    >
      {theme === 'light' ? (
        <Moon size={18} className="text-primary" />
      ) : (
        <Sun size={18} className="text-warning" />
      )}
    </button>
  );
}
