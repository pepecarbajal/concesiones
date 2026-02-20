import React, { memo } from 'react';

/**
 * Componente para seleccionar el tipo de elementos a visualizar
 * Versión horizontal integrada en el header superior
 */
const SelectorTipoElemento = memo(({ 
  tipoSeleccionado, 
  onCambiarTipo,
  totalConcesiones,
  totalOrdenes
}) => {
  return (
    <div className="tipo-selector-inline">
      <button
        onClick={() => onCambiarTipo('concesiones')}
        className={`tipo-option-inline ${tipoSeleccionado === 'concesiones' ? 'active' : ''}`}
        title={`${totalConcesiones} concesiones mineras`}
      >
        <span className="tipo-option-inline-icon concesion-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </span>
        <span className="tipo-option-inline-label">Concesiones</span>
        <span className="tipo-option-inline-count">{totalConcesiones}</span>
      </button>

      <button
        onClick={() => onCambiarTipo('ordenes')}
        className={`tipo-option-inline ${tipoSeleccionado === 'ordenes' ? 'active' : ''}`}
        title={`${totalOrdenes} órdenes de exploración`}
      >
        <span className="tipo-option-inline-icon orden-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </span>
        <span className="tipo-option-inline-label">Órdenes</span>
        <span className="tipo-option-inline-count">{totalOrdenes}</span>
      </button>
    </div>
  );
});

SelectorTipoElemento.displayName = 'SelectorTipoElemento';

export default SelectorTipoElemento;