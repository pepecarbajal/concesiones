import React from 'react';

/**
 * Controles de navegación para moverse entre elementos (anterior/siguiente)
 * @param {number} indiceActual - Índice del elemento actual
 * @param {number} totalElementos - Total de elementos disponibles
 * @param {Function} onAnterior - Callback para navegar al elemento anterior
 * @param {Function} onSiguiente - Callback para navegar al elemento siguiente
 * @param {boolean} deshabilitado - Si los controles están deshabilitados
 */
const ControlesNavegacion = ({
  indiceActual,
  totalElementos,
  onAnterior,
  onSiguiente,
  deshabilitado
}) => (
  <div className="navigation-controls">
    <button
      onClick={onAnterior}
      disabled={deshabilitado}
      className="btn-nav"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Anterior
    </button>
    
    <span className="navigation-counter">
      {indiceActual + 1} / {totalElementos}
    </span>
    
    <button
      onClick={onSiguiente}
      disabled={deshabilitado}
      className="btn-nav"
    >
      Siguiente
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  </div>
);

export default ControlesNavegacion;