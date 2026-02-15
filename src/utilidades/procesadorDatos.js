// ============================================================================
// OPTIMIZACIÓN: Cache para conversiones DMS a Decimal
// Evita reconvertir las mismas coordenadas múltiples veces
// ============================================================================
const cacheDMSaDecimal = new Map();

/**
 * Convierte coordenadas en formato DMS (Grados, Minutos, Segundos) a formato decimal
 * OPTIMIZADO con caché para evitar recálculos
 * @param {string} dms - Coordenada en formato DMS (ej: "16°51'18.96"N")
 * @returns {number|null} - Coordenada en formato decimal o null si no es válida
 */
export const convertirDMSaDecimal = (dms) => {
  if (!dms) return null;
  
  // ============================================================================
  // OPTIMIZACIÓN: Verificar caché primero
  // ============================================================================
  if (cacheDMSaDecimal.has(dms)) {
    return cacheDMSaDecimal.get(dms);
  }
  
  const regex = /(\d+)°(\d+)′([\d.]+)″([NSEW])/;
  const coincidencia = dms.match(regex);
  
  if (!coincidencia) {
    cacheDMSaDecimal.set(dms, null);
    return null;
  }
  
  const grados = parseFloat(coincidencia[1]);
  const minutos = parseFloat(coincidencia[2]);
  const segundos = parseFloat(coincidencia[3]);
  const direccion = coincidencia[4];
  
  let decimal = grados + minutos / 60 + segundos / 3600;
  
  if (direccion === 'S' || direccion === 'W') {
    decimal = -decimal;
  }
  
  // Guardar en caché
  cacheDMSaDecimal.set(dms, decimal);
  
  return decimal;
};

/**
 * Procesa los datos de concesiones mineras y convierte sus coordenadas
 * OPTIMIZADO: Solo filtra null al final, reduce operaciones
 * @param {Array} datos - Array de objetos con datos de concesiones
 * @returns {Array} - Array de concesiones procesadas con coordenadas decimales
 */
export const procesarConcesiones = (datos) => {
  const resultado = [];
  
  for (let i = 0; i < datos.length; i++) {
    const concesion = datos[i];
    const latitud = convertirDMSaDecimal(concesion.latitud);
    const longitud = convertirDMSaDecimal(concesion.longitud);
    
    // Solo agregar si tiene coordenadas válidas
    if (longitud !== null && latitud !== null) {
      resultado.push({
        ...concesion,
        coords: [longitud, latitud]
      });
    }
  }
  
  return resultado;
};

/**
 * Convierte un array de vértices DMS a coordenadas decimales
 * OPTIMIZADO con loop tradicional para mejor rendimiento
 * @param {Array} vertices - Array de objetos con latitud y longitud en DMS
 * @returns {Array} - Array de coordenadas [lng, lat] en formato decimal
 */
export const convertirVerticesADecimal = (vertices) => {
  if (!vertices || !Array.isArray(vertices) || vertices.length === 0) return [];
  
  const resultado = [];
  
  for (let i = 0; i < vertices.length; i++) {
    const vertice = vertices[i];
    const lat = convertirDMSaDecimal(vertice.latitud);
    const lng = convertirDMSaDecimal(vertice.longitud);
    
    if (lat !== null && lng !== null) {
      resultado.push([lng, lat]); // GeoJSON usa [longitud, latitud]
    }
  }
  
  return resultado;
};

/**
 * Calcula el centroide de un polígono
 * OPTIMIZADO con loop tradicional
 * @param {Array} coordenadas - Array de coordenadas [lng, lat]
 * @returns {Array} - Coordenada central [lng, lat]
 */
export const calcularCentroide = (coordenadas) => {
  if (!coordenadas || coordenadas.length === 0) return null;
  
  let sumLng = 0;
  let sumLat = 0;
  const len = coordenadas.length;
  
  for (let i = 0; i < len; i++) {
    sumLng += coordenadas[i][0];
    sumLat += coordenadas[i][1];
  }
  
  return [sumLng / len, sumLat / len];
};

/**
 * Procesa los datos de órdenes de exploración y convierte sus coordenadas
 * OPTIMIZADO: Procesa puntos centrales y polígonos eficientemente
 * @param {Array} datos - Array de objetos con datos de órdenes de exploración
 * @returns {Array} - Array de órdenes procesadas con coordenadas decimales
 */
export const procesarOrdenesExploracion = (datos) => {
  const resultado = [];
  
  for (let i = 0; i < datos.length; i++) {
    const orden = datos[i];
    const latitud = convertirDMSaDecimal(orden.latitud);
    const longitud = convertirDMSaDecimal(orden.longitud);
    
    // Procesar vértices del perímetro si existen
    let coordenadasPoligono = null;
    if (orden.vertices && Array.isArray(orden.vertices)) {
      const verticesDecimales = convertirVerticesADecimal(orden.vertices);
      
      // Para cerrar el polígono, el último punto debe ser igual al primero
      if (verticesDecimales.length > 0) {
        const primerVertice = verticesDecimales[0];
        const ultimoVertice = verticesDecimales[verticesDecimales.length - 1];
        
        // Verificar si el polígono no está cerrado
        if (primerVertice[0] !== ultimoVertice[0] || primerVertice[1] !== ultimoVertice[1]) {
          verticesDecimales.push([...primerVertice]); // Cerrar el polígono
        }
        
        coordenadasPoligono = verticesDecimales;
      }
    }
    
    // Si no hay coordenadas centrales pero sí hay polígono, calcular centroide
    let coordsCentrales = longitud !== null && latitud !== null ? [longitud, latitud] : null;
    if (!coordsCentrales && coordenadasPoligono) {
      coordsCentrales = calcularCentroide(coordenadasPoligono);
    }
    
    // Solo agregar si tiene coordenadas centrales válidas
    if (coordsCentrales !== null) {
      resultado.push({
        ...orden,
        coords: coordsCentrales, // Punto central
        coordenadasPoligono: coordenadasPoligono, // Perímetro completo
        tipo: 'orden_exploracion'
      });
    }
  }
  
  return resultado;
};

/**
 * Extrae el año de una fecha en formato DD/MM/AA o DD/MM/AAAA
 * @param {string} fecha - Fecha en formato DD/MM/AA o DD/MM/AAAA
 * @returns {string|null} - Año en formato AAAA o null si la fecha no es válida
 */
export const extraerAnio = (fecha) => {
  if (!fecha) return null;
  
  const partes = fecha.split('/');
  if (partes.length !== 3) return null;
  
  let anio = partes[2];
  if (anio.length === 2) {
    const anioNum = parseInt(anio);
    anio = anioNum > 50 ? '19' + anio : '20' + anio;
  }
  
  return anio;
};

// ============================================================================
// OPTIMIZACIÓN: Función para limpiar caché si es necesario
// ============================================================================
export const limpiarCacheDMS = () => {
  cacheDMSaDecimal.clear();
};