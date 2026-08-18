import React, { useRef, useEffect, useCallback, memo, useState } from 'react';
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

const CAT_COLORES = {
  'RB': { primario: '#1E7B4F', oscuro: '#155A39' },
  'PN': { primario: '#2F4858', oscuro: '#1D3341' },
  'MN': { primario: '#5B4E6E', oscuro: '#3E344E' },
  'AP': { primario: '#A9812B', oscuro: '#7E5F1E' },
  'SB': { primario: '#1F6A5C', oscuro: '#114A40' },
  'FL': { primario: '#8E4458', oscuro: '#6E3243' },
};

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
  const nombre     = props.NOMBRE     || props.etiqueta || 'Área Natural Protegida';
  const catManejo  = props.CAT_MANEJO || '';
  const municipios = props.MUNICIPIOS || 'N/D';
  const region     = props.REGION     || 'N/D';
  const superficie = formatearSuperficie(props.SUPERFICIE || props.S_TERRES);
  const ultDof     = formatearFecha(props.ULT_DOF);
  const primDec    = formatearFecha(props.PCM1 || props.PRIM_DEC);
  const idAnp      = props.ID_ANP     || 'N/D';

  const colorCategoria = CAT_COLORES[catManejo]?.primario || '#5E636D';

  const nombreCategoria = {
    'RB': 'Reserva de Biosfera',   'PN': 'Parque Nacional',
    'MN': 'Monumento Natural',     'AP': 'Área de Protección',
    'SB': 'Santuario',             'FL': 'Área de Protección Flora y Fauna',
  }[catManejo] || (catManejo || 'Área Natural Protegida');

  return `
    <div style="padding:0;background:white;border-radius:12px;min-width:280px;max-width:320px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow:hidden;">
      <div style="background:#166534;padding:14px 16px 12px;">
        <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.18);border-radius:20px;padding:3px 10px;margin-bottom:8px;">
          <span style="width:8px;height:8px;background:${colorCategoria};border-radius:50%;display:inline-block;box-shadow:0 0 6px ${colorCategoria};"></span>
          <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:0.4px;">${nombreCategoria}</span>
        </div>
        <div style="font-size:15px;font-weight:800;color:white;line-height:1.3;">${nombre}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-top:4px;">ID: ${idAnp}</div>
      </div>
      <div style="padding:14px 16px;display:flex;flex-direction:column;gap:10px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div style="background:#E4F1EA;border:1px solid #C4DECB;border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:10px;color:#1E7B4F;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px;">Superficie</div>
            <div style="font-size:12px;font-weight:800;color:#166534;">${superficie}</div>
          </div>
          <div style="background:#E4F1EA;border:1px solid #C4DECB;border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:10px;color:#1E7B4F;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:3px;">Región</div>
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

// ── Crea el marcador DOM para un ANP con color según su categoría ──────────
const crearMarcadorANPDOM = (catManejo) => {
  const colores = CAT_COLORES[catManejo] || { primario: '#166534', oscuro: '#155A39' };
  const { primario, oscuro } = colores;

  const el = document.createElement('div');
  el.className = 'custom-marker-anp';
  el.innerHTML = `
    <svg width="26" height="28" viewBox="0 0 24 28" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="sh-anp" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
          <feOffset dx="0" dy="1" result="offsetblur"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.35"/></feComponentTransfer>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="12" cy="10" r="9" fill="${oscuro}" filter="url(#sh-anp)"/>
      <circle cx="12" cy="10" r="7.5" fill="${primario}"/>
      <path d="M12 14.5 C12 14.5 7.5 11.5 7.5 8.2 C7.5 5.7 9.5 3.8 12 3.8 C14.5 3.8 16.5 5.7 16.5 8.2 C16.5 11.5 12 14.5 12 14.5Z" fill="white" opacity="0.92"/>
      <rect x="11.3" y="14" width="1.4" height="2.2" rx="0.7" fill="white" opacity="0.92"/>
      <path d="M12 20 L10 25 L12 23 L14 25 Z" fill="${oscuro}" filter="url(#sh-anp)"/>
    </svg>
  `;
  return el;
};

// ── Helper: cierra todos los popups activos ────────────────────────────────
const cerrarTodosLosPopups = (popupCoordenadas, popupANP) => {
  if (popupCoordenadas.current) {
    popupCoordenadas.current.remove();
    popupCoordenadas.current = null;
  }
  if (popupANP.current) {
    popupANP.current.remove();
    popupANP.current = null;
  }
};

// ── Leyenda de capas (colapsable) ──────────────────────────────────────────
const LEYENDA_ITEMS = {
  concesiones: [
    { color: '#1E7B4F', label: 'Vigente' },
    { color: '#B4691E', label: 'No vigente / Cancelada' },
    { color: '#A9812B', label: 'Orden de exploración' },
  ],
  ordenes: [
    { color: '#A9812B', label: 'Orden de exploración' },
  ],
  areas_naturales: [
    { color: '#1E7B4F', label: 'Reserva de Biosfera' },
    { color: '#2F4858', label: 'Parque Nacional' },
    { color: '#5B4E6E', label: 'Monumento Natural' },
    { color: '#A9812B', label: 'Área de Protección' },
    { color: '#1F6A5C', label: 'Santuario' },
    { color: '#8E4458', label: 'Flora y Fauna' },
  ],
};

const LeyendaMapa = ({ tipoElemento }) => {
  const [abierta, setAbierta] = useState(true);
  const items = LEYENDA_ITEMS[tipoElemento] || LEYENDA_ITEMS.concesiones;

  return (
    <>
      <style>{`
        .mapa-leyenda {
          position: absolute; bottom: 26px; right: 16px; z-index: 12;
          background: var(--superficie); border: 1px solid var(--hairline);
          border-radius: var(--radio-md); box-shadow: var(--sombra-media);
          min-width: 190px; max-width: 230px; overflow: hidden;
          font-family: var(--fuente-ui);
        }
        .mapa-leyenda-toggle {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          width: 100%; padding: 8px 12px; background: var(--acento-claro);
          border: none; cursor: pointer; font-family: inherit;
          font-size: 11px; font-weight: 700; color: var(--acento-oscuro);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .mapa-leyenda-toggle:hover { background: #E3E9ED; }
        .mapa-leyenda-toggle svg { color: var(--acento); transition: transform 0.2s ease; flex-shrink: 0; }
        .mapa-leyenda-toggle.abierta svg { transform: rotate(180deg); }
        .mapa-leyenda-items {
          padding: 9px 12px; display: flex; flex-direction: column; gap: 7px;
          max-height: 190px; overflow-y: auto;
        }
        .mapa-leyenda-items::-webkit-scrollbar { width: 4px; }
        .mapa-leyenda-items::-webkit-scrollbar-thumb { background: var(--hairline); border-radius: 4px; }
        .mapa-leyenda-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 500; color: var(--tinta-1);
        }
        .mapa-leyenda-dot {
          width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0;
          box-shadow: 0 1px 3px rgba(32,36,46,0.25);
        }
        @media (max-width: 768px) {
          .mapa-leyenda { right: 10px; bottom: 74px; min-width: 170px; }
          .mapa-leyenda-item { font-size: 11px; }
        }
      `}</style>

      <div className="mapa-leyenda">
        <button
          type="button"
          className={`mapa-leyenda-toggle ${abierta ? 'abierta' : ''}`}
          onClick={() => setAbierta(v => !v)}
          aria-expanded={abierta}
        >
          <span>Leyenda</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {abierta && (
          <div className="mapa-leyenda-items">
            {items.map(item => (
              <div key={item.label} className="mapa-leyenda-item">
                <span className="mapa-leyenda-dot" style={{ background: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// ============================================================================
const Mapa = memo(({
  elementosFiltrados,
  elementoSeleccionado,
  onSeleccionarElemento,
  regionSeleccionada,
  municipioSeleccionado,
  terminoBusqueda,
  anpSeleccionada,   // ANP seleccionada desde el panel (para flyTo)
  anps,              // lista completa de ANPs para mostrar marcadores
  tipoElemento,      // 'concesiones' | 'ordenes' | 'areas_naturales'
  onSeleccionarANP   // callback al hacer clic en un marcador ANP
}) => {
  const contenedorMapa              = useRef(null);
  const mapa                        = useRef(null);
  const marcadores                  = useRef([]);
  const marcadoresANP               = useRef([]);
  const popupCoordenadas            = useRef(null);
  const popupANP                    = useRef(null);
  const poligonosInicializados      = useRef(false);
  const ultimoElementoSeleccionado  = useRef(null);
  const ultimaANPSeleccionada       = useRef(null);

  // ── Capas ANP (tileset vectorial) ──
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
      paint: { 'fill-color': '#1E7B4F', 'fill-opacity': 0.18 }
    });

    mapa.current.addLayer({
      id: ANP_LINE_ID,
      type: 'line',
      source: ANP_SOURCE_ID,
      'source-layer': ANP_SOURCE_LAYER,
      paint: { 'line-color': '#166534', 'line-width': 1.8, 'line-opacity': 0.75 }
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
      // Cerrar popup de coordenadas si está abierto
      if (popupCoordenadas.current) {
        popupCoordenadas.current.remove();
        popupCoordenadas.current = null;
      }
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

      // ── Cerrar todos los popups al hacer clic en área vacía del mapa ──
      mapa.current.on('click', (e) => {
        // Si el clic fue sobre una capa interactiva (ANP fill o polígono orden),
        // esos handlers ya se encargaron; aquí solo actuamos en clics "libres".
        const featuresBajoClick = mapa.current.queryRenderedFeatures(e.point, {
          layers: [ANP_FILL_ID, 'ordenes-poligonos-relleno'].filter(id => {
            try { return !!mapa.current.getLayer(id); } catch { return false; }
          })
        });

        // Si no hay features debajo del clic, cerrar todos los popups
        if (!featuresBajoClick || featuresBajoClick.length === 0) {
          cerrarTodosLosPopups(popupCoordenadas, popupANP);
        }
      });
    });

    return () => {
      if (mapa.current) { mapa.current.remove(); mapa.current = null; }
    };
  }, []);

  // ── Marcadores de ANP ────────────────────────────────────────────────────
  useEffect(() => {
    marcadoresANP.current.forEach(m => m.remove());
    marcadoresANP.current = [];

    if (!mapa.current || tipoElemento !== 'areas_naturales' || !anps?.length) return;

    const nuevos = anps
      .filter(anp => anp.coords?.length === 2)
      .map(anp => {
        const el = crearMarcadorANPDOM(anp.CAT_MANEJO);

        const marcador = new mapboxgl.Marker(el)
          .setLngLat(anp.coords)
          .addTo(mapa.current);

        el.addEventListener('click', (e) => {
          e.stopPropagation(); // evita que dispare el click "vacío" del mapa

          if (popupCoordenadas.current) {
            popupCoordenadas.current.remove();
            popupCoordenadas.current = null;
          }
          if (popupANP.current) popupANP.current.remove();
          popupANP.current = new mapboxgl.Popup({
            closeButton: true, closeOnClick: false,
            offset: 22, className: 'anp-popup', maxWidth: '340px'
          })
            .setLngLat(anp.coords)
            .setHTML(crearPopupANP({
              NOMBRE:     anp.NOMBRE,
              CAT_MANEJO: anp.CAT_MANEJO,
              MUNICIPIOS: anp.MUNICIPIOS,
              REGION:     anp.REGION,
              SUPERFICIE: anp.SUPERFICIE,
              S_TERRES:   anp.S_TERRES,
              PRIM_DEC:   anp.PRIM_DEC,
              ULT_DOF:    anp.ULT_DOF,
              ID_ANP:     anp.ID_ANP,
            }))
            .addTo(mapa.current);

          if (onSeleccionarANP) onSeleccionarANP(anp);
        });

        return marcador;
      });

    marcadoresANP.current = nuevos;

    if (nuevos.length > 0) {
      const limites = new mapboxgl.LngLatBounds();
      anps.filter(a => a.coords?.length === 2).forEach(a => limites.extend(a.coords));
      mapa.current.fitBounds(limites, { padding: 80, maxZoom: 10, duration: 1200 });
    }
  }, [tipoElemento, anps, onSeleccionarANP]);

  // ── Volar a ANP seleccionada desde el panel ──
  useEffect(() => {
    if (!anpSeleccionada || !mapa.current) return;

    if (ultimaANPSeleccionada.current?.ID_ANP === anpSeleccionada.ID_ANP) return;
    ultimaANPSeleccionada.current = anpSeleccionada;

    const coords = anpSeleccionada.coords;
    if (!coords || coords.length < 2) return;

    cerrarTodosLosPopups(popupCoordenadas, popupANP);

    mapa.current.flyTo({ center: coords, zoom: 10, duration: 1800, essential: true });

    mapa.current.once('moveend', () => {
      if (!mapa.current) return;
      popupANP.current = new mapboxgl.Popup({
        closeButton: true, closeOnClick: false,
        offset: 22, className: 'anp-popup', maxWidth: '340px'
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

  // ── Popup concesiones / órdenes ──
  const mostrarPopupCoordenadas = useCallback((elemento) => {
    cerrarTodosLosPopups(popupCoordenadas, popupANP);
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

      elementoDOM.addEventListener('click', (e) => {
        e.stopPropagation(); // evita que dispare el click "vacío" del mapa
        onSeleccionarElemento(elemento);
      });
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

  return (
    <>
      <div ref={contenedorMapa} className="map-container" />
      <LeyendaMapa tipoElemento={tipoElemento} />
    </>
  );
});

Mapa.displayName = 'Mapa';
export default Mapa;