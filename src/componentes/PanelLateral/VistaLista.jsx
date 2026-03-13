import React, { useMemo, useCallback, memo } from 'react';
import TarjetaEstadistica from './componentes/TarjetaEstadistica';
import ElementoLista from './componentes/ElementoLista';
import { LIMITES_VISUALIZACION } from '../../utilidades/constantes';

const CAT_INFO = {
  'RB':   { nombre: 'Reserva de Biosfera',              color: '#16a34a' },
  'PN':   { nombre: 'Parque Nacional',                  color: '#2563eb' },
  'MN':   { nombre: 'Monumento Natural',                color: '#9333ea' },
  'AP':   { nombre: 'Área de Protección',               color: '#d97706' },
  'SANT': { nombre: 'Santuario',                        color: '#0d9488' },
  'SB':   { nombre: 'Santuario',                        color: '#0d9488' },
  'FL':   { nombre: 'Área de Protección Flora y Fauna', color: '#db2777' },
};

/**
 * Convierte el ID_ANP a nombre de archivo
 * Ej: "6.1.03.137" → "6_1_03_137"
 */
const idAnpANombreArchivo = (idAnp) => {
  if (!idAnp) return null;
  return idAnp.replace(/\./g, '_');
};

// ── Botón de descarga PDF pequeño (para la lista) ────────────────────────────
const BtnPDFListaItem = memo(({ idAnp, nombreAnp, onClick }) => {
  const nombreArchivo = idAnpANombreArchivo(idAnp);
  if (!nombreArchivo) return null;

  const rutaPDF = `/pdfs-anp/${nombreArchivo}.pdf`;

  return (
    <a
      href={rutaPDF}
      target="_blank"
      rel="noopener noreferrer"
      download={`ANP_${nombreArchivo}.pdf`}
      title={`Descargar PDF de ${nombreAnp}`}
      className="anp-lista-pdf-btn"
      onClick={(e) => e.stopPropagation()} // evita seleccionar el item al hacer clic en el botón
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      PDF
    </a>
  );
});
BtnPDFListaItem.displayName = 'BtnPDFListaItem';

