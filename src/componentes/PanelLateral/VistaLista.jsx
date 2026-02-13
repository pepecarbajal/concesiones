import React from 'react';
import TarjetaEstadistica from './componentes/TarjetaEstadistica';
import ElementoLista from './componentes/ElementoLista';
import { LIMITES_VISUALIZACION } from '../../utilidades/constantes';

const VistaLista = ({ elementos, onSeleccionarElemento }) => {
  // Calcular estadísticas
  const totalElementos = elementos.length;
  const municipiosUnicos = [...new Set(elementos.map(e => e.municipio))].length;
  const elementosVigentes = elementos.filter(e => e.estado === 'Vigente').length;
  const superficieTotal = elementos.reduce(
    (suma, e) => suma + parseFloat(e.superficie || 0), 
    0
  ).toFixed(0);

  const elementosMostrados = elementos.slice(0, LIMITES_VISUALIZACION.maximoElementosLista);
  const hayMasElementos = elementos.length > LIMITES_VISUALIZACION.maximoElementosLista;

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
            valor={totalElementos}
            color="color-purple"
          />
          <TarjetaEstadistica 
            icono="building"
            etiqueta="Municipios" 
            valor={municipiosUnicos}
            color="color-violet"
          />
          <TarjetaEstadistica 
            icono="check"
            etiqueta="Vigentes" 
            valor={elementosVigentes}
            color="color-green"
          />
          <TarjetaEstadistica 
            icono="area"
            etiqueta="Superficie" 
            valor={`${superficieTotal} ha`}
            color="color-orange"
            pequeno
          />
        </div>

        <div>
          <h3 className="concesiones-list-header">
            {totalElementos > 0 
              ? `Elementos visibles (${totalElementos})`
              : 'No hay elementos que mostrar'}
          </h3>

          <div className="concesiones-list">
            {elementosMostrados.map(elemento => (
              <ElementoLista
                key={elemento.tipo === 'orden_exploracion' ? elemento.num_orden : elemento.titulo}
                elemento={elemento}
                onClick={() => onSeleccionarElemento(elemento)}
              />
            ))}
            
            {hayMasElementos && (
              <div className="list-footer">
                Mostrando {LIMITES_VISUALIZACION.maximoElementosLista} de {totalElementos} elementos
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaLista;