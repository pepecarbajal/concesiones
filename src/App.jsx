import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import concesionesData from './concesiones.json';

// Token de Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoicGVwZWxlcGV3IiwiYSI6ImNtbDhjNGsxNzA2aGszZ3B1N2J2eHZyZ2MifQ.DMWYi_J2wZ9wjsHy-s4kXg';

// Función para convertir coordenadas DMS a decimal
const dmsToDecimal = (dms) => {
  if (!dms) return null;
  
  // Ejemplo: "17°3′53.190″N" o "99°44′29.440″W"
  const regex = /(\d+)°(\d+)′([\d.]+)″([NSEW])/;
  const match = dms.match(regex);
  
  if (!match) return null;
  
  const degrees = parseFloat(match[1]);
  const minutes = parseFloat(match[2]);
  const seconds = parseFloat(match[3]);
  const direction = match[4];
  
  let decimal = degrees + minutes / 60 + seconds / 3600;
  
  // Si es Sur o Oeste, el valor es negativo
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
  }).filter(c => c.coords !== null); // Filtrar concesiones sin coordenadas válidas
};

// Regiones de Guerrero
const regiones = [
  { nombre: 'Acapulco', coords: [-99.8901, 16.8531], zoom: 11 },
  { nombre: 'Norte', coords: [-99.5398, 18.3444], zoom: 9 },
  { nombre: 'Centro', coords: [-99.5008, 17.5509], zoom: 9 },
  { nombre: 'Montaña', coords: [-98.5761, 17.5453], zoom: 9 },
  { nombre: 'Costa Chica', coords: [-98.4102, 16.6850], zoom: 9 },
  { nombre: 'Costa Grande', coords: [-101.5518, 17.6413], zoom: 9 },
  { nombre: 'Tierra Caliente', coords: [-100.5, 18.2], zoom: 9 }
];

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  
  const [concesiones, setConcesiones] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConcesion, setSelectedConcesion] = useState(null);
  const [filteredConcesiones, setFilteredConcesiones] = useState([]);

  // Cargar concesiones al montar el componente
  useEffect(() => {
    const processed = processConcesiones(concesionesData);
    setConcesiones(processed);
    
    // Extraer municipios únicos
    const uniqueMunicipios = [...new Set(processed.map(c => c.municipio))].sort();
    setMunicipios(uniqueMunicipios);
  }, []);

  // Filtrar concesiones según los criterios
  useEffect(() => {
    let filtered = [...concesiones];
    
    // Filtrar por municipio
    if (selectedMunicipio) {
      filtered = filtered.filter(c => c.municipio === selectedMunicipio);
    }
    
    // Filtrar por búsqueda
    if (searchTerm.length > 2) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.nombre_lote?.toLowerCase().includes(term) ||
        c.titular?.toLowerCase().includes(term) ||
        c.municipio?.toLowerCase().includes(term) ||
        c.titulo?.toLowerCase().includes(term) ||
        c.fid?.toLowerCase().includes(term)
      );
    }
    
    setFilteredConcesiones(filtered);
  }, [selectedMunicipio, searchTerm, concesiones]);

  // Inicializar el mapa
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/pepelepew/cml8d6k0c00d301s3hjayaqcs/draft',
      center: [-99.5008, 17.5509],
      zoom: 8
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }, []);

  // Actualizar marcadores cuando cambien las concesiones filtradas
  useEffect(() => {
    if (!map.current) return;

    // Remover marcadores existentes
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Agregar nuevos marcadores
    filteredConcesiones.forEach(concesion => {
      // Crear elemento del marcador
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
          <circle cx="12" cy="10" r="8" fill="${concesion.Estado === 'Vigente' ? '#FF4444' : '#999999'}" filter="url(#shadow)"/>
          <circle cx="12" cy="10" r="6.5" fill="${concesion.Estado === 'Vigente' ? '#FF6666' : '#AAAAAA'}"/>
          <circle cx="12" cy="10" r="3" fill="white"/>
          <path d="M12 18 L10 23 L12 21 L14 23 Z" fill="${concesion.Estado === 'Vigente' ? '#CC0000' : '#666666'}" filter="url(#shadow)"/>
          <circle cx="12" cy="10" r="1.5" fill="${concesion.Estado === 'Vigente' ? '#FF4444' : '#999999'}"/>
        </svg>
      `;
      el.style.cursor = 'pointer';
      el.style.width = '24px';
      el.style.height = '24px';

      const marker = new mapboxgl.Marker(el)
        .setLngLat(concesion.coords)
        .addTo(map.current);

      el.addEventListener('click', () => {
        setSelectedConcesion(concesion);
        map.current.flyTo({
          center: concesion.coords,
          zoom: 14,
          duration: 1500
        });
      });

      markers.current.push(marker);
    });

    // Ajustar el mapa para mostrar todos los marcadores
    if (filteredConcesiones.length > 0 && !selectedMunicipio && !selectedRegion) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredConcesiones.forEach(c => bounds.extend(c.coords));
      map.current.fitBounds(bounds, { padding: 100, maxZoom: 12 });
    }
  }, [filteredConcesiones]);

  // Manejar cambio de municipio
  const handleMunicipioChange = (e) => {
    const municipio = e.target.value;
    setSelectedMunicipio(municipio);
    setSelectedRegion('');
    
    if (municipio && map.current) {
      // Encontrar concesiones de ese municipio
      const concesionesMunicipio = concesiones.filter(c => c.municipio === municipio);
      
      if (concesionesMunicipio.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        concesionesMunicipio.forEach(c => bounds.extend(c.coords));
        map.current.fitBounds(bounds, { padding: 80, maxZoom: 13 });
      }
    } else if (!municipio && map.current) {
      // Volver a la vista general
      map.current.flyTo({
        center: [-99.5008, 17.5509],
        zoom: 8,
        duration: 2000
      });
    }
  };

  // Manejar cambio de región
  const handleRegionChange = (e) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedMunicipio('');
    
    if (region) {
      const selected = regiones.find(r => r.nombre === region);
      if (selected && map.current) {
        map.current.flyTo({
          center: selected.coords,
          zoom: selected.zoom,
          duration: 2000
        });
      }
    }
  };

  // Manejar búsqueda
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  // Seleccionar concesión de búsqueda
  const handleConcesionClick = (concesion) => {
    setSelectedConcesion(concesion);
    
    if (map.current) {
      map.current.flyTo({
        center: concesion.coords,
        zoom: 14,
        duration: 1500
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date;
  };

  // Función para generar URL de descarga de tarjeta RPM
  const getRPMCardUrl = (titulo) => {
    return `https://tarjetarpm.economia.gob.mx/tarjeta.mineria/obtiene.tarjetaPDF?notitulo=${titulo}`;
  };

  // Función para descargar tarjeta RPM
  const downloadRPMCard = (titulo, nombreLote) => {
    const url = getRPMCardUrl(titulo);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `Tarjeta_RPM_${titulo}_${nombreLote}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Contenedor del mapa */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Barra superior con controles */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        display: 'flex',
        gap: '15px',
        zIndex: 1,
        flexWrap: 'wrap'
      }}>
        {/* Selector de municipio */}
        <select
          value={selectedMunicipio}
          onChange={handleMunicipioChange}
          style={{
            padding: '12px 15px',
            fontSize: '14px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            outline: 'none',
            minWidth: '200px'
          }}
        >
          <option value="">Todos los Municipios ({municipios.length})</option>
          {municipios.map(m => {
            const count = concesiones.filter(c => c.municipio === m).length;
            return (
              <option key={m} value={m}>{m} ({count})</option>
            );
          })}
        </select>

        {/* Selector de región */}
        <select
          value={selectedRegion}
          onChange={handleRegionChange}
          style={{
            padding: '12px 15px',
            fontSize: '14px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            outline: 'none',
            minWidth: '180px'
          }}
        >
          <option value="">Seleccionar Región</option>
          {regiones.map(r => (
            <option key={r.nombre} value={r.nombre}>{r.nombre}</option>
          ))}
        </select>

        {/* Barra de búsqueda */}
        <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar por nombre, titular, título..."
            style={{
              width: '100%',
              padding: '12px 15px',
              fontSize: '14px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              outline: 'none'
            }}
          />
          
          {/* Resultados de búsqueda */}
          {searchTerm.length > 2 && filteredConcesiones.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '5px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 10
            }}>
              {filteredConcesiones.slice(0, 10).map(concesion => (
                <div
                  key={concesion.fid}
                  onClick={() => {
                    handleConcesionClick(concesion);
                    setSearchTerm('');
                  }}
                  style={{
                    padding: '12px 15px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>
                    {concesion.nombre_lote}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {concesion.titular}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                    {concesion.municipio} • Título: {concesion.titulo}
                  </div>
                </div>
              ))}
              {filteredConcesiones.length > 10 && (
                <div style={{
                  padding: '10px 15px',
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'center',
                  backgroundColor: '#f9f9f9'
                }}>
                  Mostrando 10 de {filteredConcesiones.length} resultados
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contador de concesiones */}
        <div style={{
          padding: '12px 20px',
          fontSize: '14px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontWeight: '600',
          color: '#1976d2',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '18px' }}>📍</span>
          {filteredConcesiones.length} concesiones
        </div>
      </div>

      {/* Panel lateral flotante */}
      <div style={{
        position: 'absolute',
        left: '20px',
        top: '120px',
        bottom: '20px',
        width: '420px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        zIndex: 1,
        border: '1px solid rgba(0,0,0,0.06)'
      }}>
        {selectedConcesion ? (
          // Información de concesión seleccionada
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header con gradiente */}
            <div style={{
              background: 'linear-gradient(135deg, #020202 0%, #2d0555 100%)',
              padding: '24px',
              color: 'white'
            }}>
              <button
                onClick={() => setSelectedConcesion(null)}
                style={{
                  marginBottom: '16px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              >
                ← Volver
              </button>
              
              <h2 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '24px',
                fontWeight: '700',
                lineHeight: '1.2',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {selectedConcesion.nombre_lote}
              </h2>
              
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: selectedConcesion.Estado === 'Vigente' 
                  ? 'rgba(76, 175, 80, 0.9)' 
                  : 'rgba(244, 67, 54, 0.9)',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)'
              }}>
                <span style={{ fontSize: '10px' }}>●</span>
                {selectedConcesion.Estado || 'N/A'}
              </div>
            </div>

            {/* Contenido con scroll */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px'
            }}>
              {/* Información principal */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '12px', 
                  fontWeight: '700',
                  color: '#9CA3AF',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Información General
                </h3>
                
                <div style={{ 
                  display: 'grid', 
                  gap: '16px',
                  backgroundColor: '#F9FAFB',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB'
                }}>
                  <InfoRowModern label="Título" value={selectedConcesion.titulo} />
                  <InfoRowModern label="FID" value={selectedConcesion.fid} />
                  <InfoRowModern label="Municipio" value={selectedConcesion.municipio} />
                  <InfoRowModern label="Superficie" value={`${selectedConcesion.superficie} ha`} />
                </div>
              </div>

              {/* Titular */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '12px', 
                  fontWeight: '700',
                  color: '#9CA3AF',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Titular
                </h3>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#EEF2FF',
                  borderLeft: '4px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1F2937',
                  fontWeight: '500',
                  lineHeight: '1.5'
                }}>
                  {selectedConcesion.titular}
                </div>
              </div>

              {/* Fechas */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '12px', 
                  fontWeight: '700',
                  color: '#9CA3AF',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Fechas Importantes
                </h3>
                
                <div style={{ 
                  display: 'grid', 
                  gap: '12px'
                }}>
                  <DateCard icon="📅" label="Expedición" value={formatDate(selectedConcesion.fecha_expedicion)} />
                  <DateCard icon="🟢" label="Inicio" value={formatDate(selectedConcesion['Fecha de Inicio'])} />
                  <DateCard icon="🔴" label="Fin" value={formatDate(selectedConcesion['Fecha de Fin'])} />
                </div>
              </div>

              {/* Coordenadas */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '12px', 
                  fontWeight: '700',
                  color: '#9CA3AF',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Coordenadas
                </h3>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#FFF7ED',
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: '#78350F',
                  border: '1px solid #FED7AA'
                }}>
                  <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700' }}>📍 Latitud:</span>
                    <span>{selectedConcesion.latitud}</span>
                  </div>
                  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700' }}>📍 Longitud:</span>
                    <span>{selectedConcesion.longitud}</span>
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#92400E',
                    paddingTop: '8px',
                    borderTop: '1px solid #FED7AA',
                    fontFamily: 'monospace'
                  }}>
                    Decimal: {selectedConcesion.coords[1].toFixed(6)}, {selectedConcesion.coords[0].toFixed(6)}
                  </div>
                </div>
              </div>

              {/* Botón de descarga - ahora al final */}
              <button
                onClick={() => downloadRPMCard(selectedConcesion.titulo, selectedConcesion.nombre_lote)}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: 'white',
                  background: 'linear-gradient(135deg, #020202 0%, #2d0555 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                }}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Descargar Tarjeta RPM
              </button>
            </div>
          </div>
        ) : (
          // Vista por defecto
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header con gradiente */}
            <div style={{
              background: 'linear-gradient(135deg, #020202 0%, #2d0555 100%)',
              padding: '28px 24px',
              color: 'white'
            }}>
              <h2 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '28px',
                fontWeight: '700',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Concesiones Mineras
              </h2>
              
              <p style={{ 
                fontSize: '14px', 
                opacity: 0.95,
                lineHeight: '1.5',
                margin: 0
              }}>
                {selectedMunicipio 
                  ? `Mostrando concesiones en ${selectedMunicipio}`
                  : 'Explora las concesiones del estado de Guerrero'}
              </p>
            </div>

            {/* Contenido con scroll */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px'
            }}>
              {/* Estadísticas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '28px'
              }}>
                <StatCardModern 
                  icon="📊"
                  label="Total" 
                  value={concesiones.length}
                  color="#667eea"
                />
                <StatCardModern 
                  icon="🏙️"
                  label="Municipios" 
                  value={municipios.length}
                  color="#764ba2"
                />
                <StatCardModern 
                  icon="✅"
                  label="Vigentes" 
                  value={concesiones.filter(c => c.Estado === 'Vigente').length}
                  color="#4CAF50"
                />
                <StatCardModern 
                  icon="📏"
                  label="Superficie" 
                  value={`${concesiones.reduce((sum, c) => sum + parseFloat(c.superficie || 0), 0).toFixed(0)} ha`}
                  color="#FF9800"
                  small
                />
              </div>
              
              {/* Lista de concesiones filtradas */}
              <div>
                <h3 style={{ 
                  fontSize: '12px', 
                  fontWeight: '700',
                  color: '#9CA3AF',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {filteredConcesiones.length > 0 
                    ? `Concesiones visibles (${filteredConcesiones.length})`
                    : 'No hay concesiones que mostrar'}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredConcesiones.slice(0, 20).map(concesion => (
                    <div
                      key={concesion.fid}
                      onClick={() => handleConcesionClick(concesion)}
                      style={{
                        padding: '16px',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid #E5E7EB'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#EEF2FF';
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '14px',
                        color: '#1F2937',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '16px' }}>
                          {concesion.Estado === 'Vigente' ? '🔴' : '⚫'}
                        </span>
                        {concesion.nombre_lote}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                        {concesion.titular}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#9CA3AF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>📍 {concesion.municipio}</span>
                        <span>•</span>
                        <span>📐 {concesion.superficie} ha</span>
                      </div>
                    </div>
                  ))}
                  {filteredConcesiones.length > 20 && (
                    <div style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '12px',
                      color: '#9CA3AF',
                      backgroundColor: '#F9FAFB',
                      borderRadius: '8px'
                    }}>
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

// Componente auxiliar para mostrar información
const InfoRow = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
      {label}
    </div>
    <div style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: '500' }}>
      {value || 'N/A'}
    </div>
  </div>
);

// Componente moderno para mostrar información
const InfoRowModern = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>
      {label}
    </span>
    <span style={{ fontSize: '14px', color: '#1F2937', fontWeight: '600' }}>
      {value || 'N/A'}
    </span>
  </div>
);

// Componente para tarjetas de fechas
const DateCard = ({ icon, label, value }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #E5E7EB'
  }}>
    <span style={{ fontSize: '20px' }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', color: '#1F2937', fontWeight: '600' }}>
        {value}
      </div>
    </div>
  </div>
);

// Componente auxiliar para tarjetas de estadísticas
const StatCard = ({ label, value, color, small }) => (
  <div style={{
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
      {label}
    </div>
    <div style={{ 
      fontSize: small ? '16px' : '24px', 
      fontWeight: '700', 
      color: color 
    }}>
      {value}
    </div>
  </div>
);

// Componente moderno para tarjetas de estadísticas
const StatCardModern = ({ icon, label, value, color, small }) => (
  <div style={{
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    transition: 'all 0.2s'
  }}>
    <div style={{ 
      fontSize: '24px', 
      marginBottom: '8px' 
    }}>
      {icon}
    </div>
    <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px', fontWeight: '600' }}>
      {label}
    </div>
    <div style={{ 
      fontSize: small ? '18px' : '24px', 
      fontWeight: '700', 
      color: color 
    }}>
      {value}
    </div>
  </div>
);

export default App;