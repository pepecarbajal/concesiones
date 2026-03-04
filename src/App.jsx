import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './index.css';

import concesionesData from './concesiones.json';
import ordenesExploracionData from './ordenes_exploracion.json';
import areasNaturalesData from './areasNaturales.json';

import Mapa from './componentes/Mapa/Mapa';
import BarraFiltros from './componentes/BarraFiltros/BarraFiltros';
import PanelLateral from './componentes/PanelLateral/PanelLateral';
import BotonesMovil from './componentes/BotonesMovil/BotonesMovil';
import ModalEstadisticas from './componentes/ModalEstadisticas/ModalEstadisticas';
import LandingPage from './componentes/LandingPage/LandingPage';

import { procesarConcesiones, procesarOrdenesExploracion } from './utilidades/procesadorDatos';

const CONCESIONES_PROCESADAS = procesarConcesiones(concesionesData);
const ORDENES_PROCESADAS     = procesarOrdenesExploracion(ordenesExploracionData);
const AREAS_NATURALES        = areasNaturalesData;

const MUNICIPIOS_UNICOS = [...new Set(CONCESIONES_PROCESADAS.map(c => c.municipio))].sort();
const REGIONES_UNICAS   = [...new Set(CONCESIONES_PROCESADAS.map(c => c.region).filter(Boolean))].sort();

const filtrarPorAnio = (elemento, yearFilter) => {
  if (!yearFilter || !elemento.fecha_inicio) return true;
  const partes = elemento.fecha_inicio.split('/');
  if (partes.length !== 3) return false;
  let anio = partes[2];
  if (anio.length === 2) anio = parseInt(anio) > 50 ? '19' + anio : '20' + anio;
  return anio === yearFilter;
};

const buscarEnElemento = (elemento, termino) => {
  const terminoLower = termino.toLowerCase();
  const esOrden = elemento.tipo === 'orden_exploracion';
  if (esOrden) {
    return elemento.nombre?.toLowerCase().includes(terminoLower) ||
           elemento.municipio?.toLowerCase().includes(terminoLower) ||
           elemento.num_orden?.toLowerCase().includes(terminoLower);
  }
  return elemento.nombre_lote?.toLowerCase().includes(terminoLower) ||
         elemento.titular?.toString().toLowerCase().includes(terminoLower) ||
         elemento.municipio?.toLowerCase().includes(terminoLower) ||
         elemento.titulo?.toString().toLowerCase().includes(terminoLower);
};

function MapaApp() {
  const [selectedEstado, setSelectedEstado]       = useState('');
  const [selectedRegion, setSelectedRegion]       = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [yearFilter, setYearFilter]               = useState('');
  const [tipoElemento, setTipoElemento]           = useState('concesiones');
  const [searchTerm, setSearchTerm]               = useState('');
  const [activeSearchTerm, setActiveSearchTerm]   = useState('');
  const [selectedConcesion, setSelectedConcesion] = useState(null);
  const [currentIndex, setCurrentIndex]           = useState(0);
  const [panelVisible, setPanelVisible]           = useState(true);
  const [filtersVisible, setFiltersVisible]       = useState(true);
  const [isMobile, setIsMobile]                   = useState(false);
  const [modalEstadisticasVisible, setModalEstadisticasVisible] = useState(false);
  const [anpSeleccionada, setAnpSeleccionada]     = useState(null);

  useEffect(() => {
    let timeoutId;
    const verificarDispositivoMovil = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const esMovil = window.innerWidth <= 768;
        setIsMobile(esMovil);
        if (esMovil) { setPanelVisible(false); setFiltersVisible(false); }
        else          { setPanelVisible(true);  setFiltersVisible(true);  }
      }, 150);
    };
    verificarDispositivoMovil();
    window.addEventListener('resize', verificarDispositivoMovil);
    return () => { clearTimeout(timeoutId); window.removeEventListener('resize', verificarDispositivoMovil); };
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setModalEstadisticasVisible(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filteredConcesiones = useMemo(() => {
    if (tipoElemento === 'areas_naturales') return [];

    let datosConcesionesFiltrados = CONCESIONES_PROCESADAS;
    let datosOrdenesFiltrados     = ORDENES_PROCESADAS;

    if (tipoElemento === 'concesiones') datosOrdenesFiltrados     = [];
    else if (tipoElemento === 'ordenes') datosConcesionesFiltrados = [];

    if (selectedRegion)    datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => c.region === selectedRegion);
    if (selectedMunicipio) datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => c.municipio === selectedMunicipio);
    if (yearFilter)        datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => filtrarPorAnio(c, yearFilter));
    if (activeSearchTerm.length > 2) {
      datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => buscarEnElemento(c, activeSearchTerm));
      datosOrdenesFiltrados     = datosOrdenesFiltrados.filter(o => buscarEnElemento(o, activeSearchTerm));
    }

    return [...datosConcesionesFiltrados, ...datosOrdenesFiltrados];
  }, [selectedRegion, selectedMunicipio, activeSearchTerm, yearFilter, tipoElemento]);

  useEffect(() => { setCurrentIndex(0); }, [filteredConcesiones.length]);

  const navegarAnterior = useCallback(() => {
    if (!filteredConcesiones.length) return;
    const idx = currentIndex > 0 ? currentIndex - 1 : filteredConcesiones.length - 1;
    setCurrentIndex(idx); setSelectedConcesion(filteredConcesiones[idx]);
  }, [currentIndex, filteredConcesiones]);

  const navegarSiguiente = useCallback(() => {
    if (!filteredConcesiones.length) return;
    const idx = currentIndex < filteredConcesiones.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(idx); setSelectedConcesion(filteredConcesiones[idx]);
  }, [currentIndex, filteredConcesiones]);

  const manejarCambioRegion = useCallback((region) => {
    setSelectedRegion(region); setSelectedMunicipio('');
    setSelectedConcesion(null); setSearchTerm(''); setActiveSearchTerm('');
  }, []);

  const manejarCambioMunicipio    = useCallback((municipio) => { setSelectedMunicipio(municipio); setSelectedConcesion(null); }, []);
  const manejarBusqueda           = useCallback((t) => setSearchTerm(t), []);
  const manejarActivarBusqueda    = useCallback(() => {
    setActiveSearchTerm(searchTerm);
    if (searchTerm.length > 0) { setSelectedRegion(''); setSelectedMunicipio(''); }
  }, [searchTerm]);
  const manejarLimpiarBusqueda    = useCallback(() => { setSearchTerm(''); setActiveSearchTerm(''); setSelectedConcesion(null); }, []);

  const manejarCambiarTipo = useCallback((tipo) => {
    setTipoElemento(tipo);
    setSelectedConcesion(null);
    setCurrentIndex(0);
    if (tipo !== 'areas_naturales') setAnpSeleccionada(null);
  }, []);

  const manejarSeleccionElemento = useCallback((elemento) => {
    const indice = filteredConcesiones.findIndex(c =>
      elemento.tipo === 'orden_exploracion'
        ? c.num_orden === elemento.num_orden
        : c.titulo === elemento.titulo
    );
    setCurrentIndex(indice); setSelectedConcesion(elemento);
    if (isMobile) setPanelVisible(false);
  }, [filteredConcesiones, isMobile]);

  const manejarSeleccionANP = useCallback((anp) => {
    setAnpSeleccionada(anp);
    if (isMobile) setPanelVisible(false);
  }, [isMobile]);

  const alternarPanel = useCallback(() => {
    setPanelVisible(prev => { const n = !prev; if (n && isMobile) setFiltersVisible(false); return n; });
  }, [isMobile]);

  const alternarFiltros = useCallback(() => {
    setFiltersVisible(prev => { const n = !prev; if (n && isMobile) setPanelVisible(false); return n; });
  }, [isMobile]);

  const obtenerMunicipiosFiltrados = useMemo(() => {
    if (!selectedRegion) return MUNICIPIOS_UNICOS;
    return [...new Set(CONCESIONES_PROCESADAS.filter(c => c.region === selectedRegion).map(c => c.municipio))].sort();
  }, [selectedRegion]);

  const obtenerAniosUnicos = useMemo(() => {
    const anios = new Set();
    CONCESIONES_PROCESADAS.forEach(c => {
      if (c.fecha_inicio) {
        const partes = c.fecha_inicio.split('/');
        if (partes.length === 3) {
          let anio = partes[2];
          if (anio.length === 2) anio = parseInt(anio) > 50 ? '19' + anio : '20' + anio;
          anios.add(anio);
        }
      }
    });
    return Array.from(anios).sort().reverse();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-brand">
          <h1 className="app-header-title">Información Minera del Estado de Guerrero</h1>
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
        anpSeleccionada={anpSeleccionada}
        anps={AREAS_NATURALES}
        tipoElemento={tipoElemento}
        onSeleccionarANP={manejarSeleccionANP}
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
        tipoElemento={tipoElemento}
        onCambiarTipo={manejarCambiarTipo}
        totalConcesiones={CONCESIONES_PROCESADAS.length}
        totalOrdenes={ORDENES_PROCESADAS.length}
        anps={AREAS_NATURALES}
        totalANPs={AREAS_NATURALES.length}
        onSeleccionarElemento={manejarSeleccionElemento}
        onSeleccionarANP={manejarSeleccionANP}
        onDeseleccionar={() => setSelectedConcesion(null)}
        onNavegarAnterior={navegarAnterior}
        onNavegarSiguiente={navegarSiguiente}
        onMostrarEstadisticas={() => setModalEstadisticasVisible(true)}
      />

      {modalEstadisticasVisible && (
        <ModalEstadisticas
          elementosFiltrados={filteredConcesiones}
          regionSeleccionada={selectedRegion}
          municipioSeleccionado={selectedMunicipio}
          filtroAnio={yearFilter}
          onCerrar={() => setModalEstadisticasVisible(false)}
        />
      )}
    </div>
  );
}

// ── Root App with view routing ────────────────────────────────────────────────
function App() {
  // Check if user has visited before to skip landing (optional)
  const [view, setView] = useState('landing'); // 'landing' | 'map'
  const [transitioning, setTransitioning] = useState(false);

  const handleEnterMap = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      setView('map');
      setTransitioning(false);
    }, 500);
  }, []);

  return (
    <>
      <style>{`
        .view-transition {
          position: fixed;
          inset: 0;
          background: #0a0806;
          z-index: 9999;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .view-transition.active { opacity: 1; }
      `}</style>

      <div className={`view-transition ${transitioning ? 'active' : ''}`} />

      {view === 'landing' ? (
        <LandingPage onEnterMap={handleEnterMap} />
      ) : (
        <MapaApp />
      )}
    </>
  );
}

export default App;