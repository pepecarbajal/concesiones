import mapboxgl from 'mapbox-gl';
import { COLORES_ESTADO } from '../../../utilidades/constantes';

/**
 * Agrega una capa de polígonos al mapa para las órdenes de exploración
 * @param {Object} mapa - Instancia del mapa de Mapbox
 * @param {Array} ordenes - Array de órdenes de exploración con coordenadas de polígono
 */
export const agregarCapaPoligonos = (mapa, ordenes) => {
  if (!mapa) return;
  
  // Filtrar solo las órdenes que tienen coordenadas de polígono
  const ordenesConPoligono = ordenes.filter(o => 
    o.tipo === 'orden_exploracion' && 
    o.coordenadasPoligono && 
    o.coordenadasPoligono.length > 0
  );
  
  if (ordenesConPoligono.length === 0) return;
  
  // Crear GeoJSON con todos los polígonos
  const geojson = {
    type: 'FeatureCollection',
    features: ordenesConPoligono.map(orden => ({
      type: 'Feature',
      properties: {
        nombre: orden.nombre,
        num_orden: orden.num_orden,
        superficie: orden.superficie,
        municipio: orden.municipio,
        a_favor: orden.a_favor,
        publ_dof: orden.publ_dof,
        estado: orden.estado
      },
      geometry: {
        type: 'Polygon',
        coordinates: [orden.coordenadasPoligono]
      }
    }))
  };
  
  // Remover capas existentes si existen
  if (mapa.getLayer('ordenes-poligonos-relleno')) {
    mapa.removeLayer('ordenes-poligonos-relleno');
  }
  if (mapa.getLayer('ordenes-poligonos-borde')) {
    mapa.removeLayer('ordenes-poligonos-borde');
  }
  if (mapa.getSource('ordenes-poligonos')) {
    mapa.removeSource('ordenes-poligonos');
  }
  
  // Agregar fuente de datos
  mapa.addSource('ordenes-poligonos', {
    type: 'geojson',
    data: geojson
  });
  
  // Capa de relleno del polígono
  mapa.addLayer({
    id: 'ordenes-poligonos-relleno',
    type: 'fill',
    source: 'ordenes-poligonos',
    paint: {
      'fill-color': COLORES_ESTADO.relleno.primario,
      'fill-opacity': 0.30
    }
  });
  
  // Capa de borde del polígono
  mapa.addLayer({
    id: 'ordenes-poligonos-borde',
    type: 'line',
    source: 'ordenes-poligonos',
    paint: {
      'line-color': COLORES_ESTADO.ordenExploracion.primario,
      'line-width': 2,
      'line-opacity': 0.8
    }
  });
};

/**
 * Actualiza las capas de polígonos con nuevos datos
 * @param {Object} mapa - Instancia del mapa de Mapbox
 * @param {Array} ordenes - Array actualizado de órdenes de exploración
 */
export const actualizarPoligonos = (mapa, ordenes) => {
  if (!mapa || !mapa.getSource('ordenes-poligonos')) {
    agregarCapaPoligonos(mapa, ordenes);
    return;
  }
  
  const ordenesConPoligono = ordenes.filter(o => 
    o.tipo === 'orden_exploracion' && 
    o.coordenadasPoligono && 
    o.coordenadasPoligono.length > 0
  );
  
  const geojson = {
    type: 'FeatureCollection',
    features: ordenesConPoligono.map(orden => ({
      type: 'Feature',
      properties: {
        nombre: orden.nombre,
        num_orden: orden.num_orden,
        superficie: orden.superficie,
        municipio: orden.municipio,
        a_favor: orden.a_favor,
        publ_dof: orden.publ_dof,
        estado: orden.estado
      },
      geometry: {
        type: 'Polygon',
        coordinates: [orden.coordenadasPoligono]
      }
    }))
  };
  
  mapa.getSource('ordenes-poligonos').setData(geojson);
};

/**
 * Configura eventos de interacción con los polígonos
 * @param {Object} mapa - Instancia del mapa de Mapbox
 * @param {Function} onClickPoligono - Callback cuando se hace click en un polígono
 */
export const configurarEventosPoligonos = (mapa, onClickPoligono) => {
  if (!mapa) return;
  
  // Cambiar cursor al pasar sobre un polígono
  mapa.on('mouseenter', 'ordenes-poligonos-relleno', () => {
    mapa.getCanvas().style.cursor = 'pointer';
  });
  
  mapa.on('mouseleave', 'ordenes-poligonos-relleno', () => {
    mapa.getCanvas().style.cursor = '';
  });
  
  // Click en polígono
  mapa.on('click', 'ordenes-poligonos-relleno', (e) => {
    if (e.features && e.features.length > 0) {
      const propiedades = e.features[0].properties;
      onClickPoligono(propiedades);
    }
  });
};

/**
 * Resalta un polígono específico
 * @param {Object} mapa - Instancia del mapa de Mapbox
 * @param {string} numOrden - Número de orden a resaltar
 */
export const resaltarPoligono = (mapa, numOrden) => {
  if (!mapa || !mapa.getLayer('ordenes-poligonos-relleno')) return;
  
  // Aplicar filtro para resaltar
  mapa.setPaintProperty('ordenes-poligonos-relleno', 'fill-opacity', [
    'case',
    ['==', ['get', 'num_orden'], numOrden],
    0.4, // Más opaco para el seleccionado
    0.15 // Opacidad normal para los demás
  ]);
  
  mapa.setPaintProperty('ordenes-poligonos-borde', 'line-width', [
    'case',
    ['==', ['get', 'num_orden'], numOrden],
    3, // Borde más grueso para el seleccionado
    2  // Borde normal para los demás
  ]);
};

/**
 * Quita el resaltado de todos los polígonos
 * @param {Object} mapa - Instancia del mapa de Mapbox
 */
export const quitarResaltadoPoligonos = (mapa) => {
  if (!mapa || !mapa.getLayer('ordenes-poligonos-relleno')) return;
  
  mapa.setPaintProperty('ordenes-poligonos-relleno', 'fill-opacity', 0.15);
  mapa.setPaintProperty('ordenes-poligonos-borde', 'line-width', 2);
};

/**
 * Ajusta la vista del mapa para mostrar un polígono específico
 * @param {Object} mapa - Instancia del mapa de Mapbox
 * @param {Array} coordenadasPoligono - Array de coordenadas del polígono
 * @param {number} padding - Padding alrededor del polígono
 */
export const ajustarVistaAPoligono = (mapa, coordenadasPoligono, padding = 50) => {
  if (!mapa || !coordenadasPoligono || coordenadasPoligono.length === 0) return;
  
  const limites = new mapboxgl.LngLatBounds();
  coordenadasPoligono.forEach(coord => limites.extend(coord));
  
  mapa.fitBounds(limites, {
    padding: padding,
    maxZoom: 14,
    duration: 1500
  });
};