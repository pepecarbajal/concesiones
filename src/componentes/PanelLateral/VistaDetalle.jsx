import React from 'react';
import ControlesNavegacion from './componentes/ControlesNavegacion';
import EtiquetaEstado from './componentes/EtiquetaEstado';
import FilaInformacion from './componentes/FilaInformacion';
import TarjetaFecha from './componentes/TarjetaFecha';

const numOrdenANombreArchivo = (numOrden) => {
  if (!numOrden) return null;
  return numOrden.replace(/\s+/g, '-').replace(/\//g, '-');
};

const VistaDetalle = ({
  elemento,
  indiceActual,
  totalElementos,
  onNavegarAnterior,
  onNavegarSiguiente,
  onVolver
}) => {
  if (!elemento) {
    return (
      <div className="side-panel-content">
        <div className="panel-header">
          <button onClick={onVolver} className="btn-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver a la lista
          </button>
          <p style={{ color: 'white', marginTop: 12 }}>No se encontró información.</p>
        </div>
      </div>
    );
  }

  const esOrden = elemento.tipo === 'orden_exploracion';
  const nombreElemento = esOrden ? elemento.nombre : elemento.nombre_lote;

  return (
    <div className="side-panel-content">
      <div className="panel-header">

        {/* 1. Volver — arriba de todo */}
        <button onClick={onVolver} className="btn-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
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

        {/* 3. Título y estado */}
        <h2 className="concesion-header-title">{nombreElemento || 'Sin nombre'}</h2>
        <EtiquetaEstado elemento={elemento} />
      </div>

      <div className="scrollable-content">
        {esOrden ? (
          <ContenidoOrdenExploracion orden={elemento} />
        ) : (
          <ContenidoConcesion concesion={elemento} />
        )}
      </div>
    </div>
  );
};

/* ── Contenido de Orden de Exploración ── */
const ContenidoOrdenExploracion = ({ orden }) => {
  const nombreArchivo = numOrdenANombreArchivo(orden.num_orden);
  const rutaPDF = `/dof/${nombreArchivo}.pdf`;

  return (
    <>
      <div className="info-rows">
        <FilaInformacion etiqueta="Número de Orden" valor={orden.num_orden} />
        <FilaInformacion etiqueta="A Favor"         valor={orden.a_favor} />
        <FilaInformacion etiqueta="Municipio"       valor={orden.municipio} />
        <FilaInformacion etiqueta="Estado"          valor={orden.estado} />
        <FilaInformacion etiqueta="Superficie"      valor={orden.superficie ? `${orden.superficie} ha` : null} />
        <FilaInformacion etiqueta="Publicación DOF" valor={orden.publ_dof} />
      </div>

      {nombreArchivo && (
        <div style={{ marginTop: '24px' }}>
          <a
            href={rutaPDF}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="btn-dof"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar Publicación DOF
          </a>
        </div>
      )}
    </>
  );
};

/* ── Contenido de Concesión ── */
const ContenidoConcesion = ({ concesion }) => (
  <>
    <div className="info-rows">
      <FilaTitulares titular={concesion.titular} />
      <FilaInformacion etiqueta="Titulo"     valor={concesion.titulo} />
      <FilaInformacion etiqueta="Municipio"  valor={concesion.municipio} />
      <FilaInformacion etiqueta="Region"     valor={concesion.region || 'N/A'} />
      <FilaInformacion etiqueta="Superficie" valor={concesion.superficie ? `${concesion.superficie} ha` : null} />
      {concesion.duracion && <FilaInformacion etiqueta="Duracion" valor={`${concesion.duracion} años`} />}
    </div>

    <div className="dates-grid">
      <TarjetaFecha icono="calendar" etiqueta="Expedicion"  valor={concesion.fecha_expedicion || 'N/A'} />
      <TarjetaFecha icono="start"    etiqueta="Inicio"      valor={concesion.fecha_inicio     || 'N/A'} />
      <TarjetaFecha icono="end"      etiqueta="Vencimiento" valor={concesion.fecha_fin         || 'N/A'} />
      {concesion.fecha_cancelacion && (
        <TarjetaFecha icono="cancel" etiqueta="Cancelacion" valor={concesion.fecha_cancelacion} />
      )}
    </div>

    <div style={{ marginTop: '24px' }}>
      <a
        href={`https://tarjetarpm.economia.gob.mx/tarjeta.mineria/obtiene.tarjetaPDF?notitulo=${concesion.titulo}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-rpm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        Descargar Tarjeta RPM
      </a>
    </div>
  </>
);

/* ── Titulares (uno o varios separados por |) ── */
const FilaTitulares = ({ titular }) => (
  <div className="info-row">
    <div className="info-label">Titular(es)</div>
    <div className="info-value">
      {titular ? (
        titular.includes('|') ? (
          <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
            {titular.split('|').map((t, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{t.trim()}</li>
            ))}
          </ul>
        ) : titular
      ) : 'N/A'}
    </div>
  </div>
);

export default VistaDetalle;