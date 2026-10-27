/**
 * Coordenadas de las diferentes regiones de Guerrero para navegación en el mapa
 */
export const COORDENADAS_REGIONES = {
  'Acapulco': { coords: [-99.8901, 16.8531], zoom: 11 },
  'Norte': { coords: [-99.5398, 18.3444], zoom: 9 },
  'Centro': { coords: [-99.5008, 17.5509], zoom: 9 },
  'Montaña': { coords: [-98.5761, 17.5453], zoom: 9 },
  'Costa Chica': { coords: [-98.4102, 16.6850], zoom: 9 },
  'Costa Grande': { coords: [-101.5518, 17.6413], zoom: 9 },
  'Tierra Caliente': { coords: [-100.5, 18.2], zoom: 9 },
  'Sierra': { coords: [-99.85, 17.65], zoom: 10 }
};

/**
 * Configuración del mapa por defecto
 */
export const CONFIGURACION_MAPA_DEFECTO = {
  centro: [-99.5008, 17.5509],
  zoom: 8,
  duracionAnimacion: 2000
};

/**
 * Configuración de zoom para diferentes tipos de elementos
 */
export const NIVELES_ZOOM = {
  ordenExploracion: 10,
  concesion: 14,
  municipio: 13,
  region: 9,
  general: 12
};

/**
 * Colores para los diferentes estados de concesiones
 * Semántica tipo semáforo: Verde = Vigente, Ámbar = No vigente/Cancelada, Dorado = Orden de Exploración
 */
export const COLORES_ESTADO = {
  vigente: {
    primario: '#1E7B4F',
    secundario: '#2E9D63',
    oscuro: '#155A39'
  },
  noVigente: {
    primario: '#B4691E',
    secundario: '#CE8A3A',
    oscuro: '#8A4F14'
  },
  ordenExploracion: {
    primario: '#A9812B',    // Color principal (dorado)
    secundario: '#C8A44A',  // Color secundario
    oscuro: '#7E5F1E'
  },
  relleno: {
    primario: '#B4691E'
  }
};

/**
 * Límites de visualización
 */
export const LIMITES_VISUALIZACION = {
  maximoElementosLista: 20,
  paddingMapa: 100,
  paddingMunicipio: 80
};
