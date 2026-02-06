import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './index.css';
import concesionesData from './concesiones.json';

// Token de Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoicGVwZWxlcGV3IiwiYSI6ImNtbDhjNGsxNzA2aGszZ3B1N2J2eHZyZ2MifQ.DMWYi_J2wZ9wjsHy-s4kXg';

// Funcion para convertir coordenadas DMS a decimal
const dmsToDecimal = (dms) => {
  if (!dms) return null;
  
  const regex = /(\d+)\u00b0(\d+)\u2032([\d.]+)\u2033([NSEW])/;
  const match = dms.match(regex);
  
  if (!match) return null;
  
  const degrees = parseFloat(match[1]);
  const minutes = parseFloat(match[2]);
  const seconds = parseFloat(match[3]);
  const direction = match[4];
  
  let decimal = degrees + minutes / 60 + seconds / 3600;
  
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  
  return decimal;
};

// Procesar concesiones y convertir coordenadas
const processConcesiones = (data) => {
  return data.map(concesion => {
    const lat = dmsToDecimal(concesion.latitud);
    const lng = dmsToDecimal(concesion.longitud);
    
    return {
      ...concesion,
      coords: lng && lat ? [lng, lat] : null
    };
  }).filter(c => c.coords !== null);
};

// Regiones de Guerrero con coordenadas para el flyTo del mapa
const regionesCoords = {
  'Acapulco': { coords: [-99.8901, 16.8531], zoom: 11 },
  'Norte': { coords: [-99.5398, 18.3444], zoom: 9 },
  'Centro': { coords: [-99.5008, 17.5509], zoom: 9 },
  'Montaña': { coords: [-98.5761, 17.5453], zoom: 9 },
  'Costa Chica': { coords: [-98.4102, 16.6850], zoom: 9 },
  'Costa Grande': { coords: [-101.5518, 17.6413], zoom: 9 },
  'Tierra Caliente': { coords: [-100.5, 18.2], zoom: 9 },
  'Sierra': { coords: [-99.85, 17.65], zoom: 10 }
};

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const coordinatesPopup = useRef(null);
  const isNavigating = useRef(false); // Flag para prevenir clicks multiples
  
  const [concesiones, setConcesiones] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [regionesUnicas, setRegionesUnicas] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConcesion, setSelectedConcesion] = useState(null);
  const [filteredConcesiones, setFilteredConcesiones] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [yearFilter, setYearFilter] = useState('');
  const [panelVisible, setPanelVisible] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar mobile y ocultar panel/filtros por defecto en movil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setPanelVisible(false);
        setFiltersVisible(false);
      } else {
        setPanelVisible(true);
        setFiltersVisible(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cargar concesiones al montar el componente
  useEffect(() => {
    const processed = processConcesiones(concesionesData);
    setConcesiones(processed);
    
    const uniqueMunicipios = [...new Set(processed.map(c => c.municipio))].sort();
    setMunicipios(uniqueMunicipios);

    // Extraer regiones unicas desde el JSON
    const uniqueRegiones = [...new Set(processed.map(c => c.region).filter(Boolean))].sort();
    setRegionesUnicas(uniqueRegiones);
  }, []);

  // Filtrar concesiones segun los criterios
  useEffect(() => {
    let filtered = [...concesiones];
    
    // Filtrar por region (usando campo region del JSON)
    if (selectedRegion) {
      filtered = filtered.filter(c => c.region === selectedRegion);
    }
    
    // Filtrar por municipio
    if (selectedMunicipio) {
      filtered = filtered.filter(c => c.municipio === selectedMunicipio);
    }
    
    // Filtrar por anio (usando fecha_inicio)
    if (yearFilter) {
      filtered = filtered.filter(c => {
        if (c.fecha_inicio) {
          const parts = c.fecha_inicio.split('/');
          if (parts.length === 3) {
            let year = parts[2];
            if (year.length === 2) {
              year = parseInt(year) > 50 ? '19' + year : '20' + year;
            }
            return year === yearFilter;
          }
        }
        return false;
      });
    }
    
    // Filtrar por busqueda
    if (searchTerm.length > 2) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.nombre_lote?.toLowerCase().includes(term) ||
        c.titular?.toLowerCase().includes(term) ||
        c.municipio?.toLowerCase().includes(term) ||
        c.titulo?.toString().toLowerCase().includes(term)
      );
    }
    
    setFilteredConcesiones(filtered);
    setCurrentIndex(0);
  }, [selectedRegion, selectedMunicipio, searchTerm, concesiones, yearFilter]);

  // Inicializar el mapa
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/pepelepew/cml8d6k0c00d301s3hjayaqcs',
      center: [-99.5008, 17.5509],
      zoom: 8
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }, []);

  // Actualizar marcadores cuando cambien las concesiones filtradas
  useEffect(() => {
    if (!map.current) return;

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    filteredConcesiones.forEach(concesion => {
      const el = document.createElement('div');
      el.className = 'custom-marker-concesion';
      el.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
              <feOffset dx="0" dy="1" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge> 
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>
          <circle cx="12" cy="10" r="8" fill="${concesion.estado === 'Vigente' ? '#FF4444' : '#999999'}" filter="url(#shadow)"/>
          <circle cx="12" cy="10" r="6.5" fill="${concesion.estado === 'Vigente' ? '#FF6666' : '#AAAAAA'}"/>
          <circle cx="12" cy="10" r="3" fill="white"/>
          <path d="M12 18 L10 23 L12 21 L14 23 Z" fill="${concesion.estado === 'Vigente' ? '#CC0000' : '#666666'}" filter="url(#shadow)"/>
          <circle cx="12" cy="10" r="1.5" fill="${concesion.estado === 'Vigente' ? '#FF4444' : '#999999'}"/>
        </svg>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat(concesion.coords)
        .addTo(map.current);

      el.addEventListener('click', () => {
        const index = filteredConcesiones.findIndex(c => c.titulo === concesion.titulo);
        setCurrentIndex(index);
        setSelectedConcesion(concesion);
        showCoordinatesPopup(concesion);
        
        map.current.flyTo({
          center: concesion.coords,
          zoom: 14,
          duration: 1500
        });
      });

      markers.current.push(marker);
    });

    if (filteredConcesiones.length > 0 && !selectedMunicipio && !selectedRegion && searchTerm.length === 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredConcesiones.forEach(c => bounds.extend(c.coords));
      map.current.fitBounds(bounds, { padding: 100, maxZoom: 12 });
    }
  }, [filteredConcesiones, selectedMunicipio, selectedRegion, searchTerm]);

  // Mostrar popup de coordenadas flotante
  const showCoordinatesPopup = useCallback((concesion) => {
    if (coordinatesPopup.current) {
      coordinatesPopup.current.remove();
    }

    coordinatesPopup.current = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      offset: 25,
      className: 'coordinates-popup'
    })
      .setLngLat(concesion.coords)
      .setHTML(`
        <div style="
          padding: 12px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          min-width: 250px;
        ">
          <div style="
            font-size: 13px;
            font-weight: 700;
            color: #1F2937;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 2px solid #667eea;
          ">
            ${concesion.nombre_lote}
          </div>
          <div style="font-size: 12px; color: #6B7280; margin-bottom: 10px;">
            <strong>Coordenadas DMS:</strong>
          </div>
          <div style="font-size: 11px; color: #374151; line-height: 1.6; margin-bottom: 8px;">
            <div>Latitud: ${concesion.latitud}</div>
            <div>Longitud: ${concesion.longitud}</div>
          </div>
          <div style="font-size: 12px; color: #6B7280; margin-bottom: 6px;">
            <strong>Coordenadas Decimales:</strong>
          </div>
          <div style="font-size: 11px; color: #374151; line-height: 1.6;">
            <div>${concesion.coords[1].toFixed(6)}, ${concesion.coords[0].toFixed(6)}</div>
          </div>
        </div>
      `)
      .addTo(map.current);
  }, []);

  // Manejar cambio de region
  const handleRegionChange = (e) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedMunicipio('');
    setSelectedConcesion(null);
    setSearchTerm('');
    
    if (region && regionesCoords[region]) {
      const selected = regionesCoords[region];
      if (map.current) {
        map.current.flyTo({
          center: selected.coords,
          zoom: selected.zoom,
          duration: 2000
        });
      }
    } else {
      map.current.flyTo({
        center: [-99.5008, 17.5509],
        zoom: 8,
        duration: 2000
      });
    }
  };

  // Manejar cambio de municipio
  const handleMunicipioChange = (e) => {
    const municipio = e.target.value;
    setSelectedMunicipio(municipio);
    setSelectedConcesion(null);
    
    if (municipio && map.current) {
      const concesionesMunicipio = concesiones.filter(c => c.municipio === municipio);
      
      if (concesionesMunicipio.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        concesionesMunicipio.forEach(c => bounds.extend(c.coords));
        map.current.fitBounds(bounds, { padding: 80, maxZoom: 13 });
      }
    }
  };

  // Manejar busqueda
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setSelectedConcesion(null);
  };

  // Seleccionar concesion de busqueda
  const handleConcesionClick = (concesion) => {
    const index = filteredConcesiones.findIndex(c => c.titulo === concesion.titulo);
    setCurrentIndex(index);
    setSelectedConcesion(concesion);
    showCoordinatesPopup(concesion);
    
    // En movil, ocultar panel para mostrar el mapa
    if (isMobile) {
      setPanelVisible(false);
    }
    
    if (map.current) {
      map.current.flyTo({
        center: concesion.coords,
        zoom: 14,
        duration: 1500
      });
    }
  };

  // Navegar a la concesion anterior - CON PROTECCIÓN CONTRA CLICKS RÁPIDOS
  const handlePrevious = useCallback(() => {
    if (filteredConcesiones.length === 0 || isNavigating.current) return;
    
    isNavigating.current = true;
    
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex > 0 ? prevIndex - 1 : filteredConcesiones.length - 1;
      const concesion = filteredConcesiones[newIndex];
      
      if (concesion) {
        setSelectedConcesion(concesion);
        showCoordinatesPopup(concesion);
        
        if (map.current) {
          map.current.flyTo({
            center: concesion.coords,
            zoom: 14,
            duration: 1000
          });
        }
      }
      
      // Liberar el flag después de un delay
      setTimeout(() => {
        isNavigating.current = false;
      }, 300);
      
      return newIndex;
    });
  }, [filteredConcesiones, showCoordinatesPopup]);

  // Navegar a la concesion siguiente - CON PROTECCIÓN CONTRA CLICKS RÁPIDOS
  const handleNext = useCallback(() => {
    if (filteredConcesiones.length === 0 || isNavigating.current) return;
    
    isNavigating.current = true;
    
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex < filteredConcesiones.length - 1 ? prevIndex + 1 : 0;
      const concesion = filteredConcesiones[newIndex];
      
      if (concesion) {
        setSelectedConcesion(concesion);
        showCoordinatesPopup(concesion);
        
        if (map.current) {
          map.current.flyTo({
            center: concesion.coords,
            zoom: 14,
            duration: 1000
          });
        }
      }
      
      // Liberar el flag después de un delay
      setTimeout(() => {
        isNavigating.current = false;
      }, 300);
      
      return newIndex;
    });
  }, [filteredConcesiones, showCoordinatesPopup]);

  // Obtener municipios filtrados por region usando datos del JSON
  const getMunicipiosFiltrados = () => {
    if (!selectedRegion) {
      return municipios;
    }
    // Extraer municipios unicos de la region seleccionada directamente del JSON
    const municipiosDeRegion = [...new Set(
      concesiones
        .filter(c => c.region === selectedRegion)
        .map(c => c.municipio)
    )].sort();
    return municipiosDeRegion;
  };

  // Funcion para descargar Excel con las concesiones filtradas
  const handleDownloadExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      
      const dataToExport = filteredConcesiones.map(c => ({
        'No.': c['No.'] || '',
        'Nombre del Lote': c.nombre_lote || '',
        'Titulo': c.titulo || '',
        'Fecha de Expedicion': c.fecha_expedicion || '',
        'Fecha de Inicio': c.fecha_inicio || '',
        'Fecha de Fin': c.fecha_fin || '',
        'Superficie (ha)': c.superficie || '',
        'Titular': c.titular || '',
        'Municipio': c.municipio || '',
        'Region': c.region || '',
        'Latitud': c.latitud || '',
        'Longitud': c.longitud || '',
        'Coordenadas Decimales': c.coords ? `${c.coords[1].toFixed(6)}, ${c.coords[0].toFixed(6)}` : '',
        'Estado': c.estado || ''
      }));
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      
      const colWidths = [
        { wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 18 },
        { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 35 },
        { wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
        { wch: 25 }, { wch: 12 }
      ];
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Concesiones');
      
      let fileName = 'Concesiones_Mineras';
      if (selectedRegion) fileName += `_${selectedRegion}`;
      if (selectedMunicipio) fileName += `_${selectedMunicipio}`;
      if (yearFilter) fileName += `_${yearFilter}`;
      fileName += `.xlsx`;
      
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error al generar el archivo Excel:', error);
      alert('Hubo un error al generar el archivo Excel. Por favor intente nuevamente.');
    }
  };

  // Obtener anios unicos
  const getYearsUnicos = () => {
    const years = new Set();
    concesiones.forEach(c => {
      if (c.fecha_inicio) {
        const parts = c.fecha_inicio.split('/');
        if (parts.length === 3) {
          let year = parts[2];
          if (year.length === 2) {
            year = parseInt(year) > 50 ? '19' + year : '20' + year;
          }
          years.add(year);
        }
      }
    });
    return Array.from(years).sort().reverse();
  };

  // Toggle para panel de informacion en movil
  const togglePanel = () => {
    const next = !panelVisible;
    setPanelVisible(next);
    if (next && isMobile) {
      setFiltersVisible(false);
    }
  };

  // Toggle para filtros en movil
  const toggleFilters = () => {
    const next = !filtersVisible;
    setFiltersVisible(next);
    if (next && isMobile) {
      setPanelVisible(false);
    }
  };

  return (
    <div className="app-container">
      {/* Botones toggle en movil */}
      <div className="mobile-toggle-buttons">
        <button
          className={`btn-toggle-panel ${panelVisible ? 'active' : ''}`}
          onClick={togglePanel}
          aria-label={panelVisible ? 'Cerrar panel de informacion' : 'Abrir panel de informacion'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {panelVisible ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </>
            )}
          </svg>
          <span>{panelVisible ? 'Cerrar' : 'Informacion'}</span>
        </button>

        <button
          className={`btn-toggle-filters ${filtersVisible ? 'active' : ''}`}
          onClick={toggleFilters}
          aria-label={filtersVisible ? 'Cerrar filtros' : 'Abrir filtros'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {filtersVisible ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </>
            )}
          </svg>
          <span>{filtersVisible ? 'Cerrar' : 'Filtros'}</span>
        </button>
      </div>

      {/* Mapa de fondo */}
      <div ref={mapContainer} className="map-container" />

      {/* Barra de filtros */}
      <div className={`filters-bar ${filtersVisible ? 'filters-visible' : 'filters-hidden'} ${!panelVisible ? 'filters-no-panel' : ''}`}>
        <div className="filters-bar-header">
          <span className="filters-bar-title">Filtros de Busqueda</span>
        </div>
        <div className="filters-bar-content">
          {/* Filtro por Region */}
          <select
            value={selectedRegion}
            onChange={handleRegionChange}
            className="filter-select"
          >
            <option value="">Todas las regiones</option>
            {regionesUnicas.map(region => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          {/* Filtro por Municipio */}
          <select
            value={selectedMunicipio}
            onChange={handleMunicipioChange}
            className="filter-select filter-select-municipio"
          >
            <option value="">Todos los municipios</option>
            {getMunicipiosFiltrados().map(municipio => (
              <option key={municipio} value={municipio}>
                {municipio}
              </option>
            ))}
          </select>

          {/* Filtro por Anio */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="filter-select filter-select-year"
          >
            <option value="">Todos los anios</option>
            {getYearsUnicos().map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Barra de busqueda */}
          <input
            type="text"
            placeholder="Buscar concesion..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />

          {/* Boton de descarga Excel */}
          <button
            onClick={handleDownloadExcel}
            className="btn-download"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Excel
          </button>
        </div>
      </div>

      {/* Panel lateral izquierdo */}
      <div className={`side-panel ${panelVisible ? 'panel-visible' : 'panel-hidden'}`}>
        {selectedConcesion ? (
          <div className="side-panel-content">
            {/* Header con navegacion */}
            <div className="panel-header">
              <div className="navigation-controls">
                <button
                  onClick={handlePrevious}
                  disabled={filteredConcesiones.length === 0}
                  className="btn-nav"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Anterior
                </button>
                
                <span className="navigation-counter">
                  {currentIndex + 1} / {filteredConcesiones.length}
                </span>
                
                <button
                  onClick={handleNext}
                  disabled={filteredConcesiones.length === 0}
                  className="btn-nav"
                >
                  Siguiente
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              <button
                onClick={() => setSelectedConcesion(null)}
                className="btn-back"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Volver a la lista
              </button>
              
              <h2 className="concesion-header-title">
                {selectedConcesion.nombre_lote}
              </h2>
              
              <div className={`status-badge ${selectedConcesion.estado === 'Vigente' ? 'vigente' : 'no-vigente'}`}>
                <span className="status-dot">{'\u25CF'}</span>
                {selectedConcesion.estado || 'N/A'}
              </div>
            </div>

            {/* Contenido con scroll */}
            <div className="scrollable-content">
              <div className="info-rows">
                <div className="info-row">
                  <div className="info-label">Titular(es)</div>
                  <div className="info-value">
                    {selectedConcesion.titular ? (
                      selectedConcesion.titular.includes('|') ? (
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                          {selectedConcesion.titular.split('|').map((titular, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{titular.trim()}</li>
                          ))}
                        </ul>
                      ) : (
                        selectedConcesion.titular
                      )
                    ) : 'N/A'}
                  </div>
                </div>
                <InfoRow label="Titulo" value={selectedConcesion.titulo} />
                <InfoRow label="Municipio" value={selectedConcesion.municipio} />
                <InfoRow label="Region" value={selectedConcesion.region || 'N/A'} />
                <InfoRow label="Superficie" value={`${selectedConcesion.superficie} ha`} />
              </div>

              {/* Fechas */}
              <div className="dates-grid">
                <DateCard icon="calendar" label="Expedicion" value={selectedConcesion.fecha_expedicion || 'N/A'} />
                <DateCard icon="start" label="Inicio" value={selectedConcesion.fecha_inicio || 'N/A'} />
                <DateCard icon="end" label="Vencimiento" value={selectedConcesion.fecha_fin || 'N/A'} />
              </div>

              {/* Boton de descarga de tarjeta RPM */}
              <div style={{ marginTop: '24px' }}>
                <a
                  href={`https://tarjetarpm.economia.gob.mx/tarjeta.mineria/obtiene.tarjetaPDF?notitulo=${selectedConcesion.titulo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-rpm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Descargar Tarjeta RPM
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="side-panel-content">
            {/* Header */}
            <div className="panel-header panel-header-main">
              <h2 className="panel-title">
                Concesiones Mineras
              </h2>
              <p className="panel-subtitle">
                Estado de Guerrero
              </p>
            </div>

            {/* Contenido con scroll */}
            <div className="scrollable-content-list">
              {/* Estadisticas */}
              <div className="stats-grid">
                <StatCard 
                  icon="chart"
                  label="Total" 
                  value={filteredConcesiones.length}
                  color="color-purple"
                />
                <StatCard 
                  icon="building"
                  label="Municipios" 
                  value={[...new Set(filteredConcesiones.map(c => c.municipio))].length}
                  color="color-violet"
                />
                <StatCard 
                  icon="check"
                  label="Vigentes" 
                  value={filteredConcesiones.filter(c => c.estado === 'Vigente').length}
                  color="color-green"
                />
                <StatCard 
                  icon="area"
                  label="Superficie" 
                  value={`${filteredConcesiones.reduce((sum, c) => sum + parseFloat(c.superficie || 0), 0).toFixed(0)} ha`}
                  color="color-orange"
                  small
                />
              </div>

              {/* Lista de concesiones */}
              <div>
                <h3 className="concesiones-list-header">
                  {filteredConcesiones.length > 0 
                    ? `Concesiones visibles (${filteredConcesiones.length})`
                    : 'No hay concesiones que mostrar'}
                </h3>

                <div className="concesiones-list">
                  {filteredConcesiones.slice(0, 20).map(concesion => (
                    <div
                      key={concesion.titulo}
                      onClick={() => handleConcesionClick(concesion)}
                      className="concesion-item"
                    >
                      <div className="concesion-name">
                        <span className={`concesion-status-dot ${concesion.estado === 'Vigente' ? 'vigente' : 'no-vigente'}`} />
                        {concesion.nombre_lote}
                      </div>
                      <div className="concesion-titular">
                        {concesion.titular}
                      </div>
                      <div className="concesion-details">
                        <span>{concesion.municipio}</span>
                        <span className="detail-separator">{'\u2022'}</span>
                        <span>{concesion.superficie} ha</span>
                      </div>
                    </div>
                  ))}
                  {filteredConcesiones.length > 20 && (
                    <div className="list-footer">
                      Mostrando 20 de {filteredConcesiones.length} concesiones
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para mostrar informacion
const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <div className="info-label">{label}</div>
    <div className="info-value">{value || 'N/A'}</div>
  </div>
);

// Componente para tarjetas de fechas
const DateCard = ({ icon, label, value }) => {
  const getIcon = () => {
    switch (icon) {
      case 'calendar':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'start':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      case 'end':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="date-card">
      <span className="date-icon">{getIcon()}</span>
      <div className="date-info">
        <div className="date-label">{label}</div>
        <div className="date-value">{value}</div>
      </div>
    </div>
  );
};

// Componente para tarjetas de estadisticas
const StatCard = ({ icon, label, value, color, small }) => {
  const getIcon = () => {
    switch (icon) {
      case 'chart':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
      case 'building':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#764ba2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <line x1="9" y1="6" x2="9" y2="6.01" />
            <line x1="15" y1="6" x2="15" y2="6.01" />
            <line x1="9" y1="10" x2="9" y2="10.01" />
            <line x1="15" y1="10" x2="15" y2="10.01" />
            <line x1="9" y1="14" x2="9" y2="14.01" />
            <line x1="15" y1="14" x2="15" y2="14.01" />
            <path d="M9 18h6" />
          </svg>
        );
      case 'check':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'area':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="stat-card">
      <div className="stat-icon">{getIcon()}</div>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${small ? 'small' : ''} ${color}`}>
        {value}
      </div>
    </div>
  );
};

export default App;