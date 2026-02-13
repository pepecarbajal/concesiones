import React from 'react';

/**
 * Tarjeta para mostrar estadísticas con icono
 * @param {string} icono - Tipo de icono ('chart', 'building', 'check', 'area')
 * @param {string} etiqueta - Etiqueta de la estadística
 * @param {string|number} valor - Valor de la estadística
 * @param {string} color - Clase CSS para el color
 * @param {boolean} pequeno - Si el texto debe ser más pequeño
 */
const TarjetaEstadistica = ({ icono, etiqueta, valor, color, pequeno }) => {
  const obtenerIcono = () => {
    switch (icono) {
      case 'chart':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
      case 'building':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#764ba2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <line x1="9" y1="6" x2="9" y2="6.01" />
            <line x1="15" y1="6" x2="15" y2="6.01" />
            <line x1="9" y1="10" x2="9" y2="10.01" />
            <line x1="15" y1="10" x2="15" y2="10.01" />
            <line x1="9" y1="14" x2="9" y2="14.01" />
            <line x1="15" y1="14" x2="15" y2="14.01" />
            <path d="M9 18h6" />
          </svg>
        );
      case 'check':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'area':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="stat-card">
      <div className="stat-icon">{obtenerIcono()}</div>
      <div className="stat-label">{etiqueta}</div>
      <div className={`stat-value ${pequeno ? 'small' : ''} ${color}`}>
        {valor}
      </div>
    </div>
  );
};

export default TarjetaEstadistica;