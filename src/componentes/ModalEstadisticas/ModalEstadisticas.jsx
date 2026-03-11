import React, { useMemo, useState, useEffect } from 'react';

const SUPERFICIE_GUERRERO_HA = 6_364_100;
const SUPERFICIE_MEXICO_HA   = 196_437_500;
const SUPERFICIE_CONCESIONADA_GUERRERO_HA = 398_359;

const COLORES = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#6366f1',
  '#f43f5e', '#06b6d4'
];

// ── Gráfica de línea SVG ──────────────────────────────────────────────────────
const LineChart = ({ data }) => {
  const W = 720, H = 190;
  const PAD = { top: 20, right: 24, bottom: 48, left: 52 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  if (!data || data.length < 2) return null;

  const maxY = Math.max(...data.map(d => d.count)) * 1.15 || 1;
  const xStep = innerW / (data.length - 1);

  const toX = i => PAD.left + i * xStep;
  const toY = v => PAD.top + innerH - (v / maxY) * innerH;

  const pts  = data.map((d, i) => `${toX(i)},${toY(d.count)}`).join(' ');
  const area = [
    `M ${toX(0)},${toY(data[0].count)}`,
    ...data.slice(1).map((d, i) => `L ${toX(i + 1)},${toY(d.count)}`),
    `L ${toX(data.length - 1)},${PAD.top + innerH}`,
    `L ${toX(0)},${PAD.top + innerH}`,
    'Z'
  ].join(' ');

  const yTickVals = Array.from({ length: 5 }, (_, i) =>
    Math.round((maxY / 1.15 / 4) * i)
  );

  // Show every Nth label so x-axis is not crowded
  const labelStep = Math.ceil(data.length / 16);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, display: 'block' }}>
      <defs>
        <linearGradient id="lc-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#667eea" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#667eea" stopOpacity="0.00" />
        </linearGradient>
      </defs>

      {yTickVals.map(v => (
        <g key={v}>
          <line x1={PAD.left} y1={toY(v)} x2={PAD.left + innerW} y2={toY(v)}
            stroke="#eef0f8" strokeWidth="1" />
          <text x={PAD.left - 8} y={toY(v) + 4} textAnchor="end"
            fontSize="11" fill="#94a3b8" fontFamily="inherit">
            {v}
          </text>
        </g>
      ))}

      <path d={area} fill="url(#lc-grad)" />

      <polyline points={pts} fill="none" stroke="#667eea"
        strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />

      {data.map((d, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(d.count)} r="3.8"
            fill="white" stroke="#667eea" strokeWidth="2.2" />
          {i % labelStep === 0 && (
            <text
              x={toX(i)} y={PAD.top + innerH + 16}
              textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="inherit"
              transform={`rotate(-40, ${toX(i)}, ${PAD.top + innerH + 16})`}
            >
              {d.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};

// ── Fila de ranking genérica ──────────────────────────────────────────────────
const FilaRanking = ({
  numero, nombre, subtitulo, superficie, maxSup,
  totalBase, color, index, animado,
  pctLabel = 'del estado', pctBase = SUPERFICIE_GUERRERO_HA,
  totalLabel = '% del total concesionado',
}) => {
  const pctBarra  = (superficie / maxSup) * 100;
  const pctRef    = ((superficie / pctBase) * 100).toFixed(2);
  const pctTotal  = ((superficie / totalBase) * 100).toFixed(2);
  const hectareas = Number(superficie.toFixed(0)).toLocaleString('es-MX');

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '36px 1fr auto',
      gap: '0 16px', alignItems: 'start',
      padding: '13px 0', borderBottom: '1px solid #f1f5f9',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800, color, flexShrink: 0, marginTop: 2,
      }}>
        {numero}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 700, color: '#1e293b', lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {nombre}
        </div>
        {subtitulo && (
          <div style={{
            fontSize: 12, color: '#94a3b8', marginTop: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {subtitulo}
          </div>
        )}
        <div style={{
          height: 7, background: '#f1f5f9', borderRadius: 99,
          overflow: 'hidden', margin: '8px 0 7px',
        }}>
          <div style={{
            height: '100%', borderRadius: 99, background: color, opacity: 0.85,
            width: animado ? `${pctBarra}%` : '0%',
            transition: `width 0.8s cubic-bezier(0.34,1.2,0.64,1) ${index * 45}ms`,
          }} />
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            color, background: `${color}15`, border: `1px solid ${color}30`,
          }}>
            {pctRef}% {pctLabel}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0',
          }}>
            {pctTotal}% {totalLabel}
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{hectareas}</div>
        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ha</div>
      </div>
    </div>
  );
};

