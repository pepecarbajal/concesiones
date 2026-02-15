import React, { useMemo, useCallback, memo } from 'react';
import TarjetaEstadistica from './componentes/TarjetaEstadistica';
import ElementoLista from './componentes/ElementoLista';
import { LIMITES_VISUALIZACION } from '../../utilidades/constantes';

// ============================================================================
// OPTIMIZACIÓN: Memoizar todo el componente
// ============================================================================
const VistaLista = memo(({ elementos, onSeleccionarElemento }) => {
  // ============================================================================
  // OPTIMIZACIÓN: Calcular estadísticas con useMemo para evitar recálculos
  // ============================================================================
  const estadisticas = useMemo(() => {
    const totalElementos = elementos.length;
    const municipiosUnicos = new Set(elementos.map(e => e.municipio)).size;
    const elementosVigentes = elementos.filter(e => e.estado === 'Vigente').length;
    const superficieTotal = elementos.reduce(
      (suma, e) => suma + parseFloat(e.superficie || 0), 
      0
    ).toFixed(0);

    return {
      totalElementos,
      municipiosUnicos,
      elementosVigentes,
      superficieTotal
    };
  }, [elementos]);

  // ============================================================================
  // OPTIMIZACIÓN: Slice de elementos para mostrar (evitar renderizar miles)
  // ============================================================================
  const elementosMostrados = useMemo(() => {
    return elementos.slice(0, LIMITES_VISUALIZACION.maximoElementosLista);
  }, [elementos]);

  const hayMasElementos = elementos.length > LIMITES_VISUALIZACION.maximoElementosLista;

  // ============================================================================
  // OPTIMIZACIÓN: Memoizar handler con useCallback
  // ============================================================================
  const manejarClickElemento = useCallback((elemento) => {
    onSeleccionarElemento(elemento);
  }, [onSeleccionarElemento]);

  return (
    <div className="side-panel-content">
      <div className="panel-header panel-header-main">
        <h2 className="panel-title">
          Concesiones y Órdenes de Exploración
        </h2>
        <p className="panel-subtitle">
          Estado de Guerrero
        </p>
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

// Agregar displayName para debugging
VistaLista.displayName = 'VistaLista';

export default VistaLista;