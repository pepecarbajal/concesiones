/**
 * Crea el contenido HTML para el popup de coordenadas
 * @param {Object} elemento - Elemento (concesión u orden de exploración)
 * @returns {string} - HTML del contenido del popup
 */
export const crearContenidoPopup = (elemento) => {
  const esOrden = elemento.tipo === 'orden_exploracion';
  const colorBorde = esOrden ? '#FFA500' : '#667eea';
  
  return `
    <div style="
      padding: 12px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      min-width: 250px;
    ">
      <div style="
        font-size: 13px;
        font-weight: 700;
        color: #1F2937;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 2px solid ${colorBorde};
      ">
        ${esOrden ? elemento.nombre : elemento.nombre_lote}
      </div>
      ${esOrden 
        ? crearContenidoOrdenExploracion(elemento)
        : crearContenidoConcesion(elemento)
      }
    </div>
  `;
};

/**
 * Crea el contenido específico para una orden de exploración
 * @param {Object} orden - Datos de la orden de exploración
 * @returns {string} - HTML del contenido
 */
const crearContenidoOrdenExploracion = (orden) => {
  return `
    <div style="font-size: 12px; color: #6B7280; margin-bottom: 10px;">
      <strong>Orden de Exploración</strong>
    </div>
    <div style="font-size: 12px; color: #6B7280; margin-bottom: 10px;">
      <strong>Coordenadas DMS:</strong>
    </div>
    <div style="font-size: 11px; color: #374151; line-height: 1.6; margin-bottom: 8px;">
      <div>Latitud: ${orden.latitud}</div>
      <div>Longitud: ${orden.longitud}</div>
    </div>
    <div style="font-size: 12px; color: #6B7280; margin-bottom: 6px;">
      <strong>Coordenadas Decimales:</strong>
    </div>
    <div style="font-size: 11px; color: #374151; line-height: 1.6; margin-bottom: 8px;">
      <div>${orden.coords[1].toFixed(6)}, ${orden.coords[0].toFixed(6)}</div>
    </div>
    <div style="font-size: 11px; color: #374151; line-height: 1.6;">
      <div>Municipio: ${orden.municipio}</div>
      <div>Superficie: ${orden.superficie} ha</div>
    </div>
  `;
};

/**
 * Crea el contenido específico para una concesión
 * @param {Object} concesion - Datos de la concesión
 * @returns {string} - HTML del contenido
 */
const crearContenidoConcesion = (concesion) => {
  return `
    <div style="font-size: 12px; color: #6B7280; margin-bottom: 10px;">
      <strong>Coordenadas DMS:</strong>
    </div>
    <div style="font-size: 11px; color: #374151; line-height: 1.6; margin-bottom: 8px;">
      <div>Latitud: ${concesion.latitud}</div>
      <div>Longitud: ${concesion.longitud}</div>
    </div>
    <div style="font-size: 12px; color: #6B7280; margin-bottom: 6px;">
      <strong>Coordenadas Decimales:</strong>
    </div>
    <div style="font-size: 11px; color: #374151; line-height: 1.6;">
      <div>${concesion.coords[1].toFixed(6)}, ${concesion.coords[0].toFixed(6)}</div>
    </div>
  `;
};