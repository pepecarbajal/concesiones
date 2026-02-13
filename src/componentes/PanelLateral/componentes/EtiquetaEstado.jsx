import React from 'react';

/**
 * Etiqueta que muestra el estado de un elemento (Vigente, No Vigente, Orden de Exploración)
 * @param {Object} elemento - Elemento a mostrar (concesión u orden)
 */
const EtiquetaEstado = ({ elemento }) => {
  const esOrden = elemento.tipo === 'orden_exploracion';
  
  if (esOrden) {
    return (
      <div className="status-badge orden-badge">
        <span className="status-dot">●</span>
        Orden de Exploración
      </div>
    );
  }
  
  const esVigente = elemento.estado === 'Vigente';
  return (
    <div className={`status-badge ${esVigente ? 'vigente' : 'no-vigente'}`}>
      <span className="status-dot">●</span>
      {elemento.estado || 'N/A'}
    </div>
  );
};

export default EtiquetaEstado;