import React, { useRef, useEffect, useCallback } from 'react';
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

// Token de Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const Mapa = ({
  elementosFiltrados,
  elementoSeleccionado,
  onSeleccionarElemento,
  regionSeleccionada,
  municipioSeleccionado,
  terminoBusqueda
}) => {
  const contenedorMapa = useRef(null);
  const mapa = useRef(null);
  const marcadores = useRef([]);
  const popupCoordenadas = useRef(null);
  const estaNavegando = useRef(false);
  const poligonosInicializados = useRef(false);

  // Inicializar el mapa
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
    
    // Esperar a que el mapa cargue completamente antes de agregar las capas
    mapa.current.on('load', () => {
      poligonosInicializados.current = true;
      
      // Agregar capas de polígonos para órdenes de exploración
      if (elementosFiltrados.length > 0) {
        agregarCapaPoligonos(mapa.current, elementosFiltrados);
        
        // Configurar eventos de click en polígonos
        configurarEventosPoligonos(mapa.current, (propiedades) => {
          // Buscar la orden completa en los elementos filtrados
          const orden = elementosFiltrados.find(e => 
            e.tipo === 'orden_exploracion' && e.num_orden === propiedades.num_orden
          );
          
          if (orden) {
            onSeleccionarElemento(orden);
          }
        });
      }
    });
  }, []);

  // Mostrar popup con coordenadas del elemento
  const mostrarPopupCoordenadas = useCallback((elemento) => {
    if (popupCoordenadas.current) {
      popupCoordenadas.current.remove();
    }

    const contenidoHTML = crearContenidoPopup(elemento);

    popupCoordenadas.current = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      offset: 25,
      className: 'coordinates-popup'
    })
      .setLngLat(elemento.coords)
      .setHTML(contenidoHTML)
      .addTo(mapa.current);
  }, []);

  // Navegar a un elemento en el mapa
  const navegarAElemento = useCallback((elemento) => {
    if (!mapa.current || !elemento) return;

    const esOrden = elemento.tipo === 'orden_exploracion';
    
    // Si es una orden con polígono, ajustar vista al polígono completo
    if (esOrden && elemento.coordenadasPoligono && elemento.coordenadasPoligono.length > 0) {
      ajustarVistaAPoligono(mapa.current, elemento.coordenadasPoligono, 80);
      resaltarPoligono(mapa.current, elemento.num_orden);
    } else {
      // Para concesiones o órdenes sin polígono, hacer zoom al punto
      const nivelZoom = esOrden ? NIVELES_ZOOM.ordenExploracion : NIVELES_ZOOM.concesion;
      
      mapa.current.flyTo({
        center: elemento.coords,
        zoom: nivelZoom,
        duration: 1500
      });
      
      if (esOrden) {
        quitarResaltadoPoligonos(mapa.current);
      }
    }

    mostrarPopupCoordenadas(elemento);
  }, [mostrarPopupCoordenadas]);

  // Actualizar cuando cambia el elemento seleccionado
  useEffect(() => {
    if (elementoSeleccionado && !estaNavegando.current) {
      navegarAElemento(elementoSeleccionado);
    }
  }, [elementoSeleccionado, navegarAElemento]);

  // Navegar a una región específica
  useEffect(() => {
    if (!regionSeleccionada || !mapa.current) return;

    const configuracionRegion = COORDENADAS_REGIONES[regionSeleccionada];
    
    if (configuracionRegion) {
      mapa.current.flyTo({
        center: configuracionRegion.coords,
        zoom: configuracionRegion.zoom,
        duration: 2000
      });
    } else {
      mapa.current.flyTo({
        center: [-99.5008, 17.5509],
        zoom: 8,
        duration: 2000
      });
    }
  }, [regionSeleccionada]);

  // Ajustar vista a municipio seleccionado
  useEffect(() => {
    if (!municipioSeleccionado || !mapa.current) return;

    const elementosMunicipio = elementosFiltrados.filter(
      e => e.municipio === municipioSeleccionado
    );

    if (elementosMunicipio.length > 0) {
      const limites = new mapboxgl.LngLatBounds();
      elementosMunicipio.forEach(e => limites.extend(e.coords));
      mapa.current.fitBounds(limites, { 
        padding: LIMITES_VISUALIZACION.paddingMunicipio, 
        maxZoom: NIVELES_ZOOM.municipio 
      });
    }
  }, [municipioSeleccionado, elementosFiltrados]);

  // Actualizar marcadores cuando cambien los elementos filtrados
  useEffect(() => {
    if (!mapa.current) return;

    // Limpiar marcadores existentes
    marcadores.current.forEach(marcador => marcador.remove());
    marcadores.current = [];
    
    // Actualizar polígonos si el mapa ya está cargado
    if (poligonosInicializados.current) {
      actualizarPoligonos(mapa.current, elementosFiltrados);
    }

    // Crear nuevos marcadores
    elementosFiltrados.forEach(elemento => {
      const elementoDOM = elemento.tipo === 'orden_exploracion'
        ? crearMarcadorOrden()
        : crearMarcadorConcesion(elemento.estado);

      const marcador = new mapboxgl.Marker(elementoDOM)
        .setLngLat(elemento.coords)
        .addTo(mapa.current);

      // Evento click en el marcador
      elementoDOM.addEventListener('click', () => {
        onSeleccionarElemento(elemento);
      });

      marcadores.current.push(marcador);
    });

    // Ajustar vista para mostrar todos los marcadores
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
};

export default Mapa;