// ── Fila orden (vs México) ────────────────────────────────────────────────────
const FilaOrden = ({ numero, orden, maxSup, color, index, animado }) => {
  const sup       = parseFloat(orden.superficie || 0);
  const pctBarra  = (sup / maxSup) * 100;
  const pctMexico = ((sup / SUPERFICIE_MEXICO_HA) * 100).toFixed(5);
  const hectareas = Number(sup.toFixed(0)).toLocaleString('es-MX');

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '36px 1fr auto',
      gap: '0 16px', alignItems: 'start',
      padding: '13px 0', borderBottom: '1px solid #f1f5f9',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800, color, flexShrink: 0, marginTop: 2,
      }}>
        {numero}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 700, color: '#1e293b', lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {orden.nombre || orden.num_orden}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
          {orden.num_orden} · {orden.municipio || orden.estado || '—'}
        </div>
        <div style={{
          height: 7, background: '#f1f5f9', borderRadius: 99,
          overflow: 'hidden', margin: '8px 0 7px',
        }}>
          <div style={{
            height: '100%', borderRadius: 99, background: color, opacity: 0.85,
            width: animado ? `${pctBarra}%` : '0%',
            transition: `width 0.8s cubic-bezier(0.34,1.2,0.64,1) ${index * 45}ms`,
          }} />
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            color, background: `${color}15`, border: `1px solid ${color}30`,
          }}>
            {pctMexico}% de México
          </span>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0',
          }}>
            {orden.a_favor || 'SGM'}
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{hectareas}</div>
        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ha</div>
      </div>
    </div>
  );
};

// ── KPI sin iconos ────────────────────────────────────────────────────────────
const KpiCell = ({ label, value, sub, accent, last }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '20px 16px', gap: 5, textAlign: 'center',
    borderRight: last ? 'none' : '1px solid #f1f5f9',
  }}>
    <div style={{
      fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', lineHeight: 1,
      color: accent ? '#667eea' : '#0f172a',
    }}>
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 700 }}>{sub}</div>
    )}
    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
      {label}
    </div>
  </div>
);

// ── Shell del modal ───────────────────────────────────────────────────────────
const ModalShell = ({ children, onCerrar, titulo, contexto }) => (
  <div
    onClick={e => e.target === e.currentTarget && onCerrar()}
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(8,8,20,0.70)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      animation: 'msFadeIn 0.22s ease',
    }}
  >
    <style>{`
      @keyframes msFadeIn  { from{opacity:0} to{opacity:1} }
      @keyframes msSlideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      .ms-scroll::-webkit-scrollbar       { width:5px }
      .ms-scroll::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px }
      .ms-cerrar-btn:hover { background: #e2e8f0 !important; }
    `}</style>

    <div className="ms-scroll" style={{
      width: '100%', maxWidth: 820,
      maxHeight: '92vh', overflowY: 'auto',
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 32px 80px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.06)',
      animation: 'msSlideUp 0.28s cubic-bezier(0.34,1.2,0.64,1)',
    }}>
      {/* Header sticky */}
      <div style={{
        padding: '26px 32px 22px',
        borderBottom: '1px solid #f1f5f9',
        position: 'sticky', top: 0, zIndex: 2,
        background: '#fff', borderRadius: '20px 20px 0 0',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
            {titulo}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 5, fontWeight: 500 }}>
            {contexto}
          </div>
        </div>
        <button
          className="ms-cerrar-btn"
          onClick={onCerrar}
          style={{
            width: 36, height: 36, borderRadius: 9, border: 'none',
            background: '#f1f5f9', color: '#64748b', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {children}
    </div>
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 700, color: '#cbd5e1',
    textTransform: 'uppercase', letterSpacing: '0.7px',
    marginBottom: 8,
  }}>
    {children}
  </div>
);

