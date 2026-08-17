import React, { useMemo, useState, useEffect } from 'react';

const SUPERFICIE_GUERRERO_HA = 6_364_100;
const SUPERFICIE_MEXICO_HA   = 196_437_500;
const SUPERFICIE_CONCESIONADA_GUERRERO_HA = 398_359;

const COLORES = [
  '#1E7B4F', '#A9812B', '#2F4858', '#8A4F14',
  '#3B5A6B', '#C8A44A', '#155A39', '#7E5F1E',
  '#223640', '#5E636D'
];

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
      padding: '13px 0', borderBottom: '1px solid #E7E3DA',
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
          fontSize: 15, fontWeight: 700, color: '#20242E', lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {nombre}
        </div>
        {subtitulo && (
          <div style={{
            fontSize: 12, color: '#5E636D', marginTop: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {subtitulo}
          </div>
        )}
        <div style={{
          height: 7, background: '#E7E3DA', borderRadius: 99,
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
            color: '#5E636D', background: '#F8F7F4', border: '1px solid #E7E3DA',
          }}>
            {pctTotal}% {totalLabel}
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#20242E' }}>{hectareas}</div>
        <div style={{ fontSize: 10, color: '#5E636D', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ha</div>
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
      padding: '13px 0', borderBottom: '1px solid #E7E3DA',
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
          fontSize: 15, fontWeight: 700, color: '#20242E', lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {orden.nombre || orden.num_orden}
        </div>
        <div style={{ fontSize: 12, color: '#5E636D', marginTop: 2 }}>
          {orden.num_orden} · {orden.municipio || orden.estado || '—'}
        </div>
        <div style={{
          height: 7, background: '#E7E3DA', borderRadius: 99,
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
            color: '#5E636D', background: '#F8F7F4', border: '1px solid #E7E3DA',
          }}>
            {orden.a_favor || 'SGM'}
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#20242E' }}>{hectareas}</div>
        <div style={{ fontSize: 10, color: '#5E636D', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ha</div>
      </div>
    </div>
  );
};

// ── KPI sin iconos ────────────────────────────────────────────────────────────
const KpiCell = ({ label, value, sub, accent, last }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '20px 16px', gap: 5, textAlign: 'center',
    borderRight: last ? 'none' : '1px solid #E7E3DA',
  }}>
    <div style={{
      fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', lineHeight: 1,
      color: accent ? '#2F4858' : '#20242E',
    }}>
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 12, color: '#A9812B', fontWeight: 700 }}>{sub}</div>
    )}
    <div style={{ fontSize: 12, color: '#5E636D', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
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
      .ms-scroll::-webkit-scrollbar-thumb { background:#E7E3DA; border-radius:4px }
      .ms-cerrar-btn:hover { background: #EDE9E1 !important; }
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
        borderBottom: '1px solid #E7E3DA',
        position: 'sticky', top: 0, zIndex: 2,
        background: '#fff', borderRadius: '20px 20px 0 0',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#20242E', letterSpacing: '-0.4px' }}>
            {titulo}
          </div>
          <div style={{ fontSize: 13, color: '#5E636D', marginTop: 5, fontWeight: 500 }}>
            {contexto}
          </div>
        </div>
        <button
          className="ms-cerrar-btn"
          onClick={onCerrar}
          style={{
            width: 36, height: 36, borderRadius: 9, border: 'none',
            background: '#EDE9E1', color: '#5E636D', cursor: 'pointer',
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
    fontSize: 11, fontWeight: 700, color: '#8B8F96',
    textTransform: 'uppercase', letterSpacing: '0.7px',
    marginBottom: 8,
  }}>
    {children}
  </div>
);

const Empty = () => (
  <div style={{ padding: '40px 0', textAlign: 'center', color: '#8B8F96', fontSize: 15 }}>
    Sin datos para los filtros actuales
  </div>
);

const Nota = ({ children }) => (
  <div style={{
    padding: '14px 32px 24px',
    fontSize: 12, color: '#5E636D', lineHeight: 1.7,
    borderTop: '1px solid #E7E3DA', marginTop: 8,
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

  const datosOrdenes = useMemo(() => {
    const arr = elementosFiltrados
      .filter(e => e.tipo === 'orden_exploracion')
      .map(e => ({ ...e, superficieNum: parseFloat(e.superficie || 0) }))
      .filter(e => e.superficieNum > 0)
      .sort((a, b) => b.superficieNum - a.superficieNum);
    return { arr, maxSup: arr[0]?.superficieNum || 1 };
  }, [elementosFiltrados]);

  const datosANP = useMemo(() => {
    if (!anps) return { arr: [], maxSup: 1 };
    const arr = [...anps]
      .map(a => ({ ...a, superficieNum: parseFloat(a.SUPERFICIE || 0) }))
      .filter(a => a.superficieNum > 0)
      .sort((a, b) => b.superficieNum - a.superficieNum);
    return { arr, maxSup: arr[0]?.superficieNum || 1 };
  }, [anps]);

  const activos = vista === 'empresa' ? datosEmpresa : datosConcesion;

  if (tipoElemento === 'ordenes') {
    const supTotal = datosOrdenes.arr.reduce((s, o) => s + o.superficieNum, 0);
    return (
      <ModalShell onCerrar={onCerrar} contexto={contexto} titulo="Estadísticas · Órdenes de Exploración">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid #E7E3DA' }}>
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

  if (tipoElemento === 'areas_naturales') {
    return (
      <ModalShell onCerrar={onCerrar} contexto={contexto} titulo="Estadísticas · Áreas Naturales Protegidas">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid #E7E3DA' }}>
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

  // ── Vista Concesiones ─────────────────────────────────────────────────────
  return (
    <ModalShell onCerrar={onCerrar} contexto={contexto} titulo="Estadísticas Mineras">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid #E7E3DA' }}>
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
              background: vista === tab.id ? '#2F4858' : '#F8F7F4',
              color:      vista === tab.id ? '#fff'    : '#5E636D',
              boxShadow:  vista === tab.id ? '0 2px 10px rgba(47,72,88,0.18)' : 'none',
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