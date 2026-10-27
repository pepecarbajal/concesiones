import React, { useMemo, useCallback, memo } from 'react';
import TarjetaEstadistica from './componentes/TarjetaEstadistica';
import ElementoLista from './componentes/ElementoLista';
import { LIMITES_VISUALIZACION } from '../../utilidades/constantes';

const CAT_INFO = {
  'RB':   { nombre: 'Reserva de Biosfera',              color: '#1E7B4F' },
  'PN':   { nombre: 'Parque Nacional',                  color: '#2F4858' },
  'MN':   { nombre: 'Monumento Natural',                color: '#5B4E6E' },
  'AP':   { nombre: 'Área de Protección',               color: '#A9812B' },
  'SANT': { nombre: 'Santuario',                        color: '#1F6A5C' },
  'APFF': { nombre: 'Área de Protección de Flora y Fauna', color: '#1F6A5C' },
  'FL':   { nombre: 'Área de Protección Flora y Fauna', color: '#8E4458' },
};

const BtnPDFListaItem = memo(({ pdfUrl, nombreAnp }) => {
  if (!pdfUrl) return null;

  return (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      download
      title={`Descargar PDF de ${nombreAnp}`}
      className="anp-lista-pdf-btn"
      onClick={(e) => e.stopPropagation()}
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
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px;
          background: #166534;
          color: white; border-radius: 6px; font-size: 11px; font-weight: 700;
          text-decoration: none; letter-spacing: 0.03em;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(22, 101, 52, 0.25);
          flex-shrink: 0; white-space: nowrap;
        }
        .anp-lista-pdf-btn:hover {
          background: #14532d;
          box-shadow: 0 3px 10px rgba(22, 101, 52, 0.4);
          transform: translateY(-1px);
        }
        .anp-item-footer {
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px; margin-top: 6px;
        }
        .anp-item-details {
          font-size: 11px; color: #9CA3AF;
          display: flex; align-items: center; gap: 6px;
          flex-wrap: wrap; min-width: 0;
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
              <div className="concesion-name">
                <span
                  className="concesion-status-dot"
                  style={{ backgroundColor: cat.color, boxShadow: `0 0 5px ${cat.color}55` }}
                />
                {anp.NOMBRE}
              </div>
              <div className="concesion-titular" style={{ color: cat.color, fontWeight: 600, fontSize: '11px' }}>
                {cat.nombre}
              </div>
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
                {/* Pasa pdf_url directo, sin construir nada */}
                <BtnPDFListaItem pdfUrl={anp.pdf_url} nombreAnp={anp.NOMBRE} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
});
ListaANP.displayName = 'ListaANP';

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

const TIPO_HEADER = {
  concesiones:     {
    titulo: 'Concesiones Mineras',
    subtitulo: 'Estado de Guerrero',
    gradiente: '#2F4858',
  },
  ordenes:         {
    titulo: 'Órdenes de Exploración',
    subtitulo: 'Estado de Guerrero',
    gradiente: '#3B5A6B',
  },
  areas_naturales: {
    titulo: 'Áreas Naturales Protegidas',
    subtitulo: 'Estado de Guerrero',
    gradiente: '#166534',
  },
};

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
  onMostrarEstadisticas,
  hayFiltrosActivos,
  onLimpiarFiltros
}) => {
  const estadisticas = useMemo(() => {
    const totalElementos     = elementos.length;
    const municipiosUnicos   = new Set(elementos.map(e => e.municipio)).size;
    const elementosVigentes  = elementos.filter(e => e.estado === 'Vigente').length;
    const elementosCancelados = elementos.filter(e => e.estado === 'Cancelado').length;
    const superficieTotal    = elementos.reduce(
      (suma, e) => suma + parseFloat(e.superficie || 0), 0
    ).toFixed(0);
    return { totalElementos, municipiosUnicos, elementosVigentes, elementosCancelados, superficieTotal };
  }, [elementos]);

  const elementosMostrados = useMemo(() =>
    elementos.slice(0, LIMITES_VISUALIZACION.maximoElementosLista),
    [elementos]
  );

  const hayMasElementos      = elementos.length > LIMITES_VISUALIZACION.maximoElementosLista;
  const manejarClickElemento = useCallback((el) => onSeleccionarElemento(el), [onSeleccionarElemento]);
  const esANP                = tipoElemento === 'areas_naturales';

  const headerInfo = TIPO_HEADER[tipoElemento] || TIPO_HEADER.concesiones;

  return (
    <div className="side-panel-content">
      <div
        className="panel-header panel-header-main"
        style={{ background: headerInfo.gradiente }}
      >
        <h2 className="panel-title">{headerInfo.titulo}</h2>
        <p className="panel-subtitle">{headerInfo.subtitulo}</p>

        <button
          onClick={onMostrarEstadisticas}
          className="panel-btn-estadisticas"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6"  y1="20" x2="6"  y2="14"/>
            <line x1="2"  y1="20" x2="22" y2="20"/>
          </svg>
          Estadísticas
        </button>
      </div>

      {esANP ? (
        <div className="scrollable-content-list">
          <EstadisticasANP anps={anps} />
          <h3 className="concesiones-list-header" style={{ marginTop: '8px' }}>
            Áreas Naturales Protegidas ({anps.length})
          </h3>
          <ListaANP anps={anps} onSeleccionar={onSeleccionarANP} />
        </div>
      ) : (
        <div className="scrollable-content-list">
          <div className="stats-grid">
            <TarjetaEstadistica icono="chart"    etiqueta="Total"       valor={estadisticas.totalElementos}      color="color-purple" />
            <TarjetaEstadistica icono="building" etiqueta="Municipios"  valor={estadisticas.municipiosUnicos}    color="color-violet" />
            <TarjetaEstadistica icono="check"    etiqueta="Vigentes"    valor={estadisticas.elementosVigentes}   color="color-green"  />
            <TarjetaEstadistica icono="x"        etiqueta="Cancelados"  valor={estadisticas.elementosCancelados}  color="color-red"    />
            <TarjetaEstadistica icono="area"     etiqueta="Superficie"  valor={`${estadisticas.superficieTotal} ha`} color="color-orange" pequeno />
          </div>
          <div>
            {estadisticas.totalElementos > 0 ? (
              <>
                <h3 className="concesiones-list-header">
                  Elementos visibles ({estadisticas.totalElementos})
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
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <h3>Sin resultados</h3>
                <p>
                  No se encontraron elementos con los filtros aplicados.
                  <br />Prueba con otro término o revisa los filtros.
                </p>
                {hayFiltrosActivos && (
                  <button type="button" className="empty-state-btn" onClick={onLimpiarFiltros}>
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

VistaLista.displayName = 'VistaLista';
export default VistaLista;