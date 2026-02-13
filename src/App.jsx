import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './index.css';

// Importar datos
import concesionesData from './concesiones.json';
import ordenesExploracionData from './ordenes_exploracion.json';

// Importar componentes
import Mapa from './componentes/Mapa/Mapa';
import BarraFiltros from './componentes/BarraFiltros/BarraFiltros';
import PanelLateral from './componentes/PanelLateral/PanelLateral';
import BotonesMovil from './componentes/BotonesMovil/BotonesMovil';

// Importar utilidades
import { procesarConcesiones, procesarOrdenesExploracion } from './utilidades/procesadorDatos';

function App() {
  // Estados principales
  const [concesiones, setConcesiones] = useState([]);
  const [ordenesExploracion, setOrdenesExploracion] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [regionesUnicas, setRegionesUnicas] = useState([]);
  
  // Estados de filtros
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  // Estados de visualización
  const [selectedConcesion, setSelectedConcesion] = useState(null);
  const [filteredConcesiones, setFilteredConcesiones] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [panelVisible, setPanelVisible] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar dispositivo móvil
  useEffect(() => {
    const verificarDispositivoMovil = () => {
      const esMovil = window.innerWidth <= 768;
      setIsMobile(esMovil);
      if (esMovil) {
        setPanelVisible(false);
        setFiltersVisible(false);
      } else {
        setPanelVisible(true);
        setFiltersVisible(true);
      }
    };
    
    verificarDispositivoMovil();
    window.addEventListener('resize', verificarDispositivoMovil);
    return () => window.removeEventListener('resize', verificarDispositivoMovil);
  }, []);

  // Cargar y procesar datos iniciales
  useEffect(() => {
    const datosProcesados = procesarConcesiones(concesionesData);
    setConcesiones(datosProcesados);
    
    const municipiosUnicos = [...new Set(datosProcesados.map(c => c.municipio))].sort();
    setMunicipios(municipiosUnicos);

    const regionesUnicas = [...new Set(datosProcesados.map(c => c.region).filter(Boolean))].sort();
    setRegionesUnicas(regionesUnicas);
    
    const ordenesProcesadas = procesarOrdenesExploracion(ordenesExploracionData);
    setOrdenesExploracion(ordenesProcesadas);
  }, []);

  // Aplicar filtros a los datos
  useEffect(() => {
    let datosConcesionesFiltrados = [...concesiones];
    let datosOrdenesFiltrados = [...ordenesExploracion];
    
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
      datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c => {
        if (c.fecha_inicio) {
          const partes = c.fecha_inicio.split('/');
          if (partes.length === 3) {
            let anio = partes[2];
            if (anio.length === 2) {
              anio = parseInt(anio) > 50 ? '19' + anio : '20' + anio;
            }
            return anio === yearFilter;
          }
        }
        return false;
      });
    }
    
    // Filtrar por término de búsqueda SOLO cuando activeSearchTerm tenga valor
    if (activeSearchTerm.length > 2) {
      const termino = activeSearchTerm.toLowerCase();
      datosConcesionesFiltrados = datosConcesionesFiltrados.filter(c =>
        c.nombre_lote?.toLowerCase().includes(termino) ||
        c.titular?.toLowerCase().includes(termino) ||
        c.municipio?.toLowerCase().includes(termino) ||
        c.titulo?.toString().toLowerCase().includes(termino)
      );
      
      datosOrdenesFiltrados = datosOrdenesFiltrados.filter(o =>
        o.nombre?.toLowerCase().includes(termino) ||
        o.municipio?.toLowerCase().includes(termino) ||
        o.num_orden?.toLowerCase().includes(termino)
      );
    }
    
    // Combinar ambas listas
    const datosCombinados = [...datosConcesionesFiltrados, ...datosOrdenesFiltrados];
    setFilteredConcesiones(datosCombinados);
    setCurrentIndex(0);
  }, [selectedRegion, selectedMunicipio, activeSearchTerm, concesiones, ordenesExploracion, yearFilter]);

  // Funciones de navegación
  const navegarAnterior = () => {
    if (filteredConcesiones.length === 0) return;
    
    const nuevoIndice = currentIndex > 0 ? currentIndex - 1 : filteredConcesiones.length - 1;
    setCurrentIndex(nuevoIndice);
    setSelectedConcesion(filteredConcesiones[nuevoIndice]);
  };

  const navegarSiguiente = () => {
    if (filteredConcesiones.length === 0) return;
    
    const nuevoIndice = currentIndex < filteredConcesiones.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(nuevoIndice);
    setSelectedConcesion(filteredConcesiones[nuevoIndice]);
  };

  // Funciones de manejo de eventos optimizadas con useCallback
  const manejarCambioRegion = useCallback((region) => {
    setSelectedRegion(region);
    setSelectedMunicipio('');
    setSelectedConcesion(null);
    setSearchTerm('');
    setActiveSearchTerm(''); // Limpiar búsqueda activa
  }, []);

  const manejarCambioMunicipio = useCallback((municipio) => {
    setSelectedMunicipio(municipio);
    setSelectedConcesion(null);
  }, []);

  const manejarBusqueda = useCallback((termino) => {
    setSearchTerm(termino);
    // No hacer nada más aquí para evitar lag
  }, []);

  const manejarActivarBusqueda = useCallback(() => {
    // Activar la búsqueda solo cuando se hace clic en el botón
    setActiveSearchTerm(searchTerm);
    
    // Limpiar otros filtros solo cuando hay un término de búsqueda
    if (searchTerm.length > 0) {
      setSelectedRegion('');
      setSelectedMunicipio('');
    }
  }, [searchTerm]);

  const manejarLimpiarBusqueda = useCallback(() => {
    setSearchTerm('');
    setActiveSearchTerm(''); // Importante: limpiar también el término activo
    setSelectedConcesion(null);
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
    const nuevoEstado = !panelVisible;
    setPanelVisible(nuevoEstado);
    if (nuevoEstado && isMobile) {
      setFiltersVisible(false);
    }
  }, [panelVisible, isMobile]);

  const alternarFiltros = useCallback(() => {
    const nuevoEstado = !filtersVisible;
    setFiltersVisible(nuevoEstado);
    if (nuevoEstado && isMobile) {
      setPanelVisible(false);
    }
  }, [filtersVisible, isMobile]);

  const obtenerMunicipiosFiltrados = useMemo(() => {
    if (!selectedRegion) {
      return municipios;
    }
    const municipiosDeRegion = [...new Set(
      concesiones
        .filter(c => c.region === selectedRegion)
        .map(c => c.municipio)
    )].sort();
    return municipiosDeRegion;
  }, [selectedRegion, municipios, concesiones]);

  const obtenerAniosUnicos = useMemo(() => {
    const anios = new Set();
    concesiones.forEach(c => {
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
  }, [concesiones]);

  return (
    <div className="app-container">
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
        terminoBusqueda={searchTerm}
      />

      <BarraFiltros
        visible={filtersVisible}
        panelVisible={panelVisible}
        estadoSeleccionado={selectedEstado}
        regionSeleccionada={selectedRegion}
        municipioSeleccionado={selectedMunicipio}
        filtroAnio={yearFilter}
        terminoBusqueda={searchTerm}
        regionesDisponibles={regionesUnicas}
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