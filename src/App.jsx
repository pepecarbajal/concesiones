import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './index.css';

// Importar datos
import concesionesData from './concesiones.json';
import ordenesExploracionData from './ordenes_exploracion.json';

// Importar componentes
import Mapa from './componentes/Mapa/Mapa';
import BarraFiltros from './componentes/BarraFiltros/BarraFiltros';
import PanelLateral from './componentes/PanelLateral/PanelLateral';
import BotonesMovil from './componentes/BotonesMovil/BotonesMovil';
import SelectorTipoElemento from './componentes/SelectorTipoElemento/SelectorTipoElemento';

// Importar utilidades
import { procesarConcesiones, procesarOrdenesExploracion } from './utilidades/procesadorDatos';

// ============================================================================
// OPTIMIZACIÓN 1: Procesar datos una sola vez fuera del componente
// ============================================================================
const CONCESIONES_PROCESADAS = procesarConcesiones(concesionesData);
const ORDENES_PROCESADAS = procesarOrdenesExploracion(ordenesExploracionData);
const MUNICIPIOS_UNICOS = [...new Set(CONCESIONES_PROCESADAS.map(c => c.municipio))].sort();
const REGIONES_UNICAS = [...new Set(CONCESIONES_PROCESADAS.map(c => c.region).filter(Boolean))].sort();

// ============================================================================
// OPTIMIZACIÓN 2: Funciones de filtrado fuera del componente
// ============================================================================
const filtrarPorAnio = (elemento, yearFilter) => {
  if (!yearFilter || !elemento.fecha_inicio) return true;
  
  const partes = elemento.fecha_inicio.split('/');
  if (partes.length !== 3) return false;
  
  let anio = partes[2];
  if (anio.length === 2) {
    anio = parseInt(anio) > 50 ? '19' + anio : '20' + anio;
  }
  return anio === yearFilter;
};

// ============================================================================
// OPTIMIZACIÓN 3: Búsqueda optimizada con toLowerCase pre-calculado
// ============================================================================
const buscarEnElemento = (elemento, termino) => {
  const terminoLower = termino.toLowerCase();
  const esOrden = elemento.tipo === 'orden_exploracion';
  
  if (esOrden) {
    return elemento.nombre?.toLowerCase().includes(terminoLower) ||
           elemento.municipio?.toLowerCase().includes(terminoLower) ||
           elemento.num_orden?.toLowerCase().includes(terminoLower);
  }
  
  return elemento.nombre_lote?.toLowerCase().includes(terminoLower) ||
         elemento.titular?.toLowerCase().includes(terminoLower) ||
         elemento.municipio?.toLowerCase().includes(terminoLower) ||
         elemento.titulo?.toString().toLowerCase().includes(terminoLower);
};

