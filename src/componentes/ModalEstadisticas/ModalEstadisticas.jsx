import React, { useMemo, useState, useEffect } from 'react';

const SUPERFICIE_GUERRERO_HA = 6_364_100;

const COLORES = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#6366f1',
  '#f43f5e', '#06b6d4'
];

// ── Fila de ranking ───────────────────────────────────────────────────────────
const FilaRanking = ({ numero, nombre, subtitulo, superficie, maxSup, totalConcesionado, color, index, animado }) => {
  const pctBarra  = (superficie / maxSup) * 100;
  const pctEstado = ((superficie / SUPERFICIE_GUERRERO_HA) * 100).toFixed(2);
  const pctTotal  = ((superficie / totalConcesionado) * 100).toFixed(1);
  const hectareas = Number(superficie.toFixed(0)).toLocaleString('es-MX');

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '28px 1fr auto',
      gap: '0 10px',
      alignItems: 'start',
      padding: '10px 0',
      borderBottom: '1px solid #f8fafc',
    }}>
      {/* Badge número */}
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, color, flexShrink: 0, marginTop: 1,
      }}>
        {numero}
      </div>

      {/* Nombre + barra + chips */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: '#1e293b', lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {nombre}
        </div>
        {subtitulo && (
          <div style={{
            fontSize: 10, color: '#94a3b8', marginTop: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {subtitulo}
          </div>
        )}
        {/* Barra */}
        <div style={{
          height: 6, background: '#f1f5f9', borderRadius: 99,
          overflow: 'hidden', margin: '7px 0 5px',
        }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: color, opacity: 0.85,
            width: animado ? `${pctBarra}%` : '0%',
            transition: `width 0.8s cubic-bezier(0.34,1.2,0.64,1) ${index * 50}ms`,
          }} />
        </div>
        {/* Porcentajes */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
            color, background: `${color}15`, border: `1px solid ${color}28`,
          }}>
            {pctEstado}% del estado
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
            color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0',
          }}>
            {pctTotal}% del total
          </span>
        </div>
      </div>

      {/* Hectáreas */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{hectareas}</div>
        <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>ha</div>
      </div>
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const ModalEstadisticas = ({
  elementosFiltrados,
  regionSeleccionada,
  municipioSeleccionado,
  filtroAnio,
  onCerrar
}) => {
  const [animado, setAnimado] = useState(false);
  const [vista, setVista]     = useState('empresa');

  useEffect(() => {
    setAnimado(false);
    const t = setTimeout(() => setAnimado(true), 60);
    return () => clearTimeout(t);
  }, [vista]);

  useEffect(() => {
    const t = setTimeout(() => setAnimado(true), 80);
    return () => clearTimeout(t);
  }, []);

  const kpis = useMemo(() => {
    const superficie = elementosFiltrados.reduce((s, e) => s + parseFloat(e.superficie || 0), 0);
    return {
      total:      elementosFiltrados.length,
      vigentes:   elementosFiltrados.filter(e => e.estado === 'Vigente').length,
      municipios: new Set(elementosFiltrados.map(e => e.municipio).filter(Boolean)).size,
      superficie,
      pctEstado:  ((superficie / SUPERFICIE_GUERRERO_HA) * 100).toFixed(2),
    };
  }, [elementosFiltrados]);

  const datosEmpresa = useMemo(() => {
    const mapa = new Map();
    elementosFiltrados.forEach(e => {
      const sup  = parseFloat(e.superficie || 0);
      if (!sup) return;
      const raw  = e.tipo === 'orden_exploracion' ? (e.a_favor || 'Sin titular') : (e.titular || 'Sin titular');
      const partes = raw.split('|').map(s => s.trim()).filter(Boolean);
      partes.forEach(emp => {
        const prev = mapa.get(emp) || { superficie: 0 };
        mapa.set(emp, { superficie: prev.superficie + sup / partes.length });
      });
    });
    const arr = Array.from(mapa.entries())
      .map(([nombre, v]) => ({ nombre, superficie: v.superficie }))
      .sort((a, b) => b.superficie - a.superficie).slice(0, 10);
    return { arr, maxSup: arr[0]?.superficie || 1 };
  }, [elementosFiltrados]);

  const datosConcesion = useMemo(() => {
    const arr = elementosFiltrados
      .filter(e => e.tipo !== 'orden_exploracion')
      .map(e => ({
        nombre:     e.nombre_lote || `Título ${e.titulo}`,
        subtitulo:  e.titular || '',
        superficie: parseFloat(e.superficie || 0),
        titulo:     e.titulo,
      }))
      .filter(e => e.superficie > 0)
      .sort((a, b) => b.superficie - a.superficie).slice(0, 10);
    return { arr, maxSup: arr[0]?.superficie || 1 };
  }, [elementosFiltrados]);

  const activos = vista === 'empresa' ? datosEmpresa : datosConcesion;

  const contexto = regionSeleccionada ? `Región ${regionSeleccionada}`
    : municipioSeleccionado           ? `Municipio de ${municipioSeleccionado}`
    : filtroAnio                      ? `Año ${filtroAnio}`
    : 'Estado de Guerrero';

  return (
    <div
      onClick={e => e.target === e.currentTarget && onCerrar()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(8,8,20,0.68)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'msFadeIn 0.22s ease',
      }}
    >
      <style>{`
        @keyframes msFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes msSlideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .ms-scroll::-webkit-scrollbar       { width:4px }
        .ms-scroll::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px }
        .ms-tab-btn { transition: all 0.18s ease !important; }
        .ms-tab-btn:hover { opacity: 0.85; }
        .ms-cerrar-btn:hover { background: #e2e8f0 !important; }
        @media(max-width:560px){
          .ms-kpis { grid-template-columns: 1fr 1fr !important; }
          .ms-kpi-sup { border-right: none !important; border-top: 1px solid #f1f5f9 !important; }
          .ms-kpi-mun { border-right: none !important; }
        }
      `}</style>

      {/* Panel */}
      <div className="ms-scroll" style={{
        width: '100%', maxWidth: 580,
        maxHeight: '92vh', overflowY: 'auto',
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 32px 72px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.06)',
        animation: 'msSlideUp 0.28s cubic-bezier(0.34,1.2,0.64,1)',
      }}>

        {/* HEADER */}
        <div style={{
          padding: '22px 24px 18px',
          borderBottom: '1px solid #f1f5f9',
          position: 'sticky', top: 0, zIndex: 2,
          background: '#fff', borderRadius: '20px 20px 0 0',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
              Estadísticas Mineras
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3, fontWeight: 500 }}>
              {contexto}
            </div>
          </div>
          <button
            className="ms-cerrar-btn"
            onClick={onCerrar}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: '#f1f5f9', color: '#64748b', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.15s',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* KPIs */}
        <div className="ms-kpis" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          borderBottom: '1px solid #f1f5f9',
        }}>
          {/* Registros */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'16px 10px', gap:3, textAlign:'center', borderRight:'1px solid #f1f5f9' }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:4 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <div style={{ fontSize:20, fontWeight:800, color:'#0f172a', letterSpacing:'-0.5px', lineHeight:1 }}>{kpis.total.toLocaleString('es-MX')}</div>
            <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px' }}>Registros</div>
          </div>

          {/* Vigentes */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'16px 10px', gap:3, textAlign:'center', borderRight:'1px solid #f1f5f9' }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:4 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div style={{ fontSize:20, fontWeight:800, color:'#0f172a', letterSpacing:'-0.5px', lineHeight:1 }}>{kpis.vigentes.toLocaleString('es-MX')}</div>
            <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px' }}>Vigentes</div>
          </div>

          {/* Municipios */}
          <div className="ms-kpi-mun" style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'16px 10px', gap:3, textAlign:'center', borderRight:'1px solid #f1f5f9' }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'#fff7ed', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:4 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div style={{ fontSize:20, fontWeight:800, color:'#0f172a', letterSpacing:'-0.5px', lineHeight:1 }}>{kpis.municipios}</div>
            <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px' }}>Municipios</div>
          </div>

          {/* Superficie */}
          <div className="ms-kpi-sup" style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'16px 10px', gap:3, textAlign:'center' }}>
            <div style={{ width:34, height:34, borderRadius:9, background:'#faf5ff', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:4 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div style={{ fontSize:14, fontWeight:800, color:'#0f172a', letterSpacing:'-0.4px', lineHeight:1.1 }}>
              {Number(kpis.superficie.toFixed(0)).toLocaleString('es-MX')} ha
            </div>
            <div style={{ fontSize:10, color:'#8b5cf6', fontWeight:700, letterSpacing:'0.1px' }}>{kpis.pctEstado}% de Guerrero</div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display:'flex', gap:6, padding:'18px 24px 0' }}>
          {[
            { id:'empresa',   label:'Top 10 Empresas' },
            { id:'concesion', label:'Top 10 Concesiones' },
          ].map(tab => (
            <button
              key={tab.id}
              className="ms-tab-btn"
              onClick={() => setVista(tab.id)}
              style={{
                padding:'7px 16px', borderRadius:8, border:'none',
                fontSize:12, fontWeight:700, fontFamily:'inherit', cursor:'pointer',
                background: vista === tab.id ? '#0f172a' : '#f8fafc',
                color:      vista === tab.id ? '#fff'    : '#64748b',
                boxShadow:  vista === tab.id ? '0 2px 8px rgba(15,23,42,0.18)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SUBTÍTULO DE SECCIÓN */}
        <div style={{ padding:'14px 24px 0' }}>
          <div style={{
            fontSize:10, fontWeight:700, color:'#cbd5e1',
            textTransform:'uppercase', letterSpacing:'0.6px',
          }}>
            {vista === 'empresa'
              ? 'Ordenado por superficie concesionada acumulada'
              : 'Solo concesiones · ordenado por superficie'}
          </div>
        </div>

        {/* FILAS */}
        <div style={{ padding:'4px 24px 8px' }}>
          {activos.arr.length === 0 ? (
            <div style={{ padding:'32px 0', textAlign:'center', color:'#cbd5e1', fontSize:13 }}>
              Sin datos para los filtros actuales
            </div>
          ) : (
            activos.arr.map((item, i) => (
              <FilaRanking
                key={vista === 'empresa' ? item.nombre : (item.titulo ?? i)}
                numero={i + 1}
                nombre={item.nombre}
                subtitulo={vista === 'concesion' ? item.subtitulo : null}
                superficie={item.superficie}
                maxSup={activos.maxSup}
                totalConcesionado={kpis.superficie}
                color={COLORES[i % COLORES.length]}
                index={i}
                animado={animado}
              />
            ))
          )}
        </div>

        {/* NOTA */}
        <div style={{
          padding:'12px 24px 20px',
          fontSize:10, color:'#94a3b8', lineHeight:1.6,
          borderTop:'1px solid #f1f5f9', marginTop:8,
        }}>
          * "% del estado" calculado sobre la superficie total de Guerrero (6,364,100 ha).
          "% del total" sobre la superficie visible con los filtros actuales.
          {vista === 'concesion' && ' Vista por concesión excluye órdenes de exploración.'}
        </div>

      </div>
    </div>
  );
};

export default ModalEstadisticas;