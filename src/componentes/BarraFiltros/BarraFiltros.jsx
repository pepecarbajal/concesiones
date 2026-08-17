import React, { memo } from 'react';
import { descargarExcel } from './utilidades/exportadorExcel';

const BarraFiltros = memo(({
  visible,
  panelVisible,
  estadoSeleccionado,
  regionSeleccionada,
  municipioSeleccionado,
  filtroAnio,
  terminoBusqueda,
  regionesDisponibles,
  municipiosDisponibles,
  aniosDisponibles,
  onCambiarEstado,
  onCambiarRegion,
  onCambiarMunicipio,
  onCambiarAnio,
  onCambiarBusqueda,
  onActivarBusqueda,
  onLimpiarBusqueda,
  elementosFiltrados
}) => {
  const manejarDescargaExcel = async () => {
    await descargarExcel(
      elementosFiltrados,
      regionSeleccionada,
      municipioSeleccionado,
      filtroAnio
    );
  };

  const manejarTeclaEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onActivarBusqueda();
    }
  };

  return (
    <div className={`filters-bar ${visible ? 'filters-visible' : 'filters-hidden'} ${!panelVisible ? 'filters-no-panel' : ''}`}>
      

      <div className="filters-bar-content">
        {/* ── Selects fijos ── */}
        <div className="filters-selects">
          <select
            value={regionSeleccionada}
            onChange={(e) => onCambiarRegion(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las regiones</option>
            {regionesDisponibles.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          <select
            value={municipioSeleccionado}
            onChange={(e) => onCambiarMunicipio(e.target.value)}
            className="filter-select filter-select-municipio"
          >
            <option value="">Todos los municipios</option>
            {municipiosDisponibles.map(municipio => (
              <option key={municipio} value={municipio}>{municipio}</option>
            ))}
          </select>

          <select
            value={filtroAnio}
            onChange={(e) => onCambiarAnio(e.target.value)}
            className="filter-select filter-select-year"
          >
            <option value="">Todos los años</option>
            {aniosDisponibles.map(anio => (
              <option key={anio} value={anio}>{anio}</option>
            ))}
          </select>

          <select
            value={estadoSeleccionado}
            onChange={(e) => onCambiarEstado(e.target.value)}
            className="filter-select filter-select-estado"
          >
            <option value="">Todos los estados</option>
            <option value="Vigente">Vigente</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        {/* ── Búsqueda + botones (se expanden para llenar el espacio restante) ── */}
        <div className="filters-search">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Buscar por nombre de lote, titular, orden..."
              value={terminoBusqueda}
              onChange={(e) => onCambiarBusqueda(e.target.value)}
              onKeyPress={manejarTeclaEnter}
              className="search-input"
            />
            {terminoBusqueda && (
              <button
                type="button"
                onClick={onLimpiarBusqueda}
                className="search-clear-btn"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onActivarBusqueda}
            className="btn-download"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Buscar
          </button>

          <button
            type="button"
            onClick={manejarDescargaExcel}
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
    </div>
  );
});

BarraFiltros.displayName = 'BarraFiltros';

export default BarraFiltros;