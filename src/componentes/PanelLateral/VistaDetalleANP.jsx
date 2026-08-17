import React from 'react';
import ControlesNavegacion from './componentes/ControlesNavegacion';
import FilaInformacion from './componentes/FilaInformacion';

const CATEGORIAS = {
  'RB':   { nombre: 'Reserva de Biosfera',              color: '#1E7B4F', bg: '#E4F1EA', border: '#C4DECB' },
  'PN':   { nombre: 'Parque Nacional',                  color: '#2F4858', bg: '#E9EEF1', border: '#CBD8DE' },
  'MN':   { nombre: 'Monumento Natural',                color: '#5B4E6E', bg: '#EFECF2', border: '#DBD3E3' },
  'AP':   { nombre: 'Área de Protección',               color: '#A9812B', bg: '#F5EEDB', border: '#E6D8B4' },
  'SB':   { nombre: 'Santuario',                        color: '#1F6A5C', bg: '#E5F0ED', border: '#C6DDD6' },
  'SANT': { nombre: 'Santuario',                        color: '#1F6A5C', bg: '#E5F0ED', border: '#C6DDD6' },
  'FL':   { nombre: 'Área de Protección Flora y Fauna', color: '#8E4458', bg: '#F5ECEF', border: '#E4D0D6' },
  'APFF': { nombre: 'Área de Protección de Flora y Fauna', color: '#8E4458', bg: '#F5ECEF', border: '#E4D0D6' },
};

const formatearFecha = (fechaISO) => {
  if (!fechaISO) return 'N/D';
  try {
    return new Date(fechaISO).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch {
    return fechaISO;
  }
};

const formatearSuperficie = (sup) => {
  if (!sup && sup !== 0) return 'N/D';
  return Number(parseFloat(sup).toFixed(2)).toLocaleString('es-MX') + ' ha';
};

const BtnDescargaPDF = ({ pdfUrl, nombreAnp, idAnp }) => {
  if (!pdfUrl) return null;

  return (
    <>
      <style>{`
        .btn-anp-pdf {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 14px 20px;
          background: #166534;
          color: white; text-align: center; border-radius: 12px;
          text-decoration: none; font-weight: 600; font-size: 14px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(22, 101, 52, 0.3);
          border: none; cursor: pointer; font-family: inherit;
        }
        .btn-anp-pdf:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(21, 128, 61, 0.45);
          background: #14532d;
        }
        .btn-anp-pdf:active { transform: translateY(0); }
        .btn-anp-pdf-wrap { margin-top: 20px; }
        .btn-anp-pdf-nota {
          display: flex; align-items: center; gap: 5px;
          margin-top: 8px; font-size: 10px; color: #9ca3af; justify-content: center;
        }
      `}</style>

      <div className="btn-anp-pdf-wrap">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="btn-anp-pdf"
          title={`Descargar PDF de ${nombreAnp}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar PDF
        </a>
        <div className="btn-anp-pdf-nota">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          ID: {idAnp} · Fuente: CONANP
        </div>
      </div>
    </>
  );
};

const VistaDetalleANP = ({
  anp,
  indiceActual,
  totalElementos,
  onNavegarAnterior,
  onNavegarSiguiente,
  onVolver
}) => {
  if (!anp) return null;

  const cat = CATEGORIAS[anp.CAT_MANEJO] || {
    nombre: anp.CAT_MANEJO || 'Área Natural Protegida',
    color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb'
  };

  const tieneSupMarina = parseFloat(anp.S_MARINA || 0) > 0;

  return (
    <div className="side-panel-content">
      <div className="panel-header anp-panel-header">

        {/* 1. Volver — arriba de todo */}
        <button onClick={onVolver} className="btn-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver a la lista
        </button>

        {/* 2. Anterior / Siguiente */}
        <ControlesNavegacion
          indiceActual={indiceActual}
          totalElementos={totalElementos}
          onAnterior={onNavegarAnterior}
          onSiguiente={onNavegarSiguiente}
          deshabilitado={totalElementos === 0}
        />

        {/* 3. Título y badge de categoría */}
        <h2 className="concesion-header-title">{anp.NOMBRE || 'Sin nombre'}</h2>
        <div className="status-badge" style={{ background: cat.color }}>
          <span className="status-dot">●</span>
          {cat.nombre}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="scrollable-content">

        <div className="anp-superficie-grid">
          <div className="anp-sup-card" style={{ borderColor: cat.border, background: cat.bg }}>
            <div className="anp-sup-label" style={{ color: cat.color }}>Superficie Total</div>
            <div className="anp-sup-valor" style={{ color: cat.color }}>
              {formatearSuperficie(anp.SUPERFICIE)}
            </div>
          </div>
          <div className="anp-sup-card" style={{ borderColor: '#C4DECB', background: '#E4F1EA' }}>
            <div className="anp-sup-label" style={{ color: '#1E7B4F' }}>Terrestre</div>
            <div className="anp-sup-valor" style={{ color: '#166534' }}>
              {formatearSuperficie(anp.S_TERRES)}
            </div>
          </div>
          {tieneSupMarina && (
            <div className="anp-sup-card" style={{ borderColor: '#CBD8DE', background: '#E9EEF1' }}>
              <div className="anp-sup-label" style={{ color: '#2F4858' }}>Marina</div>
              <div className="anp-sup-valor" style={{ color: '#1d4ed8' }}>
                {formatearSuperficie(anp.S_MARINA)}
              </div>
            </div>
          )}
        </div>

        <div className="info-rows" style={{ marginTop: '20px' }}>
          <FilaInformacion etiqueta="ID ANP"     valor={anp.ID_ANP} />
          <FilaInformacion etiqueta="Municipios" valor={anp.MUNICIPIOS} />
          <FilaInformacion etiqueta="Estado"     valor={anp.ESTADOS} />
          <FilaInformacion etiqueta="Región"     valor={anp.REGION} />
        </div>

        <div style={{ marginTop: '20px' }}>
          <div className="anp-fechas-titulo">Fechas de decreto</div>
          <div className="dates-grid" style={{ marginTop: '10px' }}>
            <div className="date-card">
              <span className="date-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="#1E7B4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8"  y1="2" x2="8"  y2="6"/>
                  <line x1="3"  y1="10" x2="21" y2="10"/>
                </svg>
              </span>
              <div className="date-info">
                <div className="date-label">Primer Decreto</div>
                <div className="date-value">{formatearFecha(anp.PRIM_DEC || anp.PCM1)}</div>
              </div>
            </div>
            <div className="date-card">
              <span className="date-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="#A9812B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8"  x2="12"   y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </span>
              <div className="date-info">
                <div className="date-label">Último DOF</div>
                <div className="date-value">{formatearFecha(anp.ULT_DOF)}</div>
              </div>
            </div>
          </div>
        </div>

        <BtnDescargaPDF
          pdfUrl={anp.pdf_url}
          nombreAnp={anp.NOMBRE}
          idAnp={anp.ID_ANP}
        />

        <div className="anp-fuente" style={{ marginTop: '16px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8"  x2="12"   y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          CONANP. 2024. Áreas Naturales Protegidas Federales de México, enero 2024.
          Ciudad de México, México.
        </div>
      </div>
    </div>
  );
};

export default VistaDetalleANP;