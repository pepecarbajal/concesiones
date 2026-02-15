import React, { memo } from 'react';

/**
 * Componente para seleccionar el tipo de elementos a visualizar
 * (Concesiones, Órdenes de Exploración, o Ambos)
 */
const SelectorTipoElemento = memo(({ 
  tipoSeleccionado, 
  onCambiarTipo,
  totalConcesiones,
  totalOrdenes
}) => {
  return (
    <div className="tipo-selector-container">
      <div className="tipo-selector-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="tipo-selector-title">Tipo de Elemento</span>
      </div>
      
      <div className="tipo-selector-options">
        <button
          onClick={() => onCambiarTipo('todos')}
          className={`tipo-option ${tipoSeleccionado === 'todos' ? 'active' : ''}`}
          title={`${totalConcesiones + totalOrdenes} elementos en total`}
        >
          <span className="tipo-option-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </span>
          <div className="tipo-option-content">
            <span className="tipo-option-label">Todos</span>
            <span className="tipo-option-count">{totalConcesiones + totalOrdenes}</span>
          </div>
        </button>

        <button
          onClick={() => onCambiarTipo('concesiones')}
          className={`tipo-option ${tipoSeleccionado === 'concesiones' ? 'active' : ''}`}
          title={`${totalConcesiones} concesiones mineras`}
        >
          <span className="tipo-option-icon tipo-icon-concesion">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </span>
          <div className="tipo-option-content">
            <span className="tipo-option-label">Concesiones</span>
            <span className="tipo-option-count">{totalConcesiones}</span>
          </div>
        </button>

        <button
          onClick={() => onCambiarTipo('ordenes')}
          className={`tipo-option ${tipoSeleccionado === 'ordenes' ? 'active' : ''}`}
          title={`${totalOrdenes} órdenes de exploración`}
        >
          <span className="tipo-option-icon tipo-icon-orden">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </span>
          <div className="tipo-option-content">
            <span className="tipo-option-label">Órdenes</span>
            <span className="tipo-option-count">{totalOrdenes}</span>
          </div>
        </button>
      </div>
    </div>
  );
});

SelectorTipoElemento.displayName = 'SelectorTipoElemento';

export default SelectorTipoElemento;    