function App() {
  // Estados de filtros
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  // Estado para tipo de elemento
  const [tipoElemento, setTipoElemento] = useState('concesiones');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  
  // Estados de visualización
  const [selectedConcesion, setSelectedConcesion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [panelVisible, setPanelVisible] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let timeoutId;
    
    const verificarDispositivoMovil = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const esMovil = window.innerWidth <= 768;
        setIsMobile(esMovil);
        if (esMovil) {
          setPanelVisible(false);
          setFiltersVisible(false);
        } else {
          setPanelVisible(true);
          setFiltersVisible(true);
        }
      }, 150);
    };
    
    verificarDispositivoMovil();
    window.addEventListener('resize', verificarDispositivoMovil);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', verificarDispositivoMovil);
    };
  }, []);

  const filteredConcesiones = useMemo(() => {
    let datosConcesionesFiltrados = CONCESIONES_PROCESADAS;
    let datosOrdenesFiltrados = ORDENES_PROCESADAS;
    
    if (tipoElemento === 'concesiones') {
      datosOrdenesFiltrados = [];
    } else if (tipoElemento === 'ordenes') {
      datosConcesionesFiltrados = [];
    }
    
    if (selectedRegion) {
      datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => c.region === selectedRegion);
    }
    
    if (selectedMunicipio) {
      datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => c.municipio === selectedMunicipio);
    }
    
    if (yearFilter) {
      datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => 
        filtrarPorAnio(c, yearFilter)
      );
    }
    
    if (activeSearchTerm.length > 2) {
      datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c =>
        buscarEnElemento(c, activeSearchTerm)
      );
      
      datosOrdenesFiltrados = datosOrdenesFiltrados.filter(o =>
        buscarEnElemento(o, activeSearchTerm)
      );
    }
    
    return [...datosConcesionesFiltrados, ...datosOrdenesFiltrados];
  }, [selectedRegion, selectedMunicipio, activeSearchTerm, yearFilter, tipoElemento]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [filteredConcesiones.length]);

  const navegarAnterior = useCallback(() => {
    if (filteredConcesiones.length === 0) return;
    const nuevoIndice = currentIndex > 0 ? currentIndex - 1 : filteredConcesiones.length - 1;
    setCurrentIndex(nuevoIndice);
    setSelectedConcesion(filteredConcesiones[nuevoIndice]);
  }, [currentIndex, filteredConcesiones]);

  const navegarSiguiente = useCallback(() => {
    if (filteredConcesiones.length === 0) return;
    const nuevoIndice = currentIndex < filteredConcesiones.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(nuevoIndice);
    setSelectedConcesion(filteredConcesiones[nuevoIndice]);
  }, [currentIndex, filteredConcesiones]);

  const manejarCambioRegion = useCallback((region) => {
    setSelectedRegion(region);
    setSelectedMunicipio('');
    setSelectedConcesion(null);
    setSearchTerm('');
    setActiveSearchTerm('');
  }, []);

  const manejarCambioMunicipio = useCallback((municipio) => {
    setSelectedMunicipio(municipio);
    setSelectedConcesion(null);
  }, []);

  const manejarBusqueda = useCallback((termino) => {
    setSearchTerm(termino);
  }, []);

  const manejarActivarBusqueda = useCallback(() => {
    setActiveSearchTerm(searchTerm);
    if (searchTerm.length > 0) {
      setSelectedRegion('');
      setSelectedMunicipio('');
    }
  }, [searchTerm]);

  const manejarLimpiarBusqueda = useCallback(() => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setSelectedConcesion(null);
  }, []);

  const manejarCambiarTipo = useCallback((tipo) => {
    setTipoElemento(tipo);
    setSelectedConcesion(null);
    setCurrentIndex(0);
  }, []);

  const manejarSeleccionElemento = useCallback((elemento) => {
    const indice = filteredConcesiones.findIndex(c => 
      elemento.tipo === 'orden_exploracion' 
        ? c.num_orden === elemento.num_orden 
        : c.titulo === elemento.titulo
    );
    setCurrentIndex(indice);
    setSelectedConcesion(elemento);
    
    if (isMobile) {
      setPanelVisible(false);
    }
  }, [filteredConcesiones, isMobile]);

  const alternarPanel = useCallback(() => {
    setPanelVisible(prev => {
      const nuevoEstado = !prev;
      if (nuevoEstado && isMobile) {
        setFiltersVisible(false);
      }
      return nuevoEstado;
    });
  }, [isMobile]);

  const alternarFiltros = useCallback(() => {
    setFiltersVisible(prev => {
      const nuevoEstado = !prev;
      if (nuevoEstado && isMobile) {
        setPanelVisible(false);
      }
      return nuevoEstado;
    });
  }, [isMobile]);

  const obtenerMunicipiosFiltrados = useMemo(() => {
    if (!selectedRegion) {
      return MUNICIPIOS_UNICOS;
    }
    return [...new Set(
      CONCESIONES_PROCESADAS
        .filter(c => c.region === selectedRegion)
        .map(c => c.municipio)
    )].sort();
  }, [selectedRegion]);

  const obtenerAniosUnicos = useMemo(() => {
    const anios = new Set();
    CONCESIONES_PROCESADAS.forEach(c => {
      if (c.fecha_inicio) {
        const partes = c.fecha_inicio.split('/');
        if (partes.length === 3) {
          let anio = partes[2];
          if (anio.length === 2) {
            anio = parseInt(anio) > 50 ? '19' + anio : '20' + anio;
          }
          anios.add(anio);
        }
      }
    });
    return Array.from(anios).sort().reverse();
  }, []);

  return (
    <div className="app-container">
      {/* ============================================================
          HEADER SUPERIOR: Título + Selector de Tipo de Elemento
          ============================================================ */}
      <header className="app-header">
        <div className="app-header-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <h1 className="app-header-title">Cartografía Minera del Estado de Guerrero</h1>
        </div>

        <div className="app-header-selector">
          <SelectorTipoElemento
            tipoSeleccionado={tipoElemento}
            onCambiarTipo={manejarCambiarTipo}
            totalConcesiones={CONCESIONES_PROCESADAS.length}
            totalOrdenes={ORDENES_PROCESADAS.length}
          />
        </div>
      </header>

      <BotonesMovil
        panelVisible={panelVisible}
        filtersVisible={filtersVisible}
        onTogglePanel={alternarPanel}
        onToggleFiltros={alternarFiltros}
      />

      <Mapa
        elementosFiltrados={filteredConcesiones}
        elementoSeleccionado={selectedConcesion}
        onSeleccionarElemento={manejarSeleccionElemento}
        regionSeleccionada={selectedRegion}
        municipioSeleccionado={selectedMunicipio}
        terminoBusqueda={activeSearchTerm}
      />

      <BarraFiltros
        visible={filtersVisible}
        panelVisible={panelVisible}
        estadoSeleccionado={selectedEstado}
        regionSeleccionada={selectedRegion}
        municipioSeleccionado={selectedMunicipio}
        filtroAnio={yearFilter}
        terminoBusqueda={searchTerm}
        regionesDisponibles={REGIONES_UNICAS}
        municipiosDisponibles={obtenerMunicipiosFiltrados}
        aniosDisponibles={obtenerAniosUnicos}
        onCambiarEstado={setSelectedEstado}
        onCambiarRegion={manejarCambioRegion}
        onCambiarMunicipio={manejarCambioMunicipio}
        onCambiarAnio={setYearFilter}
        onCambiarBusqueda={manejarBusqueda}
        onActivarBusqueda={manejarActivarBusqueda}
        onLimpiarBusqueda={manejarLimpiarBusqueda}
        elementosFiltrados={filteredConcesiones}
      />

      <PanelLateral
        visible={panelVisible}
        elementoSeleccionado={selectedConcesion}
        elementosFiltrados={filteredConcesiones}
        indiceActual={currentIndex}
        esMovil={isMobile}
        onSeleccionarElemento={manejarSeleccionElemento}
        onDeseleccionar={() => setSelectedConcesion(null)}
        onNavegarAnterior={navegarAnterior}
        onNavegarSiguiente={navegarSiguiente}
      />
    </div>
  );
}

export default App;