import React from 'react';

/**
 * Elemento individual clickeable en la lista de concesiones/órdenes
 * @param {Object} elemento - Elemento a mostrar (concesión u orden)
 * @param {Function} onClick - Callback cuando se hace click en el elemento
 */
const ElementoLista = ({ elemento, onClick }) => {
  const esOrden = elemento.tipo === 'orden_exploracion';
  const nombreElemento = esOrden ? elemento.nombre : elemento.nombre_lote;
  const titular = esOrden ? elemento.a_favor : elemento.titular;
  
  const claseEstado = esOrden 
    ? 'orden' 
    : elemento.estado === 'Vigente' ? 'vigente' : 'no-vigente';

  return (
    <div onClick={onClick} className="concesion-item">
      <div className="concesion-name">
        <span className={`concesion-status-dot ${claseEstado}`} />
        {nombreElemento}
      </div>
      <div className="concesion-titular">
        {titular}
      </div>
      <div className="concesion-details">
        <span>{elemento.municipio}</span>
        <span className="detail-separator">•</span>
        <span>{elemento.superficie} ha</span>
        {esOrden && (
          <>
            <span className="detail-separator">•</span>
            <span className="orden-badge-small">OE</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ElementoLista;