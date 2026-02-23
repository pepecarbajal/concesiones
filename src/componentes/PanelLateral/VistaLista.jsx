import React, { useMemo, useCallback, memo } from 'react';
import TarjetaEstadistica from './componentes/TarjetaEstadistica';
import ElementoLista from './componentes/ElementoLista';
import { LIMITES_VISUALIZACION } from '../../utilidades/constantes';

const VistaLista = memo(({ elementos, onSeleccionarElemento, esMovil, tipoElemento, onCambiarTipo, totalConcesiones, totalOrdenes }) => {
  const estadisticas = useMemo(() => {
    const totalElementos = elementos.length;
    const municipiosUnicos = new Set(elementos.map(e => e.municipio)).size;
    const elementosVigentes = elementos.filter(e => e.estado === 'Vigente').length;
    const superficieTotal = elementos.reduce(
      (suma, e) => suma + parseFloat(e.superficie || 0),
      0
    ).toFixed(0);

    return { totalElementos, municipiosUnicos, elementosVigentes, superficieTotal };
  }, [elementos]);

  const elementosMostrados = useMemo(() => {
    return elementos.slice(0, LIMITES_VISUALIZACION.maximoElementosLista);
  }, [elementos]);

  const hayMasElementos = elementos.length > LIMITES_VISUALIZACION.maximoElementosLista;

  const manejarClickElemento = useCallback((elemento) => {
    onSeleccionarElemento(elemento);
  }, [onSeleccionarElemento]);

  return (
    <div className="side-panel-content">
      <div className="panel-header panel-header-main">
        <h2 className="panel-title">Cartografía Minera</h2>
        <p className="panel-subtitle">Estado de Guerrero</p>

        {/* Selector de tipo integrado en el panel */}
        <div className="panel-tipo-selector">
          <button
            onClick={() => onCambiarTipo('concesiones')}
            className={`panel-tipo-btn ${tipoElemento === 'concesiones' ? 'active' : ''}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Concesiones
            <span className="panel-tipo-count">{totalConcesiones}</span>
          </button>

          <button
            onClick={() => onCambiarTipo('ordenes')}
            className={`panel-tipo-btn ${tipoElemento === 'ordenes' ? 'active' : ''}`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            Órdenes
            <span className="panel-tipo-count">{totalOrdenes}</span>
          </button>
        </div>
      </div>

      <div className="scrollable-content-list">
        <div className="stats-grid">
          <TarjetaEstadistica
            icono="chart"
            etiqueta="Total"
            valor={estadisticas.totalElementos}
            color="color-purple"
          />
          <TarjetaEstadistica
            icono="building"
            etiqueta="Municipios"
            valor={estadisticas.municipiosUnicos}
            color="color-violet"
          />
          <TarjetaEstadistica
            icono="check"
            etiqueta="Vigentes"
            valor={estadisticas.elementosVigentes}
            color="color-green"
          />
          <TarjetaEstadistica
            icono="area"
            etiqueta="Superficie"
            valor={`${estadisticas.superficieTotal} ha`}
            color="color-orange"
            pequeno
          />
        </div>

        <div>
          <h3 className="concesiones-list-header">
            {estadisticas.totalElementos > 0
              ? `Elementos visibles (${estadisticas.totalElementos})`
              : 'No hay elementos que mostrar'}
          </h3>

          <div className="concesiones-list">
            {elementosMostrados.map(elemento => {
              const key = elemento.tipo === 'orden_exploracion'
                ? elemento.num_orden
                : elemento.titulo;

              return (
                <ElementoLista
                  key={key}
                  elemento={elemento}
                  onClick={manejarClickElemento}
                />
              );
            })}

            {hayMasElementos && (
              <div className="list-footer">
                Mostrando {LIMITES_VISUALIZACION.maximoElementosLista} de {estadisticas.totalElementos} elementos
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

VistaLista.displayName = 'VistaLista';

export default VistaLista;