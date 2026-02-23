import React, { useMemo, useState, useEffect } from 'react';

const SUPERFICIE_GUERRERO_HA = 6_364_100;

const COLORES = [
  '#818cf8', '#a78bfa', '#c084fc', '#e879f9',
  '#fb7185', '#f472b6', '#60a5fa', '#34d399'
];

// ── Barra individual reutilizable ────────────────────────────────────────────
const BaraItem = ({ nombre, subtitulo, superficie, maxSup, color, index, animado }) => {
  const pct       = (superficie / maxSup) * 100;
  const pctEstado = ((superficie / SUPERFICIE_GUERRERO_HA) * 100).toFixed(3);

  return (
    <div className="stats-bar-row">
      <div className="stats-bar-label" title={nombre}>
        <span className="stats-bar-dot" style={{ background: color }} />
        <span className="stats-bar-name">{nombre}</span>
      </div>
      {subtitulo && (
        <div className="stats-bar-subtitulo">{subtitulo}</div>
      )}
      <div className="stats-bar-track">
        <div
          className="stats-bar-fill-animated"
          style={{
            width: animado ? `${pct}%` : '0%',
            background: color,
            transitionDelay: `${index * 60}ms`
          }}
        />
      </div>
      <div className="stats-bar-meta">
        <span className="stats-bar-ha">
          {Number(superficie.toFixed(0)).toLocaleString('es-MX')} ha
        </span>
        <span className="stats-bar-pct-estado" style={{ color }}>
          {pctEstado}%
        </span>
      </div>
    </div>
  );
};

