/**
 * Modelos que tienen Modo Desafío. Es una lista liviana (sin importar los modelos) para que la barra
 * superior y la página del simulador muestren el botón sin cargar el banco de retos; una prueba
 * comprueba que coincide con challengesData.
 */
export const MODELOS_CON_RETOS: ReadonlySet<string> = new Set([
  'fundamentos/fpp',
  'fundamentos/ventaja-comparativa',
  'fundamentos/oferta-demanda',
  'fundamentos/elasticidades',
  'fundamentos/excedentes',
  'fundamentos/controles-precios',
  'fundamentos/impuestos',
  'fundamentos/comercio-internacional',
  'fundamentos/externalidades',
  'micro1/restriccion-presupuestal',
  'micro1/preferencias',
  'micro1/eleccion-optima',
  'micro1/slutsky',
  'micro1/demanda',
  'micro1/produccion',
  'micro1/costos',
  'micro1/competencia-perfecta',
  'micro2/bienestar',
  'micro2/equilibrio-produccion',
  'micro2/externalidades',
  'micro2/incertidumbre',
  'micro3/juegos',
  'micro3/informacion',
  'macro2/dd-aa',
  'macro1/keynesiano',
  'macro1/is-lm',
  'macro1/da-oa',
  'macro1/mundell-fleming',
  'micro2/slutsky',
  'micro2/produccion',
  'micro2/edgeworth',
  'micro3/monopolio',
  'micro3/oligopolio',
  'macro2/is-lm',
  'macro2/mundell-fleming',
  'macro2/da-oa',
  'macro2/phillips',
  'macro2/solow',
]);

export const hayDesafio = (materia: string, sim: string): boolean => MODELOS_CON_RETOS.has(`${materia}/${sim}`);
