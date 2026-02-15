import { useState, useEffect } from 'react';

/**
 * Hook personalizado para aplicar debounce a un valor
 * Perfecto para inputs de búsqueda
 * 
 * @param {any} value - Valor a debounce
 * @param {number} delay - Delay en milisegundos (default: 300ms)
 * @returns {any} - Valor con debounce aplicado
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configurar timer para actualizar el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timeout si el valor cambia antes del delay
    // Esto previene actualizaciones innecesarias
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;