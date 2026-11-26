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
