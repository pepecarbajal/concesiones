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
  
  // ============================================================================
  // NUEVO: Estado para tipo de elemento (concesiones, órdenes, o todos)
  // Por defecto muestra concesiones
  // ============================================================================
  const [tipoElemento, setTipoElemento] = useState('concesiones');
  
  // ============================================================================
  // OPTIMIZACIÓN CRÍTICA: Separar el valor del input del término de búsqueda activo
  // searchTerm: Lo que el usuario escribe (se actualiza instantáneamente)
  // activeSearchTerm: El término que realmente se usa para filtrar (solo al hacer click)
  // ============================================================================
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  
  // Estados de visualización
  const [selectedConcesion, setSelectedConcesion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [panelVisible, setPanelVisible] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // ============================================================================
  // OPTIMIZACIÓN: Debounce en resize
  // ============================================================================
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

  // ============================================================================
  // OPTIMIZACIÓN: Memoizar elementos filtrados
  // SOLO filtra cuando activeSearchTerm cambia (al hacer click en Buscar)
  // NUEVO: También filtra por tipo de elemento seleccionado
  // ============================================================================
  const filteredConcesiones = useMemo(() => {
    let datosConcesionesFiltrados = CONCESIONES_PROCESADAS;
    let datosOrdenesFiltrados = ORDENES_PROCESADAS;
    
    // ============================================================================
    // NUEVO: Filtrar por tipo de elemento PRIMERO
    // ============================================================================
    if (tipoElemento === 'concesiones') {
      // Solo concesiones, no órdenes
      datosOrdenesFiltrados = [];
    } else if (tipoElemento === 'ordenes') {
      // Solo órdenes, no concesiones
      datosConcesionesFiltrados = [];
    }
    // Si tipoElemento === 'todos', se mantienen ambos
    
    // Filtrar por región
    if (selectedRegion) {
      datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => c.region === selectedRegion);
    }
    
    // Filtrar por municipio
    if (selectedMunicipio) {
      datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => c.municipio === selectedMunicipio);
    }
    
    // Filtrar por año
    if (yearFilter) {
      datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => 
        filtrarPorAnio(c, yearFilter)
      );
    }
    
    // ============================================================================
    // CLAVE: Solo filtra por búsqueda cuando activeSearchTerm tiene valor
    // Esto significa que el input puede actualizarse libremente sin causar filtrado
    // ============================================================================
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

  // Resetear índice cuando cambien elementos filtrados
  useEffect(() => {
    setCurrentIndex(0);
  }, [filteredConcesiones.length]);

  // ============================================================================
  // Funciones de navegación
  // ============================================================================
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

  // ============================================================================
  // Handlers de filtros
  // ============================================================================
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

  // ============================================================================
  // CLAVE: Handler de búsqueda que NO causa re-render del filtrado
  // Solo actualiza el estado local del input
  // ============================================================================
  const manejarBusqueda = useCallback((termino) => {
    setSearchTerm(termino);
    // NO actualiza activeSearchTerm aquí - eso solo pasa al hacer click en Buscar
  }, []);

  // ============================================================================
  // CLAVE: Solo al hacer click en "Buscar" se activa el filtrado real
  // ============================================================================
  const manejarActivarBusqueda = useCallback(() => {
    setActiveSearchTerm(searchTerm);
    
    // Limpiar otros filtros cuando hay búsqueda
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

  // ============================================================================
  // NUEVO: Handler para cambiar tipo de elemento
  // ============================================================================
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

  // ============================================================================
  // Memoizar municipios y años
  // ============================================================================
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
      <BotonesMovil
        panelVisible={panelVisible}
        filtersVisible={filtersVisible}
        onTogglePanel={alternarPanel}
        onToggleFiltros={alternarFiltros}
      />

      {/* ============================================================================
          NUEVO: Selector de tipo de elemento (Concesiones / Órdenes / Todos)
          ============================================================================ */}
      <SelectorTipoElemento
        tipoSeleccionado={tipoElemento}
        onCambiarTipo={manejarCambiarTipo}
        totalConcesiones={CONCESIONES_PROCESADAS.length}
        totalOrdenes={ORDENES_PROCESADAS.length}
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