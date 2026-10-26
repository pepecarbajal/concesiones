import poligonosLocales from '../../../concesionesPoligonos.json';
import { COLORES_ESTADO } from '../../../utilidades/constantes';

// ============================================================================
// Capa de polígonos de concesiones mineras
//
// Por defecto usa src/concesionesPoligonos.json (se genera con actualizar_app.py
// junto con concesiones.json, así puntos y polígonos siempre son del mismo corte).
//
// Para usar en su lugar el tileset subido a Mapbox, define en .env:
//   VITE_CONCESIONES_TILESET=usuario.xxxxxxxx        (Tileset ID en Mapbox Studio)
//   VITE_CONCESIONES_SOURCE_LAYER=nombre_de_la_capa  (Vector layer del tileset)
//   VITE_CONCESIONES_CAMPO_TITULO=titulo             (opcional, campo con el número de título)
// ============================================================================

export const CONCESIONES_SOURCE_ID = 'concesiones-poligonos';
export const CONCESIONES_FILL_ID   = 'concesiones-poligonos-relleno';
export const CONCESIONES_LINE_ID   = 'concesiones-poligonos-borde';

const TILESET      = import.meta.env.VITE_CONCESIONES_TILESET;
const SOURCE_LAYER = import.meta.env.VITE_CONCESIONES_SOURCE_LAYER;
const CAMPO_TITULO = import.meta.env.VITE_CONCESIONES_CAMPO_TITULO || 'titulo';
const USA_TILESET  = Boolean(TILESET && SOURCE_LAYER);

// El título puede venir como texto o número según cómo se subió el archivo
const TITULO = ['to-number', ['get', CAMPO_TITULO], -1];

const primeraCapaDeEtiquetas = (mapa) =>
  mapa.getStyle()?.layers?.find(l => l.type === 'symbol')?.id;

export const agregarCapaConcesiones = (mapa) => {
  if (!mapa || mapa.getSource(CONCESIONES_SOURCE_ID)) return;

  mapa.addSource(CONCESIONES_SOURCE_ID, USA_TILESET
    ? { type: 'vector', url: `mapbox://${TILESET}` }
    : { type: 'geojson', data: poligonosLocales });

  const base = {
    source: CONCESIONES_SOURCE_ID,
    ...(USA_TILESET ? { 'source-layer': SOURCE_LAYER } : {}),
    filter: ['in', TITULO, ['literal', []]]
  };
  const antesDe = primeraCapaDeEtiquetas(mapa);

  mapa.addLayer({
    ...base,
    id: CONCESIONES_FILL_ID,
    type: 'fill',
    paint: { 'fill-color': COLORES_ESTADO.vigente.primario, 'fill-opacity': 0.25 }
  }, antesDe);

  mapa.addLayer({
    ...base,
    id: CONCESIONES_LINE_ID,
    type: 'line',
    paint: { 'line-color': COLORES_ESTADO.vigente.oscuro, 'line-width': 1.2, 'line-opacity': 0.9 }
  }, antesDe);

  mapa.on('error', (e) => {
    if (e?.sourceId === CONCESIONES_SOURCE_ID) {
      console.error('[concesiones] No se pudo cargar la capa de polígonos:', e.error?.message || e);
    }
  });
};

/**
 * Muestra solo los polígonos de las concesiones filtradas, colorea por estado
 * y resalta la seleccionada.
 */
export const actualizarCapaConcesiones = (mapa, elementos, tituloSeleccionado = null) => {
  if (!mapa || !mapa.getLayer(CONCESIONES_FILL_ID)) return;

  const concesiones = elementos.filter(e => e.tipo !== 'orden_exploracion');
  const titulos     = concesiones.map(c => Number(c.titulo));
  const noVigentes  = concesiones.filter(c => c.estado === 'No Vigente').map(c => Number(c.titulo));
  const sel         = tituloSeleccionado != null ? Number(tituloSeleccionado) : -2;

  const filtro = ['in', TITULO, ['literal', titulos]];
  mapa.setFilter(CONCESIONES_FILL_ID, filtro);
  mapa.setFilter(CONCESIONES_LINE_ID, filtro);

  const esNoVigente = ['in', TITULO, ['literal', noVigentes]];
  const esSel       = ['==', TITULO, sel];

  mapa.setPaintProperty(CONCESIONES_FILL_ID, 'fill-color',
    ['case', esNoVigente, COLORES_ESTADO.noVigente.primario, COLORES_ESTADO.vigente.primario]);
  mapa.setPaintProperty(CONCESIONES_FILL_ID, 'fill-opacity', ['case', esSel, 0.45, 0.25]);
  mapa.setPaintProperty(CONCESIONES_LINE_ID, 'line-color',
    ['case', esNoVigente, COLORES_ESTADO.noVigente.oscuro, COLORES_ESTADO.vigente.oscuro]);
  mapa.setPaintProperty(CONCESIONES_LINE_ID, 'line-width', ['case', esSel, 3, 1.2]);
};

export const configurarEventosConcesiones = (mapa, onClick) => {
  if (!mapa) return;
  mapa.on('mouseenter', CONCESIONES_FILL_ID, () => { mapa.getCanvas().style.cursor = 'pointer'; });
  mapa.on('mouseleave', CONCESIONES_FILL_ID, () => { mapa.getCanvas().style.cursor = ''; });
  mapa.on('click', CONCESIONES_FILL_ID, (e) => {
    const f = e.features?.[0];
    if (f) onClick(Number(f.properties[CAMPO_TITULO]));
  });
};
