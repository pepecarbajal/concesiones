import React from 'react';
import VistaDetalle from './VistaDetalle';
import VistaLista from './VistaLista';

const PanelLateral = ({
  visible,
  elementoSeleccionado,
  elementosFiltrados,
  indiceActual,
  esMovil,
  onSeleccionarElemento,
  onDeseleccionar,
  onNavegarAnterior,
  onNavegarSiguiente
}) => {
  return (
    <div className={`side-panel ${visible ? 'panel-visible' : 'panel-hidden'}`}>
      {elementoSeleccionado ? (
        <VistaDetalle
          elemento={elementoSeleccionado}
          indiceActual={indiceActual}
          totalElementos={elementosFiltrados.length}
          onNavegarAnterior={onNavegarAnterior}
          onNavegarSiguiente={onNavegarSiguiente}
          onVolver={onDeseleccionar}
        />
      ) : (
        <VistaLista
          elementos={elementosFiltrados}
          onSeleccionarElemento={onSeleccionarElemento}
          esMovil={esMovil}
        />
      )}
    </div>
  );
};

export default PanelLateral;