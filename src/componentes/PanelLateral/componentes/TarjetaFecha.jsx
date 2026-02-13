import React from 'react';

/**
 * Tarjeta para mostrar fechas con icono representativo
 * @param {string} icono - Tipo de icono ('calendar', 'start', 'end')
 * @param {string} etiqueta - Etiqueta de la fecha
 * @param {string} valor - Valor de la fecha
 */
const TarjetaFecha = ({ icono, etiqueta, valor }) => {
  const obtenerIcono = () => {
    switch (icono) {
      case 'calendar':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'start':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      case 'end':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="date-card">
      <span className="date-icon">{obtenerIcono()}</span>
      <div className="date-info">
        <div className="date-label">{etiqueta}</div>
        <div className="date-value">{valor}</div>
      </div>
    </div>
  );
};

export default TarjetaFecha;