const Empty = () => (
  <div style={{ padding: '40px 0', textAlign: 'center', color: '#cbd5e1', fontSize: 15 }}>
    Sin datos para los filtros actuales
  </div>
);

const Nota = ({ children }) => (
  <div style={{
    padding: '14px 32px 24px',
    fontSize: 12, color: '#94a3b8', lineHeight: 1.7,
    borderTop: '1px solid #f1f5f9', marginTop: 8,
  }}>
    {children}
  </div>
);

// ── Modal principal ───────────────────────────────────────────────────────────
const ModalEstadisticas = ({
  elementosFiltrados,
  anps,
  tipoElemento,
  regionSeleccionada,
  municipioSeleccionado,
  filtroAnio,
  onCerrar,
}) => {
  const [animado, setAnimado] = useState(false);
  const [vista, setVista]     = useState('empresa');

  useEffect(() => {
    setAnimado(false);
    const t = setTimeout(() => setAnimado(true), 60);
    return () => clearTimeout(t);
  }, [vista, tipoElemento]);

  useEffect(() => {
    const t = setTimeout(() => setAnimado(true), 80);
    return () => clearTimeout(t);
  }, []);

  const contexto = regionSeleccionada   ? `Región ${regionSeleccionada}`
    : municipioSeleccionado             ? `Municipio de ${municipioSeleccionado}`
    : filtroAnio                        ? `Año ${filtroAnio}`
    : 'Estado de Guerrero';

  // ── KPIs concesiones ──
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

  // ── KPIs ANP ──
  const kpisANP = useMemo(() => {
    if (!anps?.length) return null;
    const sup = anps.reduce((s, a) => s + parseFloat(a.SUPERFICIE || 0), 0);
    return {
      total:      anps.length,
      superficie: sup,
      pctEstado:  ((sup / SUPERFICIE_GUERRERO_HA) * 100).toFixed(2),
      municipios: new Set(
        anps.flatMap(a => (a.MUNICIPIOS || '').split(',').map(m => m.trim()))
      ).size,
      categorias: new Set(anps.map(a => a.CAT_MANEJO).filter(Boolean)).size,
    };
  }, [anps]);

  // ── Top empresas ──
  const datosEmpresa = useMemo(() => {
    const mapa = new Map();
    elementosFiltrados.forEach(e => {
      const sup = parseFloat(e.superficie || 0);
      if (!sup) return;
      const raw = e.tipo === 'orden_exploracion' ? (e.a_favor || 'Sin titular') : (e.titular || 'Sin titular');
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

  // ── Top concesiones ──
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

  // ── Órdenes ──
  const datosOrdenes = useMemo(() => {
    const arr = elementosFiltrados
      .filter(e => e.tipo === 'orden_exploracion')
      .map(e => ({ ...e, superficieNum: parseFloat(e.superficie || 0) }))
      .filter(e => e.superficieNum > 0)
      .sort((a, b) => b.superficieNum - a.superficieNum);
    return { arr, maxSup: arr[0]?.superficieNum || 1 };
  }, [elementosFiltrados]);

  // ── ANPs ──
  const datosANP = useMemo(() => {
    if (!anps) return { arr: [], maxSup: 1 };
    const arr = [...anps]
      .map(a => ({ ...a, superficieNum: parseFloat(a.SUPERFICIE || 0) }))
      .filter(a => a.superficieNum > 0)
      .sort((a, b) => b.superficieNum - a.superficieNum);
    return { arr, maxSup: arr[0]?.superficieNum || 1 };
  }, [anps]);

  // ── Línea por año (siempre por año, nunca por década) ──
  const datosLinea = useMemo(() => {
    const conteo = {};
    elementosFiltrados
      .filter(e => e.tipo !== 'orden_exploracion')
      .forEach(c => {
        if (!c.fecha_inicio) return;
        const partes = c.fecha_inicio.split('/');
        if (partes.length !== 3) return;
        let anio = partes[2];
        if (anio.length === 2) anio = parseInt(anio) > 50 ? '19' + anio : '20' + anio;
        const num = parseInt(anio);
        if (isNaN(num) || num < 1900 || num > 2100) return;
        conteo[num] = (conteo[num] || 0) + 1;
      });
    return Object.entries(conteo)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([anio, count]) => ({ label: anio, count }));
  }, [elementosFiltrados]);

  const activos = vista === 'empresa' ? datosEmpresa : datosConcesion;

  // ════════════════════════════════════════════════════════════════════════════
  // VISTA: ÓRDENES
  // ════════════════════════════════════════════════════════════════════════════
  if (tipoElemento === 'ordenes') {
    const supTotal = datosOrdenes.arr.reduce((s, o) => s + o.superficieNum, 0);
    return (
      <ModalShell onCerrar={onCerrar} contexto={contexto} titulo="Estadísticas · Órdenes de Exploración">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid #f1f5f9' }}>
          <KpiCell label="Órdenes"          value={datosOrdenes.arr.length} />
          <KpiCell label="Superficie total"  value={`${Number(supTotal.toFixed(0)).toLocaleString('es-MX')} ha`} />
          <KpiCell label="% de México"       value={`${((supTotal / SUPERFICIE_MEXICO_HA) * 100).toFixed(4)}%`} accent last />
        </div>

        <div style={{ padding: '20px 32px 4px' }}>
          <SectionLabel>Ordenadas por superficie · comparadas con la superficie de México (196,437,500 ha)</SectionLabel>
        </div>
        <div style={{ padding: '4px 32px 14px' }}>
          {datosOrdenes.arr.length === 0 ? <Empty /> : datosOrdenes.arr.map((orden, i) => (
            <FilaOrden
              key={orden.num_orden || i}
              numero={i + 1}
              orden={orden}
              maxSup={datosOrdenes.maxSup}
              color={COLORES[i % COLORES.length]}
              index={i}
              animado={animado}
            />
          ))}
        </div>
        <Nota>
          * "% de México" calculado sobre la superficie total de México (196,437,500 ha ≈ 1,964,375 km²).
          Las órdenes son asignadas al Servicio Geológico Mexicano para exploración de recursos minerales.
        </Nota>
      </ModalShell>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VISTA: ÁREAS NATURALES PROTEGIDAS
  // ════════════════════════════════════════════════════════════════════════════
  if (tipoElemento === 'areas_naturales') {
    return (
      <ModalShell onCerrar={onCerrar} contexto={contexto} titulo="Estadísticas · Áreas Naturales Protegidas">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid #f1f5f9' }}>
          <KpiCell label="Total ANPs"    value={kpisANP?.total ?? 0} />
          <KpiCell label="Municipios"    value={kpisANP?.municipios ?? 0} />
          <KpiCell label="Categorías"    value={kpisANP?.categorias ?? 0} />
          <KpiCell
            label="% de Guerrero"
            value={`${kpisANP?.pctEstado ?? '0'}%`}
            sub={`${Number((kpisANP?.superficie ?? 0).toFixed(0)).toLocaleString('es-MX')} ha`}
            accent last
          />
        </div>

        <div style={{ padding: '20px 32px 4px' }}>
          <SectionLabel>Ordenadas por superficie · comparadas con el estado de Guerrero (6,364,100 ha)</SectionLabel>
        </div>
        <div style={{ padding: '4px 32px 14px' }}>
          {datosANP.arr.length === 0 ? <Empty /> : datosANP.arr.map((anp, i) => (
            <FilaRanking
              key={anp.ID_ANP || i}
              numero={i + 1}
              nombre={anp.NOMBRE}
              subtitulo={`${anp.CAT_MANEJO} · ${anp.MUNICIPIOS?.split(',')[0]?.trim() || '—'}`}
              superficie={anp.superficieNum}
              maxSup={datosANP.maxSup}
              totalBase={kpisANP?.superficie || 1}
              color={COLORES[i % COLORES.length]}
              index={i}
              animado={animado}
              pctBase={SUPERFICIE_GUERRERO_HA}
              pctLabel="de Guerrero"
              totalLabel="del total ANPs"
            />
          ))}
        </div>
        <Nota>
          * "% de Guerrero" calculado sobre la superficie total del estado (6,364,100 ha).
          "% del total ANPs" sobre la suma de superficie de todas las ANPs mostradas.
          Fuente: CONANP 2024.
        </Nota>
      </ModalShell>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // VISTA: CONCESIONES (default)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <ModalShell onCerrar={onCerrar} contexto={contexto} titulo="Estadísticas Mineras">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid #f1f5f9' }}>
        <KpiCell label="Registros"    value={kpis.total.toLocaleString('es-MX')} />
        <KpiCell label="Vigentes"     value={kpis.vigentes.toLocaleString('es-MX')} />
        <KpiCell label="Municipios"   value={kpis.municipios} />
        <KpiCell
          label="% de Guerrero"
          value={`${kpis.pctEstado}%`}
          sub={`${Number(kpis.superficie.toFixed(0)).toLocaleString('es-MX')} ha`}
          accent last
        />
      </div>

      {/* Gráfica por año */}
      {datosLinea.length > 1 && (
        <div style={{ padding: '22px 32px 10px' }}>
          <SectionLabel>Concesiones otorgadas por año</SectionLabel>
          <LineChart data={datosLinea} />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '18px 32px 0' }}>
        {[
          { id: 'empresa',   label: 'Top 10 Empresas con mayor superficie concesionada' },
          { id: 'concesion', label: 'Top 10 Concesiones con mayor superficie' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setVista(tab.id)}
            style={{
              padding: '9px 22px', borderRadius: 9, border: 'none',
              fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              background: vista === tab.id ? '#0f172a' : '#f1f5f9',
              color:      vista === tab.id ? '#fff'    : '#64748b',
              boxShadow:  vista === tab.id ? '0 2px 10px rgba(15,23,42,0.18)' : 'none',
              transition: 'all 0.18s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 32px 4px' }}>
        <SectionLabel>
          {vista === 'empresa'
            ? 'Ordenado por superficie concesionada acumulada'
            : 'Solo concesiones · ordenado por superficie'}
        </SectionLabel>
      </div>

      <div style={{ padding: '4px 32px 14px' }}>
        {activos.arr.length === 0 ? <Empty /> : activos.arr.map((item, i) => (
          <FilaRanking
            key={vista === 'empresa' ? item.nombre : (item.titulo ?? i)}
            numero={i + 1}
            nombre={item.nombre}
            subtitulo={vista === 'concesion' ? item.subtitulo : null}
            superficie={item.superficie}
            maxSup={activos.maxSup}
            totalBase={SUPERFICIE_CONCESIONADA_GUERRERO_HA}
            color={COLORES[i % COLORES.length]}
            index={i}
            animado={animado}
            pctBase={SUPERFICIE_GUERRERO_HA}
            pctLabel="del estado de Guerrero"
            totalLabel="del total concesionado"
          />
        ))}
      </div>

      <Nota>
        * "% del estado" calculado sobre la superficie total de Guerrero (6,364,100 ha).
        "% del total concesionado" sobre la superficie visible con los filtros actuales.
        {vista === 'concesion' && ' La vista por concesión excluye órdenes de exploración.'}
      </Nota>
    </ModalShell>
  );
};

export default ModalEstadisticas;