// ── Lista de ANP ──────────────────────────────────────────────────────────────
const ListaANP = memo(({ anps, onSeleccionar }) => {
  if (!anps || anps.length === 0) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
        No hay áreas naturales protegidas disponibles
      </div>
    );
  }

  return (
    <>
      <style>{`
        .anp-lista-pdf-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: linear-gradient(135deg, #166534 0%, #15803d 100%);
          color: white;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: 0.03em;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(21, 128, 61, 0.25);
          flex-shrink: 0;
          white-space: nowrap;
        }

        .anp-lista-pdf-btn:hover {
          background: linear-gradient(135deg, #14532d 0%, #166534 100%);
          box-shadow: 0 3px 10px rgba(21, 128, 61, 0.4);
          transform: translateY(-1px);
        }

        .anp-lista-pdf-btn:active {
          transform: translateY(0);
        }

        /* Row que contiene detalles + botón PDF */
        .anp-item-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 6px;
        }

        .anp-item-details {
          font-size: 11px;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          min-width: 0;
        }
      `}</style>

      <div className="concesiones-list">
        {anps.map((anp) => {
          const cat = CAT_INFO[anp.CAT_MANEJO] || { nombre: anp.CAT_MANEJO || 'ANP', color: '#6b7280' };
          const sup = anp.SUPERFICIE
            ? Number(parseFloat(anp.SUPERFICIE).toFixed(0)).toLocaleString('es-MX') + ' ha'
            : '—';

          return (
            <div key={anp.ID_ANP} className="concesion-item" onClick={() => onSeleccionar(anp)}>
              {/* Nombre */}
              <div className="concesion-name">
                <span
                  className="concesion-status-dot"
                  style={{ backgroundColor: cat.color, boxShadow: `0 0 5px ${cat.color}55` }}
                />
                {anp.NOMBRE}
              </div>

              {/* Categoría */}
              <div className="concesion-titular" style={{ color: cat.color, fontWeight: 600, fontSize: '11px' }}>
                {cat.nombre}
              </div>

              {/* Footer: detalles + botón PDF */}
              <div className="anp-item-footer">
                <div className="anp-item-details">
                  <span>{anp.MUNICIPIOS?.split(',')[0]?.trim() || '—'}</span>
                  <span className="detail-separator">•</span>
                  <span>{sup}</span>
                  <span className="detail-separator">•</span>
                  <span style={{
                    display: 'inline-block', padding: '1px 6px',
                    background: cat.color, color: 'white',
                    borderRadius: '4px', fontSize: '10px', fontWeight: 700
                  }}>
                    {anp.CAT_MANEJO}
                  </span>
                </div>

                {/* Botón de descarga PDF */}
                <BtnPDFListaItem idAnp={anp.ID_ANP} nombreAnp={anp.NOMBRE} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
});
ListaANP.displayName = 'ListaANP';

// ── Estadísticas ANP ──────────────────────────────────────────────────────────
const EstadisticasANP = memo(({ anps }) => {
  const stats = useMemo(() => {
    const total = anps.length;
    const supTotal = anps.reduce((s, a) => s + parseFloat(a.SUPERFICIE || 0), 0);
    const municipiosUnicos = new Set(
      anps.flatMap(a => (a.MUNICIPIOS || '').split(',').map(m => m.trim()))
    ).size;
    const categorias = new Set(anps.map(a => a.CAT_MANEJO).filter(Boolean)).size;
    return { total, supTotal, municipiosUnicos, categorias };
  }, [anps]);

  return (
    <div className="stats-grid">
      <TarjetaEstadistica icono="chart"    etiqueta="Total ANP"   valor={stats.total}            color="color-green"  />
      <TarjetaEstadistica icono="building" etiqueta="Municipios"  valor={stats.municipiosUnicos}  color="color-violet" />
      <TarjetaEstadistica icono="check"    etiqueta="Categorías"  valor={stats.categorias}        color="color-purple" />
      <TarjetaEstadistica
        icono="area"
        etiqueta="Superficie"
        valor={`${Number(stats.supTotal.toFixed(0)).toLocaleString('es-MX')} ha`}
        color="color-orange"
        pequeno
      />
    </div>
  );
});
EstadisticasANP.displayName = 'EstadisticasANP';

// ── Componente principal ──────────────────────────────────────────────────────
const VistaLista = memo(({
  elementos,
  anps,
  onSeleccionarElemento,
  onSeleccionarANP,
  esMovil,
  tipoElemento,
  onCambiarTipo,
  totalConcesiones,
  totalOrdenes,
  totalANPs,
  onMostrarEstadisticas
}) => {
  const estadisticas = useMemo(() => {
    const totalElementos    = elementos.length;
    const municipiosUnicos  = new Set(elementos.map(e => e.municipio)).size;
    const elementosVigentes = elementos.filter(e => e.estado === 'Vigente').length;
    const superficieTotal   = elementos.reduce(
      (suma, e) => suma + parseFloat(e.superficie || 0), 0
    ).toFixed(0);
    return { totalElementos, municipiosUnicos, elementosVigentes, superficieTotal };
  }, [elementos]);

  const elementosMostrados = useMemo(() =>
    elementos.slice(0, LIMITES_VISUALIZACION.maximoElementosLista),
    [elementos]
  );

  const hayMasElementos      = elementos.length > LIMITES_VISUALIZACION.maximoElementosLista;
  const manejarClickElemento = useCallback((el) => onSeleccionarElemento(el), [onSeleccionarElemento]);
  const esANP = tipoElemento === 'areas_naturales';

  const TIPO_HEADER = {
    concesiones:     { titulo: 'Concesiones Mineras',        color: '#e8a838', gradiente: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    ordenes:         { titulo: 'Órdenes de Exploración',     color: '#5b9cf6', gradiente: 'linear-gradient(135deg, #3b6fd4 0%, #5b9cf6 100%)' },
    areas_naturales: { titulo: 'Áreas Naturales Protegidas', color: '#4ade80', gradiente: 'linear-gradient(135deg, #166534 0%, #15803d 100%)' },
  };
  const headerInfo = TIPO_HEADER[tipoElemento] || TIPO_HEADER.concesiones;

  return (
    <div className="side-panel-content">
      {/* ── Header ── */}
      <div
        className="panel-header panel-header-main"
        style={{ background: headerInfo.gradiente }}
      >
        <h2 className="panel-title">{headerInfo.titulo}</h2>
        <p className="panel-subtitle">Estado de Guerrero</p>

        <button
          onClick={onMostrarEstadisticas}
          className="panel-btn-estadisticas"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
            <line x1="2" y1="20" x2="22" y2="20"/>
          </svg>
          Estadísticas
        </button>
      </div>

      {/* ── Vista ANP ── */}
      {esANP ? (
        <div className="scrollable-content-list">
          <EstadisticasANP anps={anps} />
          <h3 className="concesiones-list-header" style={{ marginTop: '8px' }}>
            Áreas Naturales Protegidas ({anps.length})
          </h3>
          <ListaANP anps={anps} onSeleccionar={onSeleccionarANP} />
        </div>
      ) : (
        /* ── Vista Concesiones / Órdenes ── */
        <div className="scrollable-content-list">
          <div className="stats-grid">
            <TarjetaEstadistica icono="chart"    etiqueta="Total"      valor={estadisticas.totalElementos}    color="color-purple" />
            <TarjetaEstadistica icono="building" etiqueta="Municipios" valor={estadisticas.municipiosUnicos}  color="color-violet" />
            <TarjetaEstadistica icono="check"    etiqueta="Vigentes"   valor={estadisticas.elementosVigentes} color="color-green"  />
            <TarjetaEstadistica icono="area"     etiqueta="Superficie" valor={`${estadisticas.superficieTotal} ha`} color="color-orange" pequeno />
          </div>
          <div>
            <h3 className="concesiones-list-header">
              {estadisticas.totalElementos > 0
                ? `Elementos visibles (${estadisticas.totalElementos})`
                : 'No hay elementos que mostrar'}
            </h3>
            <div className="concesiones-list">
              {elementosMostrados.map(elemento => (
                <ElementoLista
                  key={elemento.tipo === 'orden_exploracion' ? elemento.num_orden : elemento.titulo}
                  elemento={elemento}
                  onClick={manejarClickElemento}
                />
              ))}
              {hayMasElementos && (
                <div className="list-footer">
                  Mostrando {LIMITES_VISUALIZACION.maximoElementosLista} de {estadisticas.totalElementos} elementos
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

VistaLista.displayName = 'VistaLista';
export default VistaLista;