// ── Modal principal ──────────────────────────────────────────────────────────
const ModalEstadisticas = ({
  elementosFiltrados,
  regionSeleccionada,
  municipioSeleccionado,
  filtroAnio,
  onCerrar
}) => {
  const [animado, setAnimado]   = useState(false);
  const [vista, setVista]       = useState('empresa'); // 'empresa' | 'concesion'

  // Reiniciar animación al cambiar de pestaña
  useEffect(() => {
    setAnimado(false);
    const t = setTimeout(() => setAnimado(true), 60);
    return () => clearTimeout(t);
  }, [vista]);

  // Primera animación al montar
  useEffect(() => {
    const t = setTimeout(() => setAnimado(true), 80);
    return () => clearTimeout(t);
  }, []);

  // ── Datos globales (KPIs) ────────────────────────────────
  const { totalSup, porcentajeEstado } = useMemo(() => {
    const totalSup       = elementosFiltrados.reduce((s, e) => s + parseFloat(e.superficie || 0), 0);
    const porcentajeEstado = ((totalSup / SUPERFICIE_GUERRERO_HA) * 100).toFixed(2);
    return { totalSup, porcentajeEstado };
  }, [elementosFiltrados]);

  // ── Datos vista EMPRESA ──────────────────────────────────
  const datosEmpresa = useMemo(() => {
    const mapa = new Map();

    elementosFiltrados.forEach(e => {
      const sup    = parseFloat(e.superficie || 0);
      if (!sup) return;
      const esOrden = e.tipo === 'orden_exploracion';
      const titular = esOrden ? (e.a_favor || 'Sin titular') : (e.titular || 'Sin titular');
      const empresas = titular.split('|').map(s => s.trim()).filter(Boolean);

      empresas.forEach(emp => {
        const actual = mapa.get(emp) || { superficie: 0, concesiones: 0, ordenes: 0 };
        mapa.set(emp, {
          superficie:  actual.superficie  + sup / empresas.length,
          concesiones: actual.concesiones + (esOrden ? 0 : 1),
          ordenes:     actual.ordenes     + (esOrden ? 1 : 0),
        });
      });
    });

    const arr = Array.from(mapa.entries())
      .map(([nombre, v]) => ({ nombre, ...v }))
      .sort((a, b) => b.superficie - a.superficie)
      .slice(0, 8);

    return { arr, maxSup: arr[0]?.superficie || 1 };
  }, [elementosFiltrados]);

  // ── Datos vista CONCESIÓN ────────────────────────────────
  const datosConcesion = useMemo(() => {
    const arr = elementosFiltrados
      .filter(e => e.tipo !== 'orden_exploracion')   // solo concesiones
      .map(e => ({
        nombre:    e.nombre_lote || `Título ${e.titulo}`,
        subtitulo: e.titular     || 'Sin titular',
        superficie: parseFloat(e.superficie || 0),
        titulo:    e.titulo,
        municipio: e.municipio,
      }))
      .filter(e => e.superficie > 0)
      .sort((a, b) => b.superficie - a.superficie)
      .slice(0, 10);

    return { arr, maxSup: arr[0]?.superficie || 1 };
  }, [elementosFiltrados]);

  // ── Contexto del subtitle ────────────────────────────────
  const contexto = regionSeleccionada
    ? `Región ${regionSeleccionada}`
    : municipioSeleccionado
    ? `Municipio ${municipioSeleccionado}`
    : filtroAnio
    ? `Año ${filtroAnio}`
    : 'Estado de Guerrero';

  const datosActivos = vista === 'empresa' ? datosEmpresa : datosConcesion;

  return (
    <div
      className="stats-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div className={`stats-modal ${animado ? 'stats-modal-in' : ''}`}>

        {/* ── Header ── */}
        <div className="stats-modal-header">
          <div className="stats-modal-header-left">
            <div>
              <h2 className="stats-modal-title">Estadísticas Mineras</h2>
              <p className="stats-modal-subtitle">{contexto}</p>
            </div>
          </div>
          <button className="stats-modal-close" onClick={onCerrar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── KPIs ── */}
        <div className="stats-kpis">
          <div className="stats-kpi">
            <span className="stats-kpi-value">{elementosFiltrados.length}</span>
            <span className="stats-kpi-label">Elementos totales</span>
          </div>
          <div className="stats-kpi stats-kpi-accent">
            <span className="stats-kpi-value">
              {Number(totalSup.toFixed(0)).toLocaleString('es-MX')} ha
            </span>
            <span className="stats-kpi-label">Superficie concesionada</span>
          </div>
          <div className="stats-kpi">
            <span className="stats-kpi-value stats-kpi-pct">{porcentajeEstado}%</span>
            <span className="stats-kpi-label">Del territorio de Guerrero</span>
          </div>
        </div>

        {/* ── Barra de progreso estado ── */}
        <div className="stats-state-bar-wrap">
          <div className="stats-state-bar-labels">
            <span>Superficie del estado de Guerrero (6,364,100 ha)</span>
            <span className="stats-state-bar-pct">{porcentajeEstado}%</span>
          </div>
          <div className="stats-state-bar-bg">
            <div
              className="stats-state-bar-fill"
              style={{ width: animado ? `${Math.min(parseFloat(porcentajeEstado), 100)}%` : '0%' }}
            />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="stats-tabs">
          <button
            className={`stats-tab-btn ${vista === 'empresa' ? 'active' : ''}`}
            onClick={() => setVista('empresa')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Por Empresa
          </button>
          <button
            className={`stats-tab-btn ${vista === 'concesion' ? 'active' : ''}`}
            onClick={() => setVista('concesion')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            Por Concesión
          </button>
        </div>

        {/* ── Gráfica ── */}
        <div className="stats-chart-section">
          <h3 className="stats-chart-title">
            {vista === 'empresa'
              ? 'Empresas con mayor superficie concesionada'
              : 'Concesiones más grandes en el filtro actual'}
            {datosActivos.arr.length === 0 && (
              <span className="stats-empty"> — Sin datos</span>
            )}
          </h3>

          <div className="stats-bars">
            {datosActivos.arr.map((item, i) => (
              <BaraItem
                key={vista === 'empresa' ? item.nombre : (item.titulo ?? i)}
                nombre={item.nombre}
                subtitulo={vista === 'concesion' ? item.subtitulo : null}
                superficie={item.superficie}
                maxSup={datosActivos.maxSup}
                color={COLORES[i % COLORES.length]}
                index={i}
                animado={animado}
              />
            ))}
          </div>
        </div>

        {/* ── Nota ── */}
        <p className="stats-footer-note">
          * Porcentajes calculados sobre la superficie total del estado de Guerrero (6,364,100 ha).
          {vista === 'concesion' && ' Vista "Por Concesión" excluye órdenes de exploración.'}
          {' '}Los datos reflejan únicamente los elementos visibles con los filtros actuales.
        </p>

      </div>
    </div>
  );
};

export default ModalEstadisticas;