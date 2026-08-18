import React, { useState, useCallback, useEffect } from 'react';
import VistaDetalle from './VistaDetalle';
import VistaDetalleANP from './VistaDetalleANP';
import VistaLista from './VistaLista';

const PanelLateral = ({
  visible,
  elementoSeleccionado,
  elementosFiltrados,
  indiceActual,
  esMovil,
  tipoElemento,
  onCambiarTipo,
  totalConcesiones,
  totalOrdenes,
  anps,
  totalANPs,
  anpSeleccionadaExterna,  // ← ANP seleccionada desde el mapa
  onSeleccionarElemento,
  onSeleccionarANP,
  onDeseleccionar,
  onNavegarAnterior,
  onNavegarSiguiente,
  onMostrarEstadisticas,
  hayFiltrosActivos,
  onLimpiarFiltros
}) => {
  const [anpSeleccionada, setAnpSeleccionada] = useState(null);
  const [indiceANP, setIndiceANP] = useState(0);

  // Sincronizar cuando el usuario hace clic en el mapa
  useEffect(() => {
    if (!anpSeleccionadaExterna) return;
    const idx = anps.findIndex(a => a.ID_ANP === anpSeleccionadaExterna.ID_ANP);
    setIndiceANP(idx >= 0 ? idx : 0);
    setAnpSeleccionada(anpSeleccionadaExterna);
  }, [anpSeleccionadaExterna, anps]);

  const manejarSeleccionANP = useCallback((anp) => {
    const idx = anps.findIndex(a => a.ID_ANP === anp.ID_ANP);
    setIndiceANP(idx >= 0 ? idx : 0);
    setAnpSeleccionada(anp);
    if (onSeleccionarANP) onSeleccionarANP(anp);
  }, [anps, onSeleccionarANP]);

  const manejarVolverANP = useCallback(() => {
    setAnpSeleccionada(null);
  }, []);

  const navegarANPAnterior = useCallback(() => {
    if (!anps.length) return;
    const idx = indiceANP > 0 ? indiceANP - 1 : anps.length - 1;
    setIndiceANP(idx);
    setAnpSeleccionada(anps[idx]);
    if (onSeleccionarANP) onSeleccionarANP(anps[idx]);
  }, [indiceANP, anps, onSeleccionarANP]);

  const navegarANPSiguiente = useCallback(() => {
    if (!anps.length) return;
    const idx = indiceANP < anps.length - 1 ? indiceANP + 1 : 0;
    setIndiceANP(idx);
    setAnpSeleccionada(anps[idx]);
    if (onSeleccionarANP) onSeleccionarANP(anps[idx]);
  }, [indiceANP, anps, onSeleccionarANP]);

  const manejarCambiarTipo = useCallback((tipo) => {
    setAnpSeleccionada(null);
    onCambiarTipo(tipo);
  }, [onCambiarTipo]);

  const mostrarDetalleANP       = tipoElemento === 'areas_naturales' && anpSeleccionada;
  const mostrarDetalleConcesion = tipoElemento !== 'areas_naturales' && elementoSeleccionado;

  return (
    <div className={`side-panel ${visible ? 'panel-visible' : 'panel-hidden'}`}>
      {mostrarDetalleANP ? (
        <VistaDetalleANP
          anp={anpSeleccionada}
          indiceActual={indiceANP}
          totalElementos={anps.length}
          onNavegarAnterior={navegarANPAnterior}
          onNavegarSiguiente={navegarANPSiguiente}
          onVolver={manejarVolverANP}
        />
      ) : mostrarDetalleConcesion ? (
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
          anps={anps}
          onSeleccionarElemento={onSeleccionarElemento}
          onSeleccionarANP={manejarSeleccionANP}
          esMovil={esMovil}
          tipoElemento={tipoElemento}
          onCambiarTipo={manejarCambiarTipo}
          totalConcesiones={totalConcesiones}
          totalOrdenes={totalOrdenes}
          totalANPs={totalANPs}
          onMostrarEstadisticas={onMostrarEstadisticas}
          hayFiltrosActivos={hayFiltrosActivos}
          onLimpiarFiltros={onLimpiarFiltros}
        />
      )}
    </div>
  );
};

export default PanelLateral;