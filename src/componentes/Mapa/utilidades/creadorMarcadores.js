import { COLORES_ESTADO } from '../../../utilidades/constantes';

/**
 * Crea el elemento DOM para un marcador de concesión minera
 * @param {string} estado - Estado de la concesión ('Vigente' o 'No Vigente')
 * @returns {HTMLElement} - Elemento DOM del marcador
 */
export const crearMarcadorConcesion = (estado) => {
  const elemento = document.createElement('div');
  elemento.className = 'custom-marker-concesion';
  
  const esVigente = estado === 'Vigente';
  const colores = esVigente ? COLORES_ESTADO.vigente : COLORES_ESTADO.noVigente;
  
  elemento.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
          <feOffset dx="0" dy="1" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
      <circle cx="12" cy="10" r="8" fill="${colores.primario}" filter="url(#shadow)"/>
      <circle cx="12" cy="10" r="6.5" fill="${colores.secundario}"/>
      <circle cx="12" cy="10" r="3" fill="white"/>
      <path d="M12 18 L10 23 L12 21 L14 23 Z" fill="${colores.oscuro}" filter="url(#shadow)"/>
      <circle cx="12" cy="10" r="1.5" fill="${colores.primario}"/>
    </svg>
  `;
  
  return elemento;
};

/**
 * Crea el elemento DOM para un marcador de orden de exploración
 * @returns {HTMLElement} - Elemento DOM del marcador
 */
export const crearMarcadorOrden = () => {
  const elemento = document.createElement('div');
  elemento.className = 'custom-marker-orden';
  
  const colores = COLORES_ESTADO.ordenExploracion;
  
  elemento.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-orden" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
          <feOffset dx="0" dy="1" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
      <circle cx="12" cy="10" r="8" fill="${colores.primario}" filter="url(#shadow-orden)"/>
      <circle cx="12" cy="10" r="6.5" fill="${colores.secundario}"/>
      <circle cx="12" cy="10" r="3" fill="white"/>
      <path d="M12 18 L10 23 L12 21 L14 23 Z" fill="${colores.oscuro}" filter="url(#shadow-orden)"/>
      <circle cx="12" cy="10" r="1.5" fill="${colores.primario}"/>
    </svg>
  `;
  
  return elemento;
};