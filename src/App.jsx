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
import LoginPage from './componentes/LoginPage/LoginPage';

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

// ── MapaApp ───────────────────────────────────────────────────────────────────
function MapaApp({ tipoInicial, visible, onRegresarLanding, onLogout }) {
  const [selectedEstado, setSelectedEstado]       = useState('');
  const [selectedRegion, setSelectedRegion]       = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [yearFilter, setYearFilter]               = useState('');
  const [tipoElemento, setTipoElemento]           = useState(tipoInicial || 'concesiones');
  const [searchTerm, setSearchTerm]               = useState('');
  const [activeSearchTerm, setActiveSearchTerm]   = useState('');
  const [selectedConcesion, setSelectedConcesion] = useState(null);
  const [currentIndex, setCurrentIndex]           = useState(0);
  const [panelVisible, setPanelVisible]           = useState(true);
  const [filtersVisible, setFiltersVisible]       = useState(true);
  const [isMobile, setIsMobile]                   = useState(false);
  const [modalEstadisticasVisible, setModalEstadisticasVisible] = useState(false);
  const [anpSeleccionada, setAnpSeleccionada]     = useState(null);

  // Los filtros solo aplican (y deben mostrarse) en la vista de concesiones
  const mostrarFiltros = tipoElemento === 'concesiones' && filtersVisible;

  useEffect(() => {
    if (tipoInicial) setTipoElemento(tipoInicial);
  }, [tipoInicial]);

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
    // Filtros de región / municipio / año solo aplican a concesiones
    if (tipoElemento === 'concesiones') {
      if (selectedRegion)    datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => c.region === selectedRegion);
      if (selectedMunicipio) datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => c.municipio === selectedMunicipio);
      if (yearFilter)        datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => filtrarPorAnio(c, yearFilter));
      if (selectedEstado)    datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => c.estado === selectedEstado);
    }
    if (activeSearchTerm.length > 2) {
      datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => buscarEnElemento(c, activeSearchTerm));
      datosOrdenesFiltrados     = datosOrdenesFiltrados.filter(o => buscarEnElemento(o, activeSearchTerm));
    }
    return [...datosConcesionesFiltrados, ...datosOrdenesFiltrados];
  }, [selectedRegion, selectedMunicipio, activeSearchTerm, yearFilter, selectedEstado, tipoElemento]);

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

  const manejarCambioMunicipio = useCallback((municipio) => {
    setSelectedMunicipio(municipio); setSelectedConcesion(null);
  }, []);
  const manejarBusqueda        = useCallback((t) => setSearchTerm(t), []);
  const manejarActivarBusqueda = useCallback(() => {
    setActiveSearchTerm(searchTerm);
    if (searchTerm.length > 0) { setSelectedRegion(''); setSelectedMunicipio(''); }
  }, [searchTerm]);
  const manejarLimpiarBusqueda = useCallback(() => {
    setSearchTerm(''); setActiveSearchTerm(''); setSelectedConcesion(null);
  }, []);

  const manejarCambiarTipo = useCallback((tipo) => {
    setTipoElemento(tipo); setSelectedConcesion(null); setCurrentIndex(0);
    if (tipo !== 'areas_naturales') setAnpSeleccionada(null);
    // Limpiar filtros al cambiar de sección
    setSelectedRegion(''); setSelectedMunicipio(''); setYearFilter('');
    setSelectedEstado(''); setSearchTerm(''); setActiveSearchTerm('');
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
    // El botón de filtros solo actúa en concesiones
    if (tipoElemento !== 'concesiones') return;
    setFiltersVisible(prev => { const n = !prev; if (n && isMobile) setPanelVisible(false); return n; });
  }, [isMobile, tipoElemento]);

  const obtenerMunicipiosFiltrados = useMemo(() => {
    if (!selectedRegion) return MUNICIPIOS_UNICOS;
    return [...new Set(
      CONCESIONES_PROCESADAS.filter(c => c.region === selectedRegion).map(c => c.municipio)
    )].sort();
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
    <div className="app-container" style={{ display: visible ? 'block' : 'none' }}>
      <header className="app-header">
        <button className="btn-regresar" onClick={onRegresarLanding} title="Regresar al inicio">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span className="btn-regresar-label">Inicio</span>
        </button>
        <div className="app-header-brand">
          <h1 className="app-header-title">Información Minera del Estado de Guerrero</h1>
        </div>
        <div className="app-header-actions">
          <button className="btn-salir" onClick={onLogout} title="Cerrar sesión">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            <span className="btn-salir-label">Salir</span>
          </button>
        </div>
      </header>

      {/* En móvil, el botón de filtros solo aparece en la vista de concesiones */}
      <BotonesMovil
        panelVisible={panelVisible}
        filtersVisible={filtersVisible}
        mostrarBtnFiltros={tipoElemento === 'concesiones'}
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

      {/* Barra de filtros: solo se renderiza y muestra para concesiones */}
      <BarraFiltros
        visible={mostrarFiltros}
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
        anpSeleccionadaExterna={anpSeleccionada}
        onSeleccionarElemento={manejarSeleccionElemento}
        onSeleccionarANP={manejarSeleccionANP}
        onDeseleccionar={() => setSelectedConcesion(null)}
        onNavegarAnterior={navegarAnterior}
        onNavegarSiguiente={navegarSiguiente}
        onMostrarEstadisticas={() => setModalEstadisticasVisible(true)}
      />

      {modalEstadisticasVisible && (
        <ModalEstadisticas
          elementosFiltrados={tipoElemento === 'areas_naturales' ? [] : filteredConcesiones}
          anps={tipoElemento === 'areas_naturales' ? AREAS_NATURALES : []}
          tipoElemento={tipoElemento}
          regionSeleccionada={selectedRegion}
          municipioSeleccionado={selectedMunicipio}
          filtroAnio={yearFilter}
          onCerrar={() => setModalEstadisticasVisible(false)}
          totalConcesionesGuerrero={CONCESIONES_PROCESADAS.reduce((s, c) => s + parseFloat(c.superficie || 0), 0)}
          totalOrdenesGuerrero={ORDENES_PROCESADAS.reduce((s, o) => s + parseFloat(o.superficie || 0), 0)}
        />
      )}
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
function App() {
  const [view, setView]               = useState('login');
  const [tipoInicial, setTipoInicial] = useState('concesiones');
  const [transitioning, setTransitioning] = useState(false);
  const [mapaListo, setMapaListo]     = useState(false);

  const handleLoginExitoso = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => { setView('landing'); setTransitioning(false); }, 400);
  }, []);

  const handleEnterMap = useCallback((tipo) => {
    setTipoInicial(tipo || 'concesiones');
    setTransitioning(true);
    setTimeout(() => { setMapaListo(true); setView('map'); setTransitioning(false); }, 500);
  }, []);

  const handleRegresarLanding = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => { setView('landing'); setTransitioning(false); }, 500);
  }, []);

  const handleLogout = useCallback(async () => {
    try { await fetch('/api/logout', { credentials: 'same-origin' }); } catch { /* ignorar */ }
    setView('login'); setMapaListo(false);
  }, []);

  return (
    <>
      <style>{`
        .view-transition {
          position: fixed; inset: 0; background: #08070a;
          z-index: 9999; pointer-events: none;
          opacity: 0; transition: opacity 0.5s ease;
        }
        .view-transition.active { opacity: 1; }
        .btn-regresar, .btn-salir {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; background: var(--acento-claro);
          border: 1px solid var(--hairline); border-radius: 9px;
          color: var(--acento-oscuro); font-size: 13px; font-weight: 600; font-family: inherit;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .btn-regresar:hover { background: var(--superficie); border-color: #D7DEE3; transform: translateX(-2px); }
        .btn-regresar svg { flex-shrink: 0; transition: transform 0.2s ease; }
        .btn-regresar:hover svg { transform: translateX(-2px); }
        .app-header-actions { margin-left: auto; display: flex; align-items: center; flex-shrink: 0; }
        .btn-salir { color: var(--tinta-2); }
        .btn-salir:hover {
          background: rgba(220, 38, 38, 0.07); border-color: rgba(220, 38, 38, 0.3);
          color: #B91C1C; transform: translateY(-1px);
        }
        @media (max-width: 768px) {
          .btn-regresar-label, .btn-salir-label { display: none; }
          .btn-regresar, .btn-salir { padding: 7px 10px; }
        }
        .panel-btn-estadisticas {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          margin-top: 14px; padding: 8px 16px; width: 100%;
          background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.25);
          border-radius: 9px; color: white; font-size: 12px; font-weight: 600;
          font-family: inherit; cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .panel-btn-estadisticas:hover { background: rgba(255,255,255,0.24); border-color: rgba(255,255,255,0.4); }
      `}</style>

      <div className={`view-transition ${transitioning ? 'active' : ''}`} />

      {view === 'login' && <LoginPage onLoginExitoso={handleLoginExitoso} />}

      <div style={{ display: view === 'landing' ? 'block' : 'none' }}>
        <LandingPage onEnterMap={handleEnterMap} />
      </div>

      {mapaListo && (
        <MapaApp
          tipoInicial={tipoInicial}
          visible={view === 'map'}
          onRegresarLanding={handleRegresarLanding}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;