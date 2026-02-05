import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './index.css';
import concesionesData from './concesiones.json';

// Token de Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoicGVwZWxlcGV3IiwiYSI6ImNtbDhjNGsxNzA2aGszZ3B1N2J2eHZyZ2MifQ.DMWYi_J2wZ9wjsHy-s4kXg';

// Función para convertir coordenadas DMS a decimal
const dmsToDecimal = (dms) => {
  if (!dms) return null;
  
  const regex = /(\d+)°(\d+)′([\d.]+)″([NSEW])/;
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

// Definir regiones y sus municipios
const regionesMunicipios = {
  'Acapulco': ['Acapulco de Juárez'],
  'Norte': ['Cocula', 'Iguala de la Independencia', 'Taxco de Alarcón', 'Teloloapan', 'Buenavista de Cuéllar', 'Tepecoacuilco de Trujano', 'Ixcateopan de Cuauhtémoc'],
  'Centro': ['Chilpancingo de los Bravo', 'Eduardo Neri', 'Zitlala', 'Tixtla de Guerrero', 'Mochitlán', 'Quechultenango'],
  'Montaña': ['Tlapa de Comonfort', 'Metlatónoc', 'Cochoapa el Grande', 'Iliatenco', 'Alpoyeca'],
  'Costa Chica': ['Ometepec', 'Cuajinicuilapa', 'Azoyú', 'San Marcos', 'Copala', 'Marquelia', 'Florencio Villarreal'],
  'Costa Grande': ['Zihuatanejo de Azueta', 'Petatlán', 'Tecpán de Galeana', 'Atoyac de Álvarez', 'Coyuca de Benítez', 'La Unión de Isidoro Montes de Oca'],
  'Tierra Caliente': ['Tlalchapa', 'Arcelia', 'Tlapehuala', 'San Miguel Totolapan', 'Pungarabato', 'Ajuchitlán del Progreso', 'Coyuca de Catalán'],
  'Sierra': ['General Heliodoro Castillo', 'Leonardo Bravo']
};

// Regiones de Guerrero con coordenadas
const regiones = [
  { nombre: 'Acapulco', coords: [-99.8901, 16.8531], zoom: 11 },
  { nombre: 'Norte', coords: [-99.5398, 18.3444], zoom: 9 },
  { nombre: 'Centro', coords: [-99.5008, 17.5509], zoom: 9 },
  { nombre: 'Montaña', coords: [-98.5761, 17.5453], zoom: 9 },
  { nombre: 'Costa Chica', coords: [-98.4102, 16.6850], zoom: 9 },
  { nombre: 'Costa Grande', coords: [-101.5518, 17.6413], zoom: 9 },
  { nombre: 'Tierra Caliente', coords: [-100.5, 18.2], zoom: 9 },
  { nombre: 'Sierra', coords: [-99.85, 17.65], zoom: 10 }
];

// Función para obtener la región de un municipio
const getRegionFromMunicipio = (municipio) => {
  for (const [region, municipios] of Object.entries(regionesMunicipios)) {
    if (municipios.includes(municipio)) {
      return region;
    }
  }
  return null;
};

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const coordinatesPopup = useRef(null);
  
  const [concesiones, setConcesiones] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConcesion, setSelectedConcesion] = useState(null);
  const [filteredConcesiones, setFilteredConcesiones] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [yearFilter, setYearFilter] = useState('');

  // Cargar concesiones al montar el componente
  useEffect(() => {
    const processed = processConcesiones(concesionesData);
    setConcesiones(processed);
    
    const uniqueMunicipios = [...new Set(processed.map(c => c.municipio))].sort();
    setMunicipios(uniqueMunicipios);
  }, []);

  // Filtrar concesiones según los criterios
  useEffect(() => {
    let filtered = [...concesiones];
    
    // Filtrar por región
    if (selectedRegion) {
      // Primero intentar usar el campo region del JSON si existe
      filtered = filtered.filter(c => {
        if (c.region) {
          return c.region === selectedRegion;
        }
        // Si no existe el campo region, usar el mapeo de municipios
        const municipiosRegion = regionesMunicipios[selectedRegion] || [];
        return municipiosRegion.includes(c.municipio);
      });
    }
    
    // Filtrar por municipio
    if (selectedMunicipio) {
      filtered = filtered.filter(c => c.municipio === selectedMunicipio);
    }
    
    // Filtrar por año (usando fecha_inicio)
    if (yearFilter) {
      filtered = filtered.filter(c => {
        if (c.fecha_inicio) {
          // Manejar formato DD/MM/YYYY
          const parts = c.fecha_inicio.split('/');
          if (parts.length === 3) {
            let year = parts[2];
            // Si el año es de 2 dígitos, convertir a 4 dígitos
            if (year.length === 2) {
              year = parseInt(year) > 50 ? '19' + year : '20' + year;
            }
            return year === yearFilter;
          }
        }
        return false;
      });
    }
    
    // Filtrar por búsqueda
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
        
        // Mostrar popup de coordenadas
        showCoordinatesPopup(concesion);
        
        map.current.flyTo({
          center: concesion.coords,
          zoom: 14,
          duration: 1500
        });
      });

      markers.current.push(marker);
    });

    // NO ajustar automáticamente el mapa cuando hay filtros activos
    if (filteredConcesiones.length > 0 && !selectedMunicipio && !selectedRegion && searchTerm.length === 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredConcesiones.forEach(c => bounds.extend(c.coords));
      map.current.fitBounds(bounds, { padding: 100, maxZoom: 12 });
    }
  }, [filteredConcesiones]);

  // Mostrar popup de coordenadas flotante
  const showCoordinatesPopup = (concesion) => {
    // Remover popup anterior si existe
    if (coordinatesPopup.current) {
      coordinatesPopup.current.remove();
    }

    // Crear nuevo popup
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
            📍 ${concesion.nombre_lote}
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
  };

  // Manejar cambio de región
  const handleRegionChange = (e) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedMunicipio('');
    setSelectedConcesion(null);
    setSearchTerm('');
    
    if (region) {
      const selected = regiones.find(r => r.nombre === region);
      if (selected && map.current) {
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

  // Manejar búsqueda
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setSelectedConcesion(null);
  };

  // Seleccionar concesión de búsqueda
  const handleConcesionClick = (concesion) => {
    const index = filteredConcesiones.findIndex(c => c.titulo === concesion.titulo);
    setCurrentIndex(index);
    setSelectedConcesion(concesion);
    
    // Mostrar popup de coordenadas
    showCoordinatesPopup(concesion);
    
    // Solo hacer zoom, NO ajustar bounds
    if (map.current) {
      map.current.flyTo({
        center: concesion.coords,
        zoom: 14,
        duration: 1500
      });
    }
  };

  // Navegar a la concesión anterior
  const handlePrevious = () => {
    if (filteredConcesiones.length === 0) return;
    
    const newIndex = currentIndex > 0 ? currentIndex - 1 : filteredConcesiones.length - 1;
    setCurrentIndex(newIndex);
    const concesion = filteredConcesiones[newIndex];
    setSelectedConcesion(concesion);
    
    // Mostrar popup de coordenadas
    showCoordinatesPopup(concesion);
    
    if (map.current) {
      map.current.flyTo({
        center: concesion.coords,
        zoom: 14,
        duration: 1000
      });
    }
  };

  // Navegar a la concesión siguiente
  const handleNext = () => {
    if (filteredConcesiones.length === 0) return;
    
    const newIndex = currentIndex < filteredConcesiones.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    const concesion = filteredConcesiones[newIndex];
    setSelectedConcesion(concesion);
    
    // Mostrar popup de coordenadas
    showCoordinatesPopup(concesion);
    
    if (map.current) {
      map.current.flyTo({
        center: concesion.coords,
        zoom: 14,
        duration: 1000
      });
    }
  };

  // Obtener municipios filtrados por región
  const getMunicipiosFiltrados = () => {
    if (!selectedRegion) {
      return municipios;
    }
    return regionesMunicipios[selectedRegion] || [];
  };

  // Función para descargar Excel con las concesiones filtradas
  const handleDownloadExcel = async () => {
    try {
      // Importar la librería xlsx dinámicamente
      const XLSX = await import('xlsx');
      
      // Preparar datos para el Excel
      const dataToExport = filteredConcesiones.map(c => ({
        'No.': c['No.'] || '',
        'Nombre del Lote': c.nombre_lote || '',
        'Título': c.titulo || '',
        'Fecha de Expedición': c.fecha_expedicion || '',
        'Fecha de Inicio': c.fecha_inicio || '',
        'Fecha de Fin': c.fecha_fin || '',
        'Superficie (ha)': c.superficie || '',
        'Titular': c.titular || '',
        'Municipio': c.municipio || '',
        'Región': c.region || getRegionFromMunicipio(c.municipio) || '',
        'Latitud': c.latitud || '',
        'Longitud': c.longitud || '',
        'Coordenadas Decimales': c.coords ? `${c.coords[1].toFixed(6)}, ${c.coords[0].toFixed(6)}` : '',
        'Estado': c.estado || ''
      }));
      
      // Crear el libro de trabajo
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      
      // Ajustar anchos de columnas
      const colWidths = [
        { wch: 5 },   // No.
        { wch: 25 },  // Nombre del Lote
        { wch: 12 },  // Título
        { wch: 18 },  // Fecha de Expedición
        { wch: 18 },  // Fecha de Inicio
        { wch: 18 },  // Fecha de Fin
        { wch: 15 },  // Superficie
        { wch: 35 },  // Titular
        { wch: 25 },  // Municipio
        { wch: 18 },  // Región
        { wch: 18 },  // Latitud
        { wch: 18 },  // Longitud
        { wch: 25 },  // Coordenadas Decimales
        { wch: 12 }   // Estado
      ];
      ws['!cols'] = colWidths;
      
      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Concesiones');
      
      // Generar el nombre del archivo
      let fileName = 'Concesiones_Mineras';
      if (selectedRegion) fileName += `_${selectedRegion}`;
      if (selectedMunicipio) fileName += `_${selectedMunicipio}`;
      if (yearFilter) fileName += `_${yearFilter}`;
      fileName += `.xlsx`;
      
      // Descargar el archivo
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error al generar el archivo Excel:', error);
      alert('Hubo un error al generar el archivo Excel. Por favor intente nuevamente.');
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    let data = [...concesiones];
    
    // Aplicar filtro de año si existe (usando fecha_inicio)
    if (yearFilter) {
      data = data.filter(c => {
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
    
    // Estadísticas por municipio
    const porMunicipio = {};
    data.forEach(c => {
      if (!porMunicipio[c.municipio]) {
        porMunicipio[c.municipio] = {
          total: 0,
          vigentes: 0,
          superficie: 0,
          titulares: new Set()
        };
      }
      porMunicipio[c.municipio].total++;
      if (c.estado === 'Vigente') porMunicipio[c.municipio].vigentes++;
      porMunicipio[c.municipio].superficie += parseFloat(c.superficie || 0);
      porMunicipio[c.municipio].titulares.add(c.titular);
    });

    // Estadísticas por titular
    const porTitular = {};
    data.forEach(c => {
      if (!porTitular[c.titular]) {
        porTitular[c.titular] = {
          total: 0,
          vigentes: 0,
          superficie: 0,
          municipios: new Set()
        };
      }
      porTitular[c.titular].total++;
      if (c.estado === 'Vigente') porTitular[c.titular].vigentes++;
      porTitular[c.titular].superficie += parseFloat(c.superficie || 0);
      porTitular[c.titular].municipios.add(c.municipio);
    });

    // Estadísticas por año (usando fecha_inicio)
    const porAño = {};
    data.forEach(c => {
      if (c.fecha_inicio) {
        const parts = c.fecha_inicio.split('/');
        if (parts.length === 3) {
          let year = parts[2];
          if (year.length === 2) {
            year = parseInt(year) > 50 ? '19' + year : '20' + year;
          }
          if (!porAño[year]) {
            porAño[year] = {
              total: 0,
              vigentes: 0,
              superficie: 0
            };
          }
          porAño[year].total++;
          if (c.estado === 'Vigente') porAño[year].vigentes++;
          porAño[year].superficie += parseFloat(c.superficie || 0);
        }
      }
    });

    return { porMunicipio, porTitular, porAño };
  };

  // Obtener años únicos
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

  return (
    <div className="app-container">
      {/* Mapa de fondo */}
      <div ref={mapContainer} className="map-container" />

      {/* Título elegante de filtros */}
      <div className="filters-title-container">
        <div className="filters-title">
          <span className="filters-title-icon">🔍</span>
          <span className="filters-title-text">Filtros de Búsqueda</span>
        </div>
      </div>

      {/* Controles flotantes superiores */}
      <div className="filters-controls">
        {/* Filtro por Región */}
        <select
          value={selectedRegion}
          onChange={handleRegionChange}
          className="filter-select"
        >
          <option value="">🌎 Todas las regiones</option>
          {regiones.map(region => (
            <option key={region.nombre} value={region.nombre}>
              {region.nombre}
            </option>
          ))}
        </select>

        {/* Filtro por Municipio */}
        <select
          value={selectedMunicipio}
          onChange={handleMunicipioChange}
          className="filter-select filter-select-municipio"
        >
          <option value="">🏙️ Todos los municipios</option>
          {getMunicipiosFiltrados().map(municipio => (
            <option key={municipio} value={municipio}>
              {municipio}
            </option>
          ))}
        </select>

        {/* Filtro por Año */}
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="filter-select filter-select-year"
        >
          <option value="">📅 Todos los años</option>
          {getYearsUnicos().map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Barra de búsqueda */}
        <input
          type="text"
          placeholder="🔍 Buscar concesión..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />

        {/* Botón de descarga Excel */}
        <button
          onClick={handleDownloadExcel}
          className="btn-stats"
        >
          📥 Descargar Excel
        </button>
      </div>

      {/* Panel lateral izquierdo */}
      <div className="side-panel">
        {selectedConcesion ? (
          // Información de concesión seleccionada
          <div className="side-panel-content">
            {/* Header con navegación */}
            <div className="panel-header">
              {/* Botones de navegación */}
              <div className="navigation-controls">
                <button
                  onClick={handlePrevious}
                  disabled={filteredConcesiones.length === 0}
                  className="btn-nav"
                >
                  ← Anterior
                </button>
                
                <span className="navigation-counter">
                  {currentIndex + 1} / {filteredConcesiones.length}
                </span>
                
                <button
                  onClick={handleNext}
                  disabled={filteredConcesiones.length === 0}
                  className="btn-nav"
                >
                  Siguiente →
                </button>
              </div>

              <button
                onClick={() => setSelectedConcesion(null)}
                className="btn-back"
              >
                ← Volver
              </button>
              
              <h2 className="concesion-header-title">
                {selectedConcesion.nombre_lote}
              </h2>
              
              <div className={`status-badge ${selectedConcesion.estado === 'Vigente' ? 'vigente' : 'no-vigente'}`}>
                <span className="status-dot">●</span>
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
                <InfoRow label="Título" value={selectedConcesion.titulo} />
                <InfoRow label="Municipio" value={selectedConcesion.municipio} />
                <InfoRow 
                  label="Región" 
                  value={selectedConcesion.region || getRegionFromMunicipio(selectedConcesion.municipio) || 'N/A'} 
                />
                <InfoRow label="Superficie" value={`${selectedConcesion.superficie} ha`} />
              </div>

              {/* Fechas */}
              <div className="dates-grid">
                <DateCard
                  icon="📅"
                  label="Expedición"
                  value={selectedConcesion.fecha_expedicion || 'N/A'}
                />
                <DateCard
                  icon="🟢"
                  label="Inicio"
                  value={selectedConcesion.fecha_inicio || 'N/A'}
                />
                <DateCard
                  icon="⏰"
                  label="Vencimiento"
                  value={selectedConcesion.fecha_fin || 'N/A'}
                />
              </div>

              {/* Botón de descarga de tarjeta RPM */}
              <div style={{ marginTop: '24px' }}>
                <a
                  href={`https://tarjetarpm.economia.gob.mx/tarjeta.mineria/obtiene.tarjetaPDF?notitulo=${selectedConcesion.titulo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '14px 20px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    textAlign: 'center',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5568d3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
                >
                  📄 Descargar Tarjeta RPM
                </a>
              </div>
            </div>
          </div>
        ) : (
          // Lista de concesiones
          <div className="side-panel-content">
            {/* Header */}
            <div className="panel-header panel-header-main">
              <h2 className="panel-title">
                🗺️ Concesiones Mineras
              </h2>
              <p className="panel-subtitle">
                Estado de Guerrero
              </p>
            </div>

            {/* Contenido con scroll */}
            <div className="scrollable-content-list">
              {/* Estadísticas */}
              <div className="stats-grid">
                <StatCard 
                  icon="📊"
                  label="Total" 
                  value={concesiones.length}
                  color="color-purple"
                />
                <StatCard 
                  icon="🏙️"
                  label="Municipios" 
                  value={municipios.length}
                  color="color-violet"
                />
                <StatCard 
                  icon="✅"
                  label="Vigentes" 
                  value={concesiones.filter(c => c.estado === 'Vigente').length}
                  color="color-green"
                />
                <StatCard 
                  icon="📏"
                  label="Superficie" 
                  value={`${concesiones.reduce((sum, c) => sum + parseFloat(c.superficie || 0), 0).toFixed(0)} ha`}
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
                        <span className="concesion-status-icon">
                          {concesion.estado === 'Vigente' ? '🔴' : '⚫'}
                        </span>
                        {concesion.nombre_lote}
                      </div>
                      <div className="concesion-titular">
                        {concesion.titular}
                      </div>
                      <div className="concesion-details">
                        <span>📍 {concesion.municipio}</span>
                        <span>•</span>
                        <span>📐 {concesion.superficie} ha</span>
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

// Componente para mostrar información
const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <div className="info-label">{label}</div>
    <div className="info-value">{value || 'N/A'}</div>
  </div>
);

// Componente para tarjetas de fechas
const DateCard = ({ icon, label, value }) => (
  <div className="date-card">
    <span className="date-icon">{icon}</span>
    <div className="date-info">
      <div className="date-label">{label}</div>
      <div className="date-value">{value}</div>
    </div>
  </div>
);

// Componente para tarjetas de estadísticas
const StatCard = ({ icon, label, value, color, small }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-label">{label}</div>
    <div className={`stat-value ${small ? 'small' : ''} ${color}`}>
      {value}
    </div>
  </div>
);

export default App;