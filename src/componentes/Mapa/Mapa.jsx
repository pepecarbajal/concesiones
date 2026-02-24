import React, { useRef, useEffect, useCallback, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { COORDENADAS_REGIONES, NIVELES_ZOOM, LIMITES_VISUALIZACION } from '../../utilidades/constantes';
import { crearMarcadorConcesion, crearMarcadorOrden } from './utilidades/creadorMarcadores';
import { crearContenidoPopup } from './utilidades/creadorPopups';
import {
  agregarCapaPoligonos,
  actualizarPoligonos,
  configurarEventosPoligonos,
  resaltarPoligono,
  quitarResaltadoPoligonos,
  ajustarVistaAPoligono
} from './utilidades/gestorPoligonos';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const ANP_TILESET_ID   = 'pepelepew.9a4uy0ui';
const ANP_SOURCE_LAYER = 'anpenero2024gw-5ikbfz';
const ANP_SOURCE_ID    = 'anp-source';
const ANP_FILL_ID      = 'anp-fill';
const ANP_LINE_ID      = 'anp-line';

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return 'N/D';
  try {
    return new Date(fechaISO).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return fechaISO; }
};

const formatearSuperficie = (sup) => {
  if (!sup) return 'N/D';
  return Number(parseFloat(sup).toFixed(2)).toLocaleString('es-MX') + ' ha';
};

const crearPopupANP = (props) => {
  const nombre    = props.NOMBRE     || props.etiqueta || 'Área Natural Protegida';
  const catManejo = props.CAT_MANEJO || '';
  const municipios = props.MUNICIPIOS || 'N/D';
  const region    = props.REGION     || 'N/D';
  const superficie = formatearSuperficie(props.SUPERFICIE || props.S_TERRES);
  const ultDof    = formatearFecha(props.ULT_DOF);
  const primDec   = formatearFecha(props.PCM1 || props.PRIM_DEC);
  const idAnp     = props.ID_ANP     || 'N/D';

  const colorCategoria = {
    'RB': '#22c55e', 'PN': '#3b82f6', 'MN': '#a855f7',
    'AP': '#f59e0b', 'SB': '#14b8a6', 'FL': '#ec4899',
  }[catManejo] || '#6b7280';

  const nombreCategoria = {
    'RB': 'Reserva de Biosfera',   'PN': 'Parque Nacional',
    'MN': 'Monumento Natural',     'AP': 'Área de Protección',
    'SB': 'Santuario',             'FL': 'Área de Protección Flora y Fauna',
  }[catManejo] || (catManejo || 'Área Natural Protegida');

  return `
    <div style="padding:0;background:white;border-radius:12px;min-width:280px;max-width:320px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#166534 0%,#15803d 100%);padding:14px 16px 12px;">
        <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.18);border-radius:20px;padding:3px 10px;margin-bottom:8px;">
          <span style="width:8px;height:8px;background:${colorCategoria};border-radius:50%;display:inline-block;box-shadow:0 0 6px ${colorCategoria};"></span>
          <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:0.4px;">${nombreCategoria}</span>
        </div>
        <div style="font-size:15px;font-weight:800;color:white;line-height:1.3;">${nombre}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-top:4px;">ID: ${idAnp}</div>
      </div>
      <div style="padding:14px 16px;display:flex;flex-direction:column;gap:10px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:10px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px;">Superficie</div>
            <div style="font-size:12px;font-weight:800;color:#166534;">${superficie}</div>
          </div>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:10px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px;">Región</div>
            <div style="font-size:11px;font-weight:700;color:#166534;line-height:1.3;">${region}</div>
          </div>
        </div>
        <div>
          <div style="font-size:10px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:4px;">Municipios</div>
          <div style="font-size:12px;color:#374151;line-height:1.5;">${municipios}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;border-top:1px solid #f3f4f6;padding-top:10px;">
          <div>
            <div style="font-size:10px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:2px;">Decreto</div>
            <div style="font-size:11px;color:#374151;font-weight:600;">${primDec}</div>
          </div>
          <div>
            <div style="font-size:10px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:2px;">Último DOF</div>
            <div style="font-size:11px;color:#374151;font-weight:600;">${ultDof}</div>
          </div>
        </div>
        <div style="background:#fafafa;border-radius:6px;padding:6px 10px;font-size:10px;color:#9ca3af;line-height:1.5;">
          Fuente: CONANP 2024. Áreas Naturales Protegidas Federales de México.
        </div>
      </div>
    </div>
  `;
};

// ============================================================================
const Mapa = memo(({
  elementosFiltrados,
  elementoSeleccionado,
  onSeleccionarElemento,
  regionSeleccionada,
  municipioSeleccionado,
  terminoBusqueda,
  anpSeleccionada           // ← nuevo prop: ANP elegida desde el panel
}) => {
  const contenedorMapa         = useRef(null);
  const mapa                   = useRef(null);
  const marcadores             = useRef([]);
  const popupCoordenadas       = useRef(null);
  const popupANP               = useRef(null);
  const poligonosInicializados = useRef(false);
  const ultimoElementoSeleccionado  = useRef(null);
  const ultimaANPSeleccionada       = useRef(null);   // evitar vuelos duplicados

  // ── Capas ANP ──
  const agregarCapasANP = useCallback(() => {
    if (!mapa.current || mapa.current.getSource(ANP_SOURCE_ID)) return;

    mapa.current.addSource(ANP_SOURCE_ID, {
      type: 'vector',
      url: `mapbox://${ANP_TILESET_ID}`
    });

    mapa.current.addLayer({
      id: ANP_FILL_ID,
      type: 'fill',
      source: ANP_SOURCE_ID,
      'source-layer': ANP_SOURCE_LAYER,
      paint: { 'fill-color': '#16a34a', 'fill-opacity': 0.18 }
    });

    mapa.current.addLayer({
      id: ANP_LINE_ID,
      type: 'line',
      source: ANP_SOURCE_ID,
      'source-layer': ANP_SOURCE_LAYER,
      paint: { 'line-color': '#15803d', 'line-width': 1.8, 'line-opacity': 0.75 }
    });
  }, []);

  const configurarEventosANP = useCallback(() => {
    if (!mapa.current) return;

    mapa.current.on('mouseenter', ANP_FILL_ID, () => {
      mapa.current.getCanvas().style.cursor = 'pointer';
      mapa.current.setPaintProperty(ANP_FILL_ID, 'fill-opacity', 0.35);
    });
    mapa.current.on('mouseleave', ANP_FILL_ID, () => {
      mapa.current.getCanvas().style.cursor = '';
      mapa.current.setPaintProperty(ANP_FILL_ID, 'fill-opacity', 0.18);
    });
    mapa.current.on('click', ANP_FILL_ID, (e) => {
      if (!e.features || e.features.length === 0) return;
      if (popupANP.current) popupANP.current.remove();
      popupANP.current = new mapboxgl.Popup({
        closeButton: true, closeOnClick: false,
        offset: 15, className: 'anp-popup', maxWidth: '340px'
      })
        .setLngLat(e.lngLat)
        .setHTML(crearPopupANP(e.features[0].properties))
        .addTo(mapa.current);
    });
  }, []);

  // ── Inicializar mapa ──
  useEffect(() => {
    if (mapa.current) return;

    mapa.current = new mapboxgl.Map({
      container: contenedorMapa.current,
      style: import.meta.env.VITE_MAPBOX_STYLE,
      center: [
        parseFloat(import.meta.env.VITE_MAP_CENTER_LNG),
        parseFloat(import.meta.env.VITE_MAP_CENTER_LAT)
      ],
      zoom: parseFloat(import.meta.env.VITE_MAP_INITIAL_ZOOM)
    });

    mapa.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapa.current.on('load', () => {
      poligonosInicializados.current = true;

      if (elementosFiltrados.length > 0) {
        agregarCapaPoligonos(mapa.current, elementosFiltrados);
        configurarEventosPoligonos(mapa.current, (propiedades) => {
          const orden = elementosFiltrados.find(e =>
            e.tipo === 'orden_exploracion' && e.num_orden === propiedades.num_orden
          );
          if (orden) onSeleccionarElemento(orden);
        });
      }

      agregarCapasANP();
      configurarEventosANP();
    });

    return () => {
      if (mapa.current) { mapa.current.remove(); mapa.current = null; }
    };
  }, []);

  // ── Volar a ANP seleccionada desde el panel ──
  useEffect(() => {
    if (!anpSeleccionada || !mapa.current) return;

    // Evitar vuelo duplicado si es la misma ANP
    if (ultimaANPSeleccionada.current?.ID_ANP === anpSeleccionada.ID_ANP) return;
    ultimaANPSeleccionada.current = anpSeleccionada;

    const coords = anpSeleccionada.coords;
    if (!coords || coords.length < 2) return;

    // Cerrar popups anteriores
    if (popupANP.current) popupANP.current.remove();
    if (popupCoordenadas.current) popupCoordenadas.current.remove();

    // Volar a las coordenadas del ANP
    mapa.current.flyTo({
      center: coords,
      zoom: 10,
      duration: 1800,
      essential: true
    });

    // Mostrar popup con info del ANP tras el vuelo
    mapa.current.once('moveend', () => {
      if (!mapa.current) return;
      popupANP.current = new mapboxgl.Popup({
        closeButton: true, closeOnClick: false,
        offset: 15, className: 'anp-popup', maxWidth: '340px'
      })
        .setLngLat(coords)
        .setHTML(crearPopupANP({
          NOMBRE:      anpSeleccionada.NOMBRE,
          CAT_MANEJO:  anpSeleccionada.CAT_MANEJO,
          MUNICIPIOS:  anpSeleccionada.MUNICIPIOS,
          REGION:      anpSeleccionada.REGION,
          SUPERFICIE:  anpSeleccionada.SUPERFICIE,
          S_TERRES:    anpSeleccionada.S_TERRES,
          PRIM_DEC:    anpSeleccionada.PRIM_DEC,
          ULT_DOF:     anpSeleccionada.ULT_DOF,
          ID_ANP:      anpSeleccionada.ID_ANP,
        }))
        .addTo(mapa.current);
    });
  }, [anpSeleccionada]);

  // ── Popup concesiones/órdenes ──
  const mostrarPopupCoordenadas = useCallback((elemento) => {
    if (popupCoordenadas.current) popupCoordenadas.current.remove();
    popupCoordenadas.current = new mapboxgl.Popup({
      closeButton: true, closeOnClick: false,
      offset: 25, className: 'coordinates-popup'
    })
      .setLngLat(elemento.coords)
      .setHTML(crearContenidoPopup(elemento))
      .addTo(mapa.current);
  }, []);

  const navegarAElemento = useCallback((elemento) => {
    if (!mapa.current || !elemento) return;
    const esOrden = elemento.tipo === 'orden_exploracion';

    if (esOrden && elemento.coordenadasPoligono?.length > 0) {
      ajustarVistaAPoligono(mapa.current, elemento.coordenadasPoligono, 80);
      resaltarPoligono(mapa.current, elemento.num_orden);
    } else {
      mapa.current.flyTo({
        center: elemento.coords,
        zoom: esOrden ? NIVELES_ZOOM.ordenExploracion : NIVELES_ZOOM.concesion,
        duration: 1500
      });
      if (esOrden) quitarResaltadoPoligonos(mapa.current);
    }
    mostrarPopupCoordenadas(elemento);
  }, [mostrarPopupCoordenadas]);

  useEffect(() => {
    if (!elementoSeleccionado) { ultimoElementoSeleccionado.current = null; return; }
    const esOrden  = elementoSeleccionado.tipo === 'orden_exploracion';
    const idActual = esOrden ? elementoSeleccionado.num_orden : elementoSeleccionado.titulo;
    const ultimoId = ultimoElementoSeleccionado.current
      ? (ultimoElementoSeleccionado.current.tipo === 'orden_exploracion'
          ? ultimoElementoSeleccionado.current.num_orden
          : ultimoElementoSeleccionado.current.titulo)
      : null;
    if (idActual !== ultimoId) {
      navegarAElemento(elementoSeleccionado);
      ultimoElementoSeleccionado.current = elementoSeleccionado;
    }
  }, [elementoSeleccionado, navegarAElemento]);

  useEffect(() => {
    if (!regionSeleccionada || !mapa.current) return;
    const cfg = COORDENADAS_REGIONES[regionSeleccionada];
    mapa.current.flyTo(cfg
      ? { center: cfg.coords, zoom: cfg.zoom, duration: 2000 }
      : { center: [-99.5008, 17.5509], zoom: 8, duration: 2000 }
    );
  }, [regionSeleccionada]);

  useEffect(() => {
    if (!municipioSeleccionado || !mapa.current) return;
    const items = elementosFiltrados.filter(e => e.municipio === municipioSeleccionado);
    if (items.length > 0) {
      const limites = new mapboxgl.LngLatBounds();
      items.forEach(e => limites.extend(e.coords));
      mapa.current.fitBounds(limites, {
        padding: LIMITES_VISUALIZACION.paddingMunicipio,
        maxZoom: NIVELES_ZOOM.municipio
      });
    }
  }, [municipioSeleccionado, elementosFiltrados]);

  useEffect(() => {
    if (!mapa.current) return;
    marcadores.current.forEach(m => m.remove());
    marcadores.current = [];

    if (poligonosInicializados.current) {
      actualizarPoligonos(mapa.current, elementosFiltrados);
    }

    const nuevosMarcadores = elementosFiltrados.map(elemento => {
      const elementoDOM = elemento.tipo === 'orden_exploracion'
        ? crearMarcadorOrden()
        : crearMarcadorConcesion(elemento.estado);

      const marcador = new mapboxgl.Marker(elementoDOM)
        .setLngLat(elemento.coords)
        .addTo(mapa.current);

      elementoDOM.addEventListener('click', () => onSeleccionarElemento(elemento));
      return marcador;
    });

    marcadores.current = nuevosMarcadores;

    if (
      elementosFiltrados.length > 0 &&
      !municipioSeleccionado &&
      !regionSeleccionada &&
      terminoBusqueda.length === 0
    ) {
      const limites = new mapboxgl.LngLatBounds();
      elementosFiltrados.forEach(e => limites.extend(e.coords));
      mapa.current.fitBounds(limites, {
        padding: LIMITES_VISUALIZACION.paddingMapa,
        maxZoom: NIVELES_ZOOM.general
      });
    }
  }, [elementosFiltrados, onSeleccionarElemento, municipioSeleccionado, regionSeleccionada, terminoBusqueda]);

  return <div ref={contenedorMapa} className="map-container" />;
});

Mapa.displayName = 'Mapa';
export default Mapa;