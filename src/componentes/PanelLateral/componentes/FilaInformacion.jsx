import React from 'react';

/**
 * Fila de información que muestra una etiqueta y su valor correspondiente
 * @param {string} etiqueta - Etiqueta descriptiva del dato
 * @param {string|number} valor - Valor a mostrar
 */
const FilaInformacion = ({ etiqueta, valor }) => (
  <div className="info-row">
    <div className="info-label">{etiqueta}</div>
    <div className="info-value">{valor || 'N/A'}</div>
  </div>
);

export default FilaInformacion;