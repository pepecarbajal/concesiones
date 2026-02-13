/**
 * Descarga los datos filtrados en formato Excel
 * @param {Array} elementosFiltrados - Array de elementos a exportar
 * @param {string} regionSeleccionada - Región seleccionada (opcional)
 * @param {string} municipioSeleccionado - Municipio seleccionado (opcional)
 * @param {string} filtroAnio - Año filtrado (opcional)
 */
export const descargarExcel = async (
  elementosFiltrados,
  regionSeleccionada = '',
  municipioSeleccionado = '',
  filtroAnio = ''
) => {
  try {
    const XLSX = await import('xlsx');
    
    const datosParaExportar = elementosFiltrados.map(elemento => {
      if (elemento.tipo === 'orden_exploracion') {
        return convertirOrdenAFila(elemento);
      } else {
        return convertirConcesionAFila(elemento);
      }
    });
    
    const libroTrabajo = XLSX.utils.book_new();
    const hojaTrabajo = XLSX.utils.json_to_sheet(datosParaExportar);
    
    // Configurar anchos de columnas
    const anchosColumnas = [
      { wch: 20 }, { wch: 10 }, { wch: 25 }, { wch: 12 }, { wch: 18 },
      { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 35 }, { wch: 25 },
      { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 25 }, { wch: 12 }
    ];
    hojaTrabajo['!cols'] = anchosColumnas;
    
    XLSX.utils.book_append_sheet(libroTrabajo, hojaTrabajo, 'Datos Mineros');
    
    const nombreArchivo = generarNombreArchivo(
      regionSeleccionada,
      municipioSeleccionado,
      filtroAnio
    );
    
    XLSX.writeFile(libroTrabajo, nombreArchivo);
  } catch (error) {
    console.error('Error al generar el archivo Excel:', error);
    alert('Hubo un error al generar el archivo Excel. Por favor intente nuevamente.');
  }
};

/**
 * Convierte una orden de exploración a formato de fila para Excel
 * @param {Object} orden - Datos de la orden
 * @returns {Object} - Objeto con los datos formateados
 */
const convertirOrdenAFila = (orden) => {
  return {
    'Tipo': 'Orden de Exploración',
    'Nombre': orden.nombre || '',
    'Número de Orden': orden.num_orden || '',
    'Municipio': orden.municipio || '',
    'Estado': orden.estado || '',
    'Superficie (ha)': orden.superficie || '',
    'A Favor': orden.a_favor || '',
    'Publicación DOF': orden.publ_dof || '',
    'Coordenadas': orden.coords ? `${orden.coords[1].toFixed(6)}, ${orden.coords[0].toFixed(6)}` : ''
  };
};

/**
 * Convierte una concesión a formato de fila para Excel
 * @param {Object} concesion - Datos de la concesión
 * @returns {Object} - Objeto con los datos formateados
 */
const convertirConcesionAFila = (concesion) => {
  return {
    'Tipo': 'Concesión',
    'No.': concesion['No.'] || '',
    'Nombre del Lote': concesion.nombre_lote || '',
    'Titulo': concesion.titulo || '',
    'Fecha de Expedicion': concesion.fecha_expedicion || '',
    'Fecha de Inicio': concesion.fecha_inicio || '',
    'Fecha de Fin': concesion.fecha_fin || '',
    'Superficie (ha)': concesion.superficie || '',
    'Titular': concesion.titular || '',
    'Municipio': concesion.municipio || '',
    'Region': concesion.region || '',
    'Latitud': concesion.latitud || '',
    'Longitud': concesion.longitud || '',
    'Coordenadas Decimales': concesion.coords ? `${concesion.coords[1].toFixed(6)}, ${concesion.coords[0].toFixed(6)}` : '',
    'Estado': concesion.estado || ''
  };
};

/**
 * Genera el nombre del archivo Excel basado en los filtros aplicados
 * @param {string} region - Región seleccionada
 * @param {string} municipio - Municipio seleccionado
 * @param {string} anio - Año filtrado
 * @returns {string} - Nombre del archivo
 */
const generarNombreArchivo = (region, municipio, anio) => {
  let nombre = 'Concesiones_y_Ordenes_Mineras';
  
  if (region) nombre += `_${region}`;
  if (municipio) nombre += `_${municipio}`;
  if (anio) nombre += `_${anio}`;
  
  return `${nombre}.xlsx`;
};