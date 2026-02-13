import React from 'react';
import ControlesNavegacion from './componentes/ControlesNavegacion';
import EtiquetaEstado from './componentes/EtiquetaEstado';
import FilaInformacion from './componentes/FilaInformacion';
import TarjetaFecha from './componentes/TarjetaFecha';

const VistaDetalle = ({
  elemento,
  indiceActual,
  totalElementos,
  onNavegarAnterior,
  onNavegarSiguiente,
  onVolver
}) => {
  const esOrden = elemento.tipo === 'orden_exploracion';
  const nombreElemento = esOrden ? elemento.nombre : elemento.nombre_lote;

  return (
    <div className="side-panel-content">
      <div className="panel-header">
        <ControlesNavegacion
          indiceActual={indiceActual}
          totalElementos={totalElementos}
          onAnterior={onNavegarAnterior}
          onSiguiente={onNavegarSiguiente}
          deshabilitado={totalElementos === 0}
        />

        <button onClick={onVolver} className="btn-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a la lista
        </button>
        
        <h2 className="concesion-header-title">{nombreElemento}</h2>
        
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

/**
 * Contenido específico para órdenes de exploración
 */
const ContenidoOrdenExploracion = ({ orden }) => (
  <div className="info-rows">
    <FilaInformacion etiqueta="Número de Orden" valor={orden.num_orden} />
    <FilaInformacion etiqueta="A Favor" valor={orden.a_favor} />
    <FilaInformacion etiqueta="Municipio" valor={orden.municipio} />
    <FilaInformacion etiqueta="Estado" valor={orden.estado} />
    <FilaInformacion etiqueta="Superficie" valor={`${orden.superficie} ha`} />
    <FilaInformacion etiqueta="Publicación DOF" valor={orden.publ_dof} />
  </div>
);

/**
 * Contenido específico para concesiones
 */
const ContenidoConcesion = ({ concesion }) => (
  <>
    <div className="info-rows">
      <FilaTitulares titular={concesion.titular} />
      <FilaInformacion etiqueta="Titulo" valor={concesion.titulo} />
      <FilaInformacion etiqueta="Municipio" valor={concesion.municipio} />
      <FilaInformacion etiqueta="Region" valor={concesion.region || 'N/A'} />
      <FilaInformacion etiqueta="Superficie" valor={`${concesion.superficie} ha`} />
    </div>

    <div className="dates-grid">
      <TarjetaFecha 
        icono="calendar" 
        etiqueta="Expedicion" 
        valor={concesion.fecha_expedicion || 'N/A'} 
      />
      <TarjetaFecha 
        icono="start" 
        etiqueta="Inicio" 
        valor={concesion.fecha_inicio || 'N/A'} 
      />
      <TarjetaFecha 
        icono="end" 
        etiqueta="Vencimiento" 
        valor={concesion.fecha_fin || 'N/A'} 
      />
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

/**
 * Componente especial para mostrar titulares (puede ser uno o varios)
 */
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
        ) : (
          titular
        )
      ) : 'N/A'}
    </div>
  </div>
);

export default VistaDetalle;