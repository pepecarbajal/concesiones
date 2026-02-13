import React from 'react';

const BotonesMovil = ({
  panelVisible,
  filtersVisible,
  onTogglePanel,
  onToggleFiltros
}) => {
  return (
    <div className="mobile-toggle-buttons">
      <button
        className={`btn-toggle-panel ${panelVisible ? 'active' : ''}`}
        onClick={onTogglePanel}
        aria-label={panelVisible ? 'Cerrar panel de información' : 'Abrir panel de información'}
      >
        <IconoTogglePanel visible={panelVisible} />
        <span>{panelVisible ? 'Cerrar' : 'Información'}</span>
      </button>

      <button
        className={`btn-toggle-filters ${filtersVisible ? 'active' : ''}`}
        onClick={onToggleFiltros}
        aria-label={filtersVisible ? 'Cerrar filtros' : 'Abrir filtros'}
      >
        <IconoToggleFiltros visible={filtersVisible} />
        <span>{filtersVisible ? 'Cerrar' : 'Filtros'}</span>
      </button>
    </div>
  );
};

/**
 * Icono para el botón de toggle del panel
 */
const IconoTogglePanel = ({ visible }) => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {visible ? (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ) : (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </>
    )}
  </svg>
);

/**
 * Icono para el botón de toggle de filtros
 */
const IconoToggleFiltros = ({ visible }) => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {visible ? (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ) : (
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    )}
  </svg>
);

export default BotonesMovil;