/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Retos del Modo Desafío para Micro 1 (8 simuladores) y para los simuladores que faltaban en Micro 2
 * (bienestar, equilibrio con producción, externalidades, incertidumbre), Micro 3 (juegos, información)
 * y Macro 2 (DD-AA). Tres por simulador: Básico → Intermedio → Avanzado.
 *
 * Igual que en challengesData.ts, cada `medir` usa las funciones del modelo con que el simulador dibuja
 * la gráfica. Cuando la meta no tiene una forma cerrada corta (bisecciones de costos, FPP con dos
 * sectores, seguro óptimo) se escribe como la misma función del modelo evaluada en la solución, de
 * modo que la meta y la verificación son la misma cuenta.
 */
import { Params } from '../core/tipos';
import { equilibrioNEmpresasCubicas, nLibreEntrada } from '../micro1/modelos/competencia';
import { CostoCubico } from '../micro1/modelos/costos';
import { elasticidades, variaciones } from '../micro1/modelos/demanda';
import { recta } from '../micro1/modelos/presupuesto';
import { descomposicion } from '../micro1/modelos/slutsky';
import { crearUtilidad } from '../micro1/simuladores/_comun';
import { crearTecnologia, maxProducto, minCosto } from '../micro1/simuladores/produccion';
import { fpu } from '../micro2/simuladores/bienestar';
import { equilibrioAutarquia, produccionAPrecio } from '../micro2/simuladores/equilibrio-produccion';
import { bienPublico, externalidad } from '../micro2/simuladores/externalidades';
import { loteria, seguro } from '../micro2/simuladores/incertidumbre';
import { limones, riesgoMoral, spence } from '../micro3/modelos/informacion';
import { JUEGOS, gatillo, nashMixto } from '../micro3/modelos/juegos';
import { pasos as pasosDD } from '../macro2/simuladores/dd-aa';
import { Reto } from './motor';

const n = (p: Params, k: string): number => Number(p[k]);

/* ------------------------------------------------------------------ Micro 1 */

const utilidad = (p: Params) => crearUtilidad(String(p['familia']), n(p, 'a'), n(p, 'b'));
const marshall = (p: Params) => utilidad(p).marshall(n(p, 'p1'), n(p, 'p2'), n(p, 'M'));
const nueva = (p: Params) => recta(n(p, 'p1n'), n(p, 'p2n'), n(p, 'Mn'));
const slutsky1 = (p: Params) =>
  descomposicion(utilidad(p), n(p, 'p1'), n(p, 'p2'), n(p, 'M'), n(p, 'p1n'), p['metodo'] as any);
const tecnologia = (p: Params) => crearTecnologia(String(p['tec']), n(p, 'A'), n(p, 'alpha'), n(p, 'beta'), n(p, 'rho'), n(p, 'nu'));
const cubico = (p: Params) => new CostoCubico(n(p, 'CF'), n(p, 'a'), n(p, 'b'), n(p, 'c'));
const mercadoN = (p: Params) => equilibrioNEmpresasCubicas(n(p, 'Ad'), n(p, 'Bd'), cubico(p), n(p, 'n'));
/** Costo mínimo de Cobb-Douglas x^0.5·y^0.25 con w = (2, 3): c(q) = 0.75·(q·2·12^0.25)^(4/3). */
const costoCD = (q: number) => 0.75 * (q * 2 * 12 ** 0.25) ** (4 / 3);

const MICRO1: Reto[] = [
  // Restricción presupuestal (p₁ = 3, p₂ = 2, M = 45; nueva recta p₁′ = 3.6)
  {
    id: 'mi1-presupuesto-1',
    materia: 'micro1',
    sim: 'restriccion-presupuestal',
    dificultad: 'Básico',
    titulo: 'Recuperar el máximo de x',
    enunciado: 'Con p₁′ = 3.6 la nueva recta corta el eje x en 12.5. Elige el ingreso nuevo M′ para que vuelva a cortar en 15.',
    inicial: {},
    controles: ['Mn'],
    objetivos: [{ etiqueta: 'Intercepto x de la nueva recta', meta: 15, decimales: 2, medir: (p) => nueva(p).intercepto_x, zona: { eje: 'x' } }],
    solucion: { Mn: 54 },
    explicacion:
      'El intercepto x es M′/p₁′, así que con p₁′ = 3.6 hace falta M′ = 54 para comprar 15 unidades si todo se gasta en x. Un alza del ingreso desplaza la recta en paralelo, mientras que un alza de precio la hace girar sobre el intercepto y.',
    pista: 'Multiplica 15 por el nuevo precio p₁′.',
  },
  {
    id: 'mi1-presupuesto-2',
    materia: 'micro1',
    sim: 'restriccion-presupuestal',
    dificultad: 'Intermedio',
    titulo: 'Pendiente y máximo de y',
    enunciado: 'Con M′ = 45, elige los nuevos precios para que la recta tenga pendiente −2 y corte el eje y en 30.',
    inicial: {},
    controles: ['p1n', 'p2n'],
    objetivos: [
      { etiqueta: 'Precio relativo p₁′/p₂′', meta: 2, decimales: 2, medir: (p) => nueva(p).precio_relativo },
      { etiqueta: 'Intercepto y', meta: 30, decimales: 2, medir: (p) => nueva(p).intercepto_y, zona: { eje: 'y' } },
    ],
    solucion: { p1n: 3, p2n: 1.5 },
    explicacion:
      'El intercepto y es M′/p₂′, así que 30 exige p₂′ = 1.5, y la pendiente −p₁′/p₂′ = −2 exige p₁′ = 3. La pendiente es el costo de oportunidad de x medido en unidades de y.',
    pista: 'Primero fija p₂′ con el intercepto y; luego p₁′ con la pendiente.',
  },
  {
    id: 'mi1-presupuesto-3',
    materia: 'micro1',
    sim: 'restriccion-presupuestal',
    dificultad: 'Avanzado',
    titulo: 'Inflación neutral',
    enunciado: 'El precio de x subió 20 % (p₁′ = 3.6). Sube p₂′ y M′ para que la nueva recta coincida con la original (cortes en 15 y 22.5).',
    inicial: {},
    controles: ['p2n', 'Mn'],
    objetivos: [
      { etiqueta: 'Intercepto x', meta: 15, decimales: 2, medir: (p) => nueva(p).intercepto_x, zona: { eje: 'x' } },
      { etiqueta: 'Intercepto y', meta: 22.5, decimales: 2, medir: (p) => nueva(p).intercepto_y, zona: { eje: 'y' } },
    ],
    solucion: { p2n: 2.4, Mn: 54 },
    explicacion:
      'Si todos los precios y el ingreso suben 20 % (p₂′ = 2.4 y M′ = 54), los cortes M/p₁ y M/p₂ no cambian. La restricción es homogénea de grado cero en precios e ingreso: una inflación pura no altera lo que se puede comprar.',
    pista: 'Aplica a p₂ y a M el mismo 20 % que subió p₁.',
  },
  // Preferencias (Cobb-Douglas a = b = 1, canasta (4, 5))
  {
    id: 'mi1-preferencias-1',
    materia: 'micro1',
    sim: 'preferencias',
    dificultad: 'Básico',
    titulo: 'TMS igual a 2',
    enunciado: 'En la canasta (4, 5) la TMS es 1.25. Sin mover x₀, cambia y₀ para que la TMS sea 2.',
    inicial: {},
    controles: ['y0'],
    objetivos: [{ etiqueta: 'TMS en (x₀, y₀)', meta: 2, decimales: 3, medir: (p) => utilidad(p).tms(n(p, 'x0'), n(p, 'y0')) ?? Number.NaN }],
    solucion: { y0: 8 },
    explicacion:
      'Con U = x·y la TMS es UMgx/UMgy = y/x, así que en x = 4 hace falta y = 8 para que valga 2. Cuanto más y tiene el consumidor en relación con x, más unidades de y está dispuesto a ceder por una de x.',
    pista: 'La TMS de Cobb-Douglas simétrica es y/x.',
  },
  {
    id: 'mi1-preferencias-2',
    materia: 'micro1',
    sim: 'preferencias',
    dificultad: 'Intermedio',
    titulo: 'Gustos más intensos por x',
    enunciado: 'Sin mover la canasta (4, 5), cambia el exponente a de x para que la TMS sea 2.5.',
    inicial: {},
    controles: ['a'],
    objetivos: [{ etiqueta: 'TMS en (x₀, y₀)', meta: 2.5, decimales: 3, medir: (p) => utilidad(p).tms(n(p, 'x0'), n(p, 'y0')) ?? Number.NaN }],
    solucion: { a: 2 },
    explicacion:
      'Con U = x^a·y^b la TMS es (a/b)·(y/x) = 1.25·a, que vale 2.5 con a = 2. Un exponente mayor sobre x hace las curvas de indiferencia más empinadas: el consumidor valora más cada unidad de x.',
    pista: 'La TMS es proporcional a a: duplícalo.',
  },
  {
    id: 'mi1-preferencias-3',
    materia: 'micro1',
    sim: 'preferencias',
    dificultad: 'Avanzado',
    titulo: 'Moverse sobre la misma curva',
    enunciado: 'Encuentra otra canasta con la misma utilidad U = 20 en la que la TMS sea 0.8.',
    inicial: {},
    controles: ['x0', 'y0'],
    objetivos: [
      { etiqueta: 'Utilidad U', meta: 20, decimales: 2, medir: (p) => utilidad(p).U(n(p, 'x0'), n(p, 'y0')) },
      { etiqueta: 'TMS', meta: 0.8, decimales: 3, medir: (p) => utilidad(p).tms(n(p, 'x0'), n(p, 'y0')) ?? Number.NaN },
    ],
    solucion: { x0: 5, y0: 4 },
    explicacion:
      'Las condiciones x·y = 20 e y/x = 0.8 dan x = 5 e y = 4, sobre la misma curva de indiferencia pero más abajo y a la derecha. La TMS decreciente refleja la convexidad: con más x, cada unidad adicional vale menos y.',
    pista: 'Busca x·y = 20 con y algo menor que x.',
  },
  // Elección óptima (Cobb-Douglas a = b = 1, p = (3, 2), M = 45)
  {
    id: 'mi1-eleccion-1',
    materia: 'micro1',
    sim: 'eleccion-optima',
    dificultad: 'Básico',
    titulo: 'Más ingreso',
    enunciado: 'Hoy la canasta óptima tiene x* = 7.5. Elige el ingreso M para que x* = 10.',
    inicial: {},
    controles: ['M'],
    objetivos: [{ etiqueta: 'Demanda x*', meta: 10, decimales: 2, medir: (p) => marshall(p).x, zona: { eje: 'x' } }],
    solucion: { M: 60 },
    explicacion:
      'Con Cobb-Douglas simétrica se gasta la mitad del ingreso en cada bien, así que x* = M/(2p₁) = M/6 y x* = 10 exige M = 60. La curva de Engel de x es una recta que sale del origen.',
    pista: 'La mitad del ingreso va a x: busca M/6 = 10.',
  },
  {
    id: 'mi1-eleccion-2',
    materia: 'micro1',
    sim: 'eleccion-optima',
    dificultad: 'Intermedio',
    titulo: 'Cambiar las participaciones',
    enunciado: 'Con M = 45 hoy y* = 11.25. Cambia el exponente a de x para que el consumidor compre y* = 7.5.',
    inicial: {},
    controles: ['a'],
    objetivos: [{ etiqueta: 'Demanda y*', meta: 7.5, decimales: 2, medir: (p) => marshall(p).y, zona: { eje: 'y' } }],
    solucion: { a: 2 },
    explicacion:
      'Con U = x^a·y^b la fracción del gasto en y es b/(a + b), así que y* = 45/(2(a + 1)) = 7.5 exige a = 2. Si x pesa más en las preferencias, el consumidor le dedica dos tercios del ingreso y compra menos y.',
    pista: 'La fracción del ingreso que va a y es 1/(a + 1).',
  },
  {
    id: 'mi1-eleccion-3',
    materia: 'micro1',
    sim: 'eleccion-optima',
    dificultad: 'Avanzado',
    titulo: 'Precios que llevan a una canasta',
    enunciado: 'Con M = 45 y gustos simétricos, elige los precios para que la canasta óptima sea (5, 7.5).',
    inicial: {},
    controles: ['p1', 'p2'],
    objetivos: [
      { etiqueta: 'Demanda x*', meta: 5, decimales: 2, medir: (p) => marshall(p).x, zona: { eje: 'x' } },
      { etiqueta: 'Demanda y*', meta: 7.5, decimales: 2, medir: (p) => marshall(p).y, zona: { eje: 'y' } },
    ],
    solucion: { p1: 4.5, p2: 3 },
    explicacion:
      'Cada bien recibe la mitad del ingreso, 22.5, así que p₁ = 22.5/5 = 4.5 y p₂ = 22.5/7.5 = 3. En el óptimo la TMS y/x = 1.5 coincide con el precio relativo p₁/p₂.',
    pista: 'Divide 22.5 entre la cantidad deseada de cada bien.',
  },
  // Ecuación de Slutsky (Cobb-Douglas a = 2, b = 1, p₁ = 3, M = 45)
  {
    id: 'mi1-slutsky-1',
    materia: 'micro1',
    sim: 'slutsky',
    dificultad: 'Básico',
    titulo: 'Efecto total',
    enunciado: 'Hoy se compran 10 unidades de x a p₁ = 3. Elige el nuevo precio p₁′ para que la canasta final tenga x = 6.',
    inicial: {},
    controles: ['p1n'],
    objetivos: [{ etiqueta: 'x final', meta: 6, decimales: 2, medir: (p) => slutsky1(p).C.x, zona: { eje: 'x' } }],
    solucion: { p1n: 5 },
    explicacion:
      'Con U = x²·y el consumidor gasta dos tercios del ingreso en x, así que x = 30/p₁ y x = 6 exige p₁′ = 5. El efecto total de 10 a 6 suma el efecto sustitución y el efecto ingreso.',
    pista: 'El gasto en x siempre es 30: divide entre 6.',
  },
  {
    id: 'mi1-slutsky-2',
    materia: 'micro1',
    sim: 'slutsky',
    dificultad: 'Intermedio',
    titulo: 'Compensación de Slutsky',
    enunciado: 'Con la compensación de Slutsky (poder comprar la canasta inicial), elige p₁′ para que la compensación de ingreso sea 15.',
    inicial: { metodo: 'slutsky' },
    controles: ['p1n'],
    objetivos: [{ etiqueta: 'Compensación de ingreso', meta: 15, decimales: 2, medir: (p) => slutsky1(p).compensacion }],
    solucion: { p1n: 4.5 },
    explicacion:
      'La compensación de Slutsky es x₀·Δp₁ = 10·(p₁′ − 3), que vale 15 con p₁′ = 4.5. Con ese ingreso el consumidor podría volver a comprar su canasta inicial, aunque prefiere sustituir hacia y.',
    pista: 'Cada peso de alza en p₁ cuesta 10 pesos de ingreso.',
  },
  {
    id: 'mi1-slutsky-3',
    materia: 'micro1',
    sim: 'slutsky',
    dificultad: 'Avanzado',
    titulo: 'Efecto sustitución de Hicks',
    enunciado: 'Con la compensación de Hicks (misma utilidad), elige p₁′ para que el efecto sustitución sobre x sea −1.566.',
    inicial: {},
    controles: ['p1n'],
    objetivos: [{ etiqueta: 'Efecto sustitución en x', meta: 2 * 75 ** (1 / 3) - 10, decimales: 3, medir: (p) => slutsky1(p).efecto_sustitucion[0] }],
    solucion: { p1n: 5 },
    explicacion:
      'Con U = x²·y y U₀ = 750 la demanda compensada es xʰ = 2·(375/p₁′)^(1/3), que en p₁′ = 5 vale 8.434, es decir 1.566 menos que la canasta inicial. El efecto sustitución siempre va en contra del cambio de precio y es menor que el efecto total porque x es un bien normal.',
    pista: 'El efecto sustitución crece con el alza: sube p₁′ por encima de 4.5.',
  },
  // Demanda (Cobb-Douglas a = b = 1, p₂ = 2, M = 45)
  {
    id: 'mi1-demanda-1',
    materia: 'micro1',
    sim: 'demanda',
    dificultad: 'Básico',
    titulo: 'Desplazar la demanda',
    enunciado: 'A p₁ = 3 hoy se demandan 7.5 unidades. Elige el ingreso M para que a ese mismo precio se demanden 10.',
    inicial: {},
    controles: ['M'],
    objetivos: [{ etiqueta: 'Demanda x(p₁, M)', meta: 10, decimales: 2, medir: (p) => marshall(p).x, zona: { eje: 'x' } }],
    solucion: { M: 60 },
    explicacion:
      'La demanda marshalliana es x = M/(2p₁), así que a p₁ = 3 hace falta M = 60 para demandar 10. Más ingreso desplaza toda la curva de demanda hacia la derecha porque x es un bien normal.',
    pista: 'A precio fijo, la demanda crece en proporción al ingreso.',
  },
  {
    id: 'mi1-demanda-2',
    materia: 'micro1',
    sim: 'demanda',
    dificultad: 'Intermedio',
    titulo: 'Variación compensatoria',
    enunciado: 'Elige el nuevo precio p₁′ para que la variación compensatoria del alza (desde p₁ = 3) sea 13.09.',
    inicial: {},
    controles: ['p1n'],
    objetivos: [
      {
        etiqueta: 'Variación compensatoria',
        meta: 45 * (Math.sqrt(5 / 3) - 1),
        decimales: 2,
        medir: (p) => variaciones(utilidad(p), n(p, 'p1'), n(p, 'p2'), n(p, 'M'), n(p, 'p1n')).VC,
      },
    ],
    solucion: { p1n: 5 },
    explicacion:
      'Con U = x·y el gasto mínimo es 2·√(U·p₁·p₂), así que la VC es M·(√(p₁′/p₁) − 1) = 45·(√(5/3) − 1) = 13.09. La VC es el ingreso extra que deja al consumidor tan bien como antes del alza, y supera a la variación equivalente.',
    pista: 'La VC crece con la raíz del precio relativo nuevo.',
  },
  {
    id: 'mi1-demanda-3',
    materia: 'micro1',
    sim: 'demanda',
    dificultad: 'Avanzado',
    titulo: 'Elasticidad con mínimos de subsistencia',
    enunciado: 'Con preferencias Stone-Geary (mínimos de 1 unidad de cada bien) elige p₁ para que la elasticidad precio de x sea −0.896.',
    inicial: { familia: 'stone' },
    controles: ['p1'],
    objetivos: [
      { etiqueta: 'Elasticidad precio de x', meta: -43 / 48, decimales: 3, medir: (p) => elasticidades(utilidad(p), n(p, 'p1'), n(p, 'p2'), n(p, 'M')).e_x_p1 },
    ],
    solucion: { p1: 5 },
    explicacion:
      'Con mínimos de subsistencia x = (43 + p₁)/(2p₁), y su elasticidad precio es −43/(43 + p₁), que vale −43/48 = −0.896 en p₁ = 5. A diferencia de Cobb-Douglas, la demanda es inelástica y se vuelve menos elástica al subir el precio.',
    pista: 'La elasticidad se acerca a cero a medida que p₁ sube.',
  },
  // Producción (Cobb-Douglas x^0.5·y^0.25, w = (2, 3))
  {
    id: 'mi1-produccion-1',
    materia: 'micro1',
    sim: 'produccion',
    dificultad: 'Básico',
    titulo: 'Más presupuesto, más producto',
    enunciado: 'Elige el presupuesto C₀ para que la producción máxima sea √24 ≈ 4.899.',
    inicial: {},
    controles: ['C0'],
    objetivos: [{ etiqueta: 'Producción máxima q*', meta: Math.sqrt(24), decimales: 3, medir: (p) => maxProducto(tecnologia(p), n(p, 'w1'), n(p, 'w2'), n(p, 'C0')).q }],
    solucion: { C0: 36 },
    explicacion:
      'Con exponentes 0.5 y 0.25 se gastan dos tercios del presupuesto en x y un tercio en y, así que con C₀ = 36 se usan x = 12 e y = 4 y q = 12^0.5·4^0.25 = √24. En el óptimo la TMST iguala al precio relativo de los insumos w₁/w₂.',
    pista: 'Busca el presupuesto que compre x = 12 e y = 4.',
  },
  {
    id: 'mi1-produccion-2',
    materia: 'micro1',
    sim: 'produccion',
    dificultad: 'Intermedio',
    titulo: 'El problema dual',
    enunciado: 'En la minimización de costos, elige la producción q₀ cuyo costo mínimo sea 36.99.',
    inicial: { problema: 'minc' },
    controles: ['q0'],
    objetivos: [{ etiqueta: 'Costo mínimo c(w, q₀)', meta: costoCD(5), decimales: 2, medir: (p) => minCosto(tecnologia(p), n(p, 'w1'), n(p, 'w2'), n(p, 'q0')).C }],
    solucion: { q0: 5 },
    explicacion:
      'Para x^0.5·y^0.25 con w = (2, 3) el costo mínimo es c(q) = 0.75·(2·12^0.25·q)^(4/3), que vale 36.99 en q₀ = 5. El exponente 4/3 > 1 refleja rendimientos decrecientes a escala: cada unidad extra cuesta más.',
    pista: 'El costo crece más que proporcionalmente con q₀: prueba valores cerca de 5.',
  },
  {
    id: 'mi1-produccion-3',
    materia: 'micro1',
    sim: 'produccion',
    dificultad: 'Avanzado',
    titulo: 'Elasticidad de sustitución CES',
    enunciado: 'Con tecnología CES, elige ρ para que la elasticidad de sustitución entre insumos sea 4.',
    inicial: { tec: 'ces', alpha: 1, beta: 1, nu: 1 },
    controles: ['rho'],
    objetivos: [{ etiqueta: 'Elasticidad de sustitución σ', meta: 4, decimales: 3, medir: (p) => tecnologia(p).elasticidadSustitucion() }],
    solucion: { rho: 0.75 },
    explicacion:
      'En la CES σ = 1/(1 − ρ), así que σ = 4 exige ρ = 0.75. Las isocuantas se aplanan a medida que ρ se acerca a 1 (sustitutos perfectos) y se vuelven escuadras cuando ρ tiende a −∞ (Leontief).',
    pista: 'Despeja ρ de σ = 1/(1 − ρ).',
  },
  // Costos de corto plazo (CF = 20, CV = 10q − 2q² + 0.5q³)
  {
    id: 'mi1-costos-1',
    materia: 'micro1',
    sim: 'costos',
    dificultad: 'Básico',
    titulo: 'Costo marginal de 40',
    enunciado: 'Elige la producción q en la que el costo marginal es 40.',
    inicial: {},
    controles: ['q'],
    objetivos: [{ etiqueta: 'CMg(q)', meta: 40, decimales: 2, medir: (p) => cubico(p).CMg(n(p, 'q')), zona: { eje: 'y' } }],
    solucion: { q: 6 },
    explicacion:
      'El costo marginal es CMg = 10 − 4q + 1.5q², que vale 40 cuando 1.5q² − 4q − 30 = 0, es decir q = 6. Pasado su mínimo el CMg crece rápido por los rendimientos decrecientes del factor variable.',
    pista: 'El CMg sube con q después de q = 1.33: avanza hacia la derecha.',
  },
  {
    id: 'mi1-costos-2',
    materia: 'micro1',
    sim: 'costos',
    dificultad: 'Intermedio',
    titulo: 'Precio de cierre',
    enunciado: 'Hoy el mínimo del CVMe (precio de cierre) es 8. Cambia el coeficiente c para que baje a 7.5.',
    inicial: {},
    controles: ['c'],
    objetivos: [{ etiqueta: 'Mínimo del CVMe', meta: 7.5, decimales: 2, medir: (p) => cubico(p).CVMe(cubico(p).q_min_cvme()) }],
    solucion: { c: 0.4 },
    explicacion:
      'El CVMe = a − bq + cq² tiene su mínimo en q = b/(2c) y vale a − b²/(4c), que con c = 0.4 es 10 − 4/1.6 = 7.5. Por debajo de ese precio la empresa cierra porque ni siquiera cubre su costo variable.',
    pista: 'Un c menor aplana el CVMe y baja su mínimo.',
  },
  {
    id: 'mi1-costos-3',
    materia: 'micro1',
    sim: 'costos',
    dificultad: 'Avanzado',
    titulo: 'Precio de nivelación',
    enunciado: 'Hoy el mínimo del costo medio (nivelación) es 14.83. Elige el costo fijo CF para que suba a 19.94.',
    inicial: {},
    controles: ['CF'],
    objetivos: [{ etiqueta: 'Mínimo del CMe', meta: new CostoCubico(40, 10, 2, 0.5).precio_nivelacion(), decimales: 2, medir: (p) => cubico(p).precio_nivelacion() }],
    solucion: { CF: 40 },
    explicacion:
      'El mínimo del CMe está donde el CMg lo corta, en la raíz de 2c·q³ − b·q² = CF, que con CF = 40 es q = 4.23 y da CMe = 19.94. El costo fijo no cambia el CMg ni el precio de cierre, pero sí el precio al que la empresa deja de perder.',
    pista: 'Un costo fijo mayor eleva el CMe sin mover el CMg: duplícalo.',
  },
  // Competencia perfecta (n = 20 empresas, demanda Q = 400 − 10P)
  {
    id: 'mi1-competencia-1',
    materia: 'micro1',
    sim: 'competencia-perfecta',
    dificultad: 'Básico',
    titulo: 'Más empresas, menor precio',
    enunciado: 'Con 20 empresas el precio de corto plazo es 29.62. Elige el número de empresas n para que baje a 25.55.',
    inicial: {},
    controles: ['n'],
    objetivos: [{ etiqueta: 'Precio de mercado', meta: equilibrioNEmpresasCubicas(400, 10, new CostoCubico(20, 10, 2, 0.5), 30).p, decimales: 2, medir: (p) => mercadoN(p).p }],
    solucion: { n: 30 },
    explicacion:
      'La oferta de mercado es n veces el CMg de cada empresa, así que con 30 empresas corta a la demanda en P = 25.55. Cada empresa sigue produciendo donde P = CMg, pero ahora con menos beneficio.',
    pista: 'Más empresas desplazan la oferta a la derecha: aumenta n.',
  },
  {
    id: 'mi1-competencia-2',
    materia: 'micro1',
    sim: 'competencia-perfecta',
    dificultad: 'Intermedio',
    titulo: 'Un auge de demanda',
    enunciado: 'Con 20 empresas, elige el intercepto de la demanda A_d para que el precio de corto plazo suba a 38.25.',
    inicial: {},
    controles: ['Ad'],
    objetivos: [{ etiqueta: 'Precio de mercado', meta: equilibrioNEmpresasCubicas(500, 10, new CostoCubico(20, 10, 2, 0.5), 20).p, decimales: 2, medir: (p) => mercadoN(p).p }],
    solucion: { Ad: 500 },
    explicacion:
      'Con A_d = 500 la demanda corta a la oferta de corto plazo en P = 38.25 y cada empresa gana 113.6. Esos beneficios extraordinarios son la señal que atrae nuevas empresas en el largo plazo.',
    pista: 'A corto plazo el número de empresas es fijo: sube la demanda.',
  },
  {
    id: 'mi1-competencia-3',
    materia: 'micro1',
    sim: 'competencia-perfecta',
    dificultad: 'Avanzado',
    titulo: 'Libre entrada',
    enunciado: 'A largo plazo entran empresas hasta que el beneficio es cero. Elige A_d para que caben 98.5 empresas en equilibrio de largo plazo.',
    inicial: {},
    controles: ['Ad'],
    objetivos: [{ etiqueta: 'Empresas de largo plazo n*', meta: nLibreEntrada(500, 10, new CostoCubico(20, 10, 2, 0.5)).n, decimales: 1, medir: (p) => nLibreEntrada(n(p, 'Ad'), n(p, 'Bd'), cubico(p)).n }],
    solucion: { Ad: 500 },
    explicacion:
      'A largo plazo el precio baja al mínimo del CMe (14.83) sin importar la demanda, y cada empresa produce 3.57, así que n* = (A_d − 148.3)/3.57 = 98.5 con A_d = 500. La demanda solo decide cuántas empresas caben, no el precio.',
    pista: 'Cada 10 puntos de A_d dan espacio a unas 28 empresas más.',
  },
];

/* ------------------------------------------------------------------ Micro 2 (faltantes) */

const SIN_CHOQUE_DD = { choque: 'ninguno', dG: 0, dMp: 0, dRstar: 0, dn0: 0, dEe: 0, dE0: 0 };
const economia = (p: Params) => ({ L: n(p, 'L'), K: n(p, 'K'), alfa: n(p, 'alfa'), beta: n(p, 'beta') });
const E100 = { L: 100, K: 100, alfa: 0.7, beta: 0.3 };
const ext = (p: Params) => externalidad({ a: n(p, 'a'), b: n(p, 'b'), c: n(p, 'c'), d: n(p, 'd'), e: n(p, 'e') });
const publico = (p: Params) => bienPublico({ a1: n(p, 'a1'), b1: n(p, 'b1'), a2: n(p, 'a2'), b2: n(p, 'b2'), cg: n(p, 'cg') });

const MICRO2: Reto[] = [
  // Bienestar (u_A = 2√x_A, u_B = √x_B, W = 100)
  {
    id: 'mi2-bienestar-1',
    materia: 'micro2',
    sim: 'bienestar',
    dificultad: 'Básico',
    titulo: 'El máximo de Rawls',
    enunciado: 'Con el criterio de Rawls ambos terminan con la misma utilidad. Elige la cantidad del bien W para que esa utilidad sea 10.',
    inicial: {},
    controles: ['W'],
    objetivos: [{ etiqueta: 'Utilidad de Rawls (u_A = u_B)', meta: 10, decimales: 2, medir: (p) => fpu(n(p, 'ua'), n(p, 'ub'), n(p, 'W')).rawls.uA, zona: { eje: 'x' } }],
    solucion: { W: 125 },
    explicacion:
      'Rawls iguala utilidades: 2√x_A = √(W − x_A) da x_A = W/5, y la utilidad común es 2√(W/5), que vale 10 con W = 125. Este criterio favorece a B, que es menos eficiente transformando el bien en utilidad.',
    pista: 'La utilidad igualitaria crece con la raíz de W.',
  },
  {
    id: 'mi2-bienestar-2',
    materia: 'micro2',
    sim: 'bienestar',
    dificultad: 'Intermedio',
    titulo: 'Utilitarismo igualitario',
    enunciado: 'El utilitarista (Bentham) hoy le da a A 80 de las 100 unidades. Cambia la eficiencia de B para que el reparto sea mitad y mitad.',
    inicial: {},
    controles: ['ub'],
    objetivos: [{ etiqueta: 'x_A de Bentham', meta: 50, decimales: 2, medir: (p) => fpu(n(p, 'ua'), n(p, 'ub'), n(p, 'W')).bentham.xA }],
    solucion: { ub: 2 },
    explicacion:
      'Bentham iguala utilidades marginales y da x_A = W·a²/(a² + b²), que es W/2 solo si b = a = 2. El utilitarismo reparte más a quien convierte mejor el bien en utilidad, sin importar la desigualdad.',
    pista: 'El reparto es parejo cuando ambos son igual de eficientes.',
  },
  {
    id: 'mi2-bienestar-3',
    materia: 'micro2',
    sim: 'bienestar',
    dificultad: 'Avanzado',
    titulo: 'Bienestar utilitarista máximo',
    enunciado: 'El bienestar de Bentham (u_A + u_B) hoy es 22.36. Cambia la eficiencia de A para que el máximo llegue a 26.',
    inicial: {},
    controles: ['ua'],
    objetivos: [{ etiqueta: 'Bienestar de Bentham', meta: 26, decimales: 2, medir: (p) => fpu(n(p, 'ua'), n(p, 'ub'), n(p, 'W')).bentham.W }],
    solucion: { ua: 2.4 },
    explicacion:
      'El máximo de a√x + b√(W − x) es √(W·(a² + b²)), que con W = 100 y b = 1 vale 26 cuando a² = 5.76, es decir a = 2.4. La función de bienestar elige el punto de la FPU tangente a sus líneas de nivel u_A + u_B = constante.',
    pista: 'Busca a² + 1 = 6.76.',
  },
  // Equilibrio general con producción (L = K = 100, α = 0.7, β = 0.3)
  {
    id: 'mi2-eqprod-1',
    materia: 'micro2',
    sim: 'equilibrio-produccion',
    dificultad: 'Básico',
    titulo: 'Gustos y producción',
    enunciado: 'Con γ = 0.5 la economía produce y₁ = 54.3. Cambia el peso γ del bien 1 en las preferencias para que produzca y₁ = 72.2.',
    inicial: {},
    controles: ['gamma'],
    objetivos: [{ etiqueta: 'Producción y₁', meta: equilibrioAutarquia(E100, 0.7).y1, decimales: 1, medir: (p) => equilibrioAutarquia(economia(p), n(p, 'gamma')).y1, zona: { eje: 'x' } }],
    solucion: { gamma: 0.7 },
    explicacion:
      'En autarquía la economía elige el punto de la FPP donde la TMS del consumidor iguala la TMT, y con γ = 0.7 ese punto está en y₁ = 72.2. Más gusto por el bien 1 desliza la producción a lo largo de la frontera y encarece su precio relativo.',
    pista: 'Más peso de γ mueve la producción hacia el bien 1.',
  },
  {
    id: 'mi2-eqprod-2',
    materia: 'micro2',
    sim: 'equilibrio-produccion',
    dificultad: 'Intermedio',
    titulo: 'Stolper-Samuelson',
    enunciado: 'En la vista de teoremas, con precio p′ = 1 la economía produce y₁ = 54.3. Elige p′ para que produzca y₁ = 89.9.',
    inicial: { enfoque: 'teoremas', pn: 1 },
    controles: ['pn'],
    objetivos: [{ etiqueta: 'y₁ al precio nuevo', meta: produccionAPrecio(E100, 1.3).y1, decimales: 1, medir: (p) => produccionAPrecio(economia(p), n(p, 'pn')).y1 }],
    solucion: { pn: 1.3 },
    explicacion:
      'Con p′ = 1.3 la producción se mueve hasta que TMT = 1.3, y el sector 1, intensivo en trabajo, pasa a 89.9. Stolper-Samuelson: el salario real sube (w de 0.54 a 0.86) y la renta del capital baja (r de 0.54 a 0.45).',
    pista: 'Un precio relativo mayor del bien 1 lo hace más rentable: súbelo.',
  },
  {
    id: 'mi2-eqprod-3',
    materia: 'micro2',
    sim: 'equilibrio-produccion',
    dificultad: 'Avanzado',
    titulo: 'Rybczynski',
    enunciado: 'A precios constantes, aumenta la dotación de trabajo (ΔL) hasta que y₁ = 101.8 y y₂ caiga a 33.9.',
    inicial: { enfoque: 'teoremas', dL: 0 },
    controles: ['dL'],
    objetivos: [
      { etiqueta: 'y₁ con más trabajo', meta: produccionAPrecio({ ...E100, L: 150 }, 1).y1, decimales: 1, medir: (p) => produccionAPrecio({ ...economia(p), L: n(p, 'L') + n(p, 'dL') }, n(p, 'p')).y1 },
      { etiqueta: 'y₂ con más trabajo', meta: produccionAPrecio({ ...E100, L: 150 }, 1).y2, decimales: 1, medir: (p) => produccionAPrecio({ ...economia(p), L: n(p, 'L') + n(p, 'dL') }, n(p, 'p')).y2 },
    ],
    solucion: { dL: 50 },
    explicacion:
      'Con ΔL = 50 y precios fijos el sector intensivo en trabajo crece a 101.8 y el intensivo en capital cae de 54.3 a 33.9, porque debe cederle capital para emplear el trabajo nuevo sin cambiar las proporciones. Es el teorema de Rybczynski: crece más que proporcionalmente un sector y el otro se contrae.',
    pista: 'El bien intensivo en capital cae: sigue sumando trabajo hasta ver y₂ ≈ 34.',
  },
  // Externalidades y bienes públicos
  {
    id: 'mi2-externalidades-1',
    materia: 'micro2',
    sim: 'externalidades',
    dificultad: 'Básico',
    titulo: 'Daño marginal y óptimo',
    enunciado: 'El mercado produce 45 y el óptimo social es 36. Elige la pendiente del daño marginal e para que el óptimo baje a 30.',
    inicial: {},
    controles: ['e'],
    objetivos: [{ etiqueta: 'Cantidad óptima Qs', meta: 30, decimales: 2, medir: (p) => ext(p).Qs, zona: { eje: 'x' } }],
    solucion: { e: 1 },
    explicacion:
      'El óptimo iguala la demanda con el costo marginal social c + (d + e)Q, así que Qs = 90/(2 + e) = 30 con e = 1. El impuesto pigouviano que lo implementa es el daño marginal en el óptimo, t = e·Qs = 30.',
    pista: 'Un daño más empinado baja el óptimo: sube e.',
  },
  {
    id: 'mi2-externalidades-2',
    materia: 'micro2',
    sim: 'externalidades',
    dificultad: 'Intermedio',
    titulo: 'Condición de Samuelson',
    enunciado: 'Con dos consumidores (TMS₁ = 60 − G, TMS₂ = 40 − G), elige el costo marginal del bien público para que la provisión óptima sea G = 40.',
    inicial: { enfoque: 'publico' },
    controles: ['cg'],
    objetivos: [{ etiqueta: 'Provisión óptima G*', meta: 40, decimales: 2, medir: (p) => publico(p).G, zona: { eje: 'x' } }],
    solucion: { cg: 20 },
    explicacion:
      'Samuelson: la suma vertical de las TMS iguala al costo marginal, 100 − 2G = CMg, y G = 40 exige CMg = 20. Como el bien no es rival se suman las valoraciones de todos, no las cantidades.',
    pista: 'Suma las dos TMS en G = 40.',
  },
  {
    id: 'mi2-externalidades-3',
    materia: 'micro2',
    sim: 'externalidades',
    dificultad: 'Avanzado',
    titulo: 'El polizón',
    enunciado: 'Elige la valoración a₂ del segundo consumidor y el costo marginal para que el óptimo sea G = 40 y la provisión privada solo 30.',
    inicial: { enfoque: 'publico' },
    controles: ['a2', 'cg'],
    objetivos: [
      { etiqueta: 'Provisión óptima G*', meta: 40, decimales: 2, medir: (p) => publico(p).G, zona: { eje: 'x' } },
      { etiqueta: 'Provisión privada', meta: 30, decimales: 2, medir: (p) => publico(p).Gprivado },
    ],
    solucion: { a2: 50, cg: 30 },
    explicacion:
      'En la provisión privada solo aporta quien más valora el bien, y (60 − CMg)/1 = 30 exige CMg = 30; luego Samuelson pide (60 − G) + (a₂ − G) = 30 en G = 40, lo que da a₂ = 50. La brecha de 10 unidades es el costo del comportamiento de polizón del consumidor 2.',
    pista: 'Fija primero CMg = 30 con la provisión privada; luego ajusta a₂.',
  },
  // Elección bajo incertidumbre (u = √w)
  {
    id: 'mi2-incertidumbre-1',
    materia: 'micro2',
    sim: 'incertidumbre',
    dificultad: 'Básico',
    titulo: 'Valor esperado',
    enunciado: 'La lotería paga 25 o 100. Elige la probabilidad π del premio bajo para que el valor esperado sea 70.',
    inicial: {},
    controles: ['pi'],
    objetivos: [{ etiqueta: 'Valor esperado', meta: 70, decimales: 2, medir: (p) => loteria(n(p, 'r'), n(p, 'w1'), n(p, 'w2'), n(p, 'pi')).VE, zona: { eje: 'x' } }],
    solucion: { pi: 0.4 },
    explicacion:
      'El valor esperado es 25π + 100(1 − π) = 100 − 75π, que vale 70 con π = 0.4. El valor esperado no depende de la actitud ante el riesgo, pero el equivalente cierto sí.',
    pista: 'Cada 0.1 de probabilidad del premio bajo resta 7.5 al valor esperado.',
  },
  {
    id: 'mi2-incertidumbre-2',
    materia: 'micro2',
    sim: 'incertidumbre',
    dificultad: 'Intermedio',
    titulo: 'Equivalente cierto',
    enunciado: 'Con π = 0.5 y u = √w, elige el premio bajo w₁ para que el equivalente cierto de la lotería sea 64.',
    inicial: {},
    controles: ['w1'],
    objetivos: [{ etiqueta: 'Equivalente cierto', meta: 64, decimales: 2, medir: (p) => loteria(n(p, 'r'), n(p, 'w1'), n(p, 'w2'), n(p, 'pi')).EC, zona: { eje: 'x' } }],
    solucion: { w1: 36 },
    explicacion:
      'El equivalente cierto cumple √EC = 0.5·√w₁ + 0.5·√100, así que EC = 64 exige √w₁ = 6, es decir w₁ = 36. Como el valor esperado es 68, la prima de riesgo de 4 mide cuánto pagaría este consumidor averso por evitar la lotería.',
    pista: 'Trabaja con raíces: la utilidad esperada debe ser 8.',
  },
  {
    id: 'mi2-incertidumbre-3',
    materia: 'micro2',
    sim: 'incertidumbre',
    dificultad: 'Avanzado',
    titulo: 'Seguro con prima injusta',
    enunciado: 'Con prima justa (γ = π = 0.2) el consumidor se asegura por completo (K = 50). Sube la prima γ hasta que solo compre K = 30 de cobertura.',
    inicial: { enfoque: 'seguro' },
    controles: ['gamma'],
    objetivos: [{ etiqueta: 'Cobertura K', meta: seguro(0.5, 100, 50, 0.2, 0.22).K, decimales: 1, medir: (p) => seguro(n(p, 'r'), n(p, 'W'), n(p, 'L'), n(p, 'pl'), n(p, 'gamma')).K }],
    solucion: { gamma: 0.22 },
    explicacion:
      'El óptimo cumple π(1 − γ)·u′(c_malo) = (1 − π)γ·u′(c_bueno), y con γ = 0.22 la cobertura cae a K ≈ 30 porque el seguro ya no es actuarialmente justo. Un consumidor averso al riesgo se asegura por completo solo si la prima es justa.',
    pista: 'La cobertura cae muy rápido con la prima: prueba valores apenas mayores que 0.2.',
  },
];

/* ------------------------------------------------------------------ Micro 3 (faltantes) */

const juego = (p: Params) => ({
  a11: n(p, 'a11'), a12: n(p, 'a12'), a21: n(p, 'a21'), a22: n(p, 'a22'),
  b11: n(p, 'b11'), b12: n(p, 'b12'), b21: n(p, 'b21'), b22: n(p, 'b22'),
});
const mixto = (p: Params) => nashMixto(juego(p));

const MICRO3: Reto[] = [
  {
    id: 'mi3-juegos-1',
    materia: 'micro3',
    sim: 'juegos',
    dificultad: 'Básico',
    titulo: 'Tentación de traicionar',
    enunciado: 'En el dilema del prisionero repetido la cooperación se sostiene si δ ≥ 0.5. Cambia la tentación T (pago de delatar si el otro coopera) para que el umbral sea 0.75.',
    inicial: { enfoque: 'repetido' },
    controles: ['a21'],
    objetivos: [{ etiqueta: 'Umbral δ* de la estrategia gatillo', meta: 0.75, decimales: 3, medir: (p) => gatillo(juego(p)).delta ?? Number.NaN }],
    solucion: { a21: 9 },
    explicacion:
      'Con estrategias gatillo cooperar conviene si δ ≥ (T − R)/(T − P) = (T − 3)/(T − 1), que vale 0.75 con T = 9. Una tentación mayor exige jugadores más pacientes para sostener la cooperación.',
    pista: 'Sube T: la ganancia de traicionar pesa más.',
  },
  {
    id: 'mi3-juegos-2',
    materia: 'micro3',
    sim: 'juegos',
    dificultad: 'Intermedio',
    titulo: 'Equilibrio mixto en la batalla de los sexos',
    enunciado: 'En la batalla de los sexos B juega B₁ con q = 1/3 en el equilibrio mixto. Cambia el pago a₁₁ de A para que q sea 0.25.',
    inicial: { juego: 'coordinacion', ...JUEGOS['coordinacion'].pagos },
    controles: ['a11'],
    objetivos: [{ etiqueta: 'q de B en el equilibrio mixto', meta: 0.25, decimales: 3, medir: (p) => mixto(p)?.q ?? Number.NaN, zona: { eje: 'x' } }],
    solucion: { a11: 3 },
    explicacion:
      'B mezcla para dejar a A indiferente: q·a₁₁ = (1 − q)·1, así que q = 1/(a₁₁ + 1) = 0.25 con a₁₁ = 3. En un equilibrio mixto los pagos de A determinan la estrategia de B y no la propia.',
    pista: 'Cuanto más gana A en (A₁, B₁), menos necesita B jugar B₁ para dejarlo indiferente.',
  },
  {
    id: 'mi3-juegos-3',
    materia: 'micro3',
    sim: 'juegos',
    dificultad: 'Avanzado',
    titulo: 'Pares y nones asimétrico',
    enunciado: 'En pares y nones ambos mezclan 50/50. Cambia a₁₁ y b₁₂ para que el equilibrio mixto sea p = 0.25 y q = 0.25.',
    inicial: { juego: 'monedas', ...JUEGOS['monedas'].pagos },
    controles: ['a11', 'b12'],
    objetivos: [
      { etiqueta: 'q de B', meta: 0.25, decimales: 3, medir: (p) => mixto(p)?.q ?? Number.NaN, zona: { eje: 'x' } },
      { etiqueta: 'p de A', meta: 0.25, decimales: 3, medir: (p) => mixto(p)?.p ?? Number.NaN, zona: { eje: 'y' } },
    ],
    solucion: { a11: 6, b12: 6 },
    explicacion:
      'La indiferencia de A da q = 2/(a₁₁ + 2) y la de B da p = 2/(b₁₂ + 2), así que ambas valen 0.25 con a₁₁ = b₁₂ = 6. Subir el premio de A no cambia cuánto juega A₁, sino cuánto juega B₁: es la paradoja de los equilibrios mixtos.',
    pista: 'Cada jugador mezcla para dejar indiferente al otro: mueve los dos pagos por igual.',
  },
  {
    id: 'mi3-informacion-1',
    materia: 'micro3',
    sim: 'informacion',
    dificultad: 'Básico',
    titulo: 'Señal mínima de Spence',
    enunciado: 'Con θ_B = 2 y θ_A = 4 la educación mínima que separa los tipos es 4. Cambia la productividad θ_A para que sea 6.',
    inicial: { enfoque: 'senalizacion', tema: 'spence' },
    controles: ['tA'],
    objetivos: [{ etiqueta: 'Educación mínima separadora', meta: 6, decimales: 2, medir: (p) => spence({ tB: n(p, 'tB'), tA: n(p, 'tA'), e: n(p, 'e') }).eMin }],
    solucion: { tA: 5 },
    explicacion:
      'El tipo bajo no imita si θ_A − e/θ_B ≤ θ_B, es decir e ≥ θ_B·(θ_A − θ_B) = 2·(θ_A − 2), que vale 6 con θ_A = 5. Cuanto mayor es la brecha de productividad, más costosa debe ser la señal para que no convenga imitarla.',
    pista: 'La señal mínima crece con la diferencia θ_A − θ_B.',
  },
  {
    id: 'mi3-informacion-2',
    materia: 'micro3',
    sim: 'informacion',
    dificultad: 'Intermedio',
    titulo: 'Mercado de limones',
    enunciado: 'Con k = 1.5 los autos se venden a p = 60 y salen del mercado los de calidad mayor. Elige k para que el precio de equilibrio suba a 80.',
    inicial: {},
    controles: ['k'],
    objetivos: [{ etiqueta: 'Precio de equilibrio', meta: 80, decimales: 2, medir: (p) => limones({ k: n(p, 'k'), tmin: n(p, 'tmin'), tmax: n(p, 'tmax') }).p, zona: { eje: 'x' } }],
    solucion: { k: 1.6 },
    explicacion:
      'El comprador paga k veces la calidad media de lo que se ofrece, (θ_min + p)/2, y el punto fijo es p = k·θ_min/(2 − k), que vale 80 con k = 1.6. Aun así los autos de calidad superior a 80 no se venden: la información asimétrica destruye intercambios valiosos.',
    pista: 'Si los compradores valoran más los autos, el precio de equilibrio sube.',
  },
  {
    id: 'mi3-informacion-3',
    materia: 'micro3',
    sim: 'informacion',
    dificultad: 'Avanzado',
    titulo: 'Bono que induce esfuerzo',
    enunciado: 'Con un bono de 20, elige el costo del esfuerzo ψ y la probabilidad de éxito sin esfuerzo π_B para que el bono mínimo sea 40 y el agente que se esfuerza obtenga 4.',
    inicial: { enfoque: 'senalizacion', tema: 'riesgo' },
    controles: ['psi', 'piB'],
    objetivos: [
      { etiqueta: 'Bono mínimo', meta: 40, decimales: 2, medir: (p) => riesgoMoral({ piA: n(p, 'piA'), piB: n(p, 'piB'), psi: n(p, 'psi'), b: n(p, 'b') }).bMin },
      { etiqueta: 'Utilidad con esfuerzo', meta: 4, decimales: 2, medir: (p) => riesgoMoral({ piA: n(p, 'piA'), piB: n(p, 'piB'), psi: n(p, 'psi'), b: n(p, 'b') }).uEsfuerzo },
    ],
    solucion: { psi: 12, piB: 0.5 },
    explicacion:
      'La utilidad con esfuerzo es π_A·b − ψ = 16 − ψ, que vale 4 con ψ = 12, y el bono mínimo ψ/(π_A − π_B) = 40 exige π_B = 0.5. Con un bono de 20 por debajo de 40 el agente no se esfuerza: la compatibilidad de incentivos falla.',
    pista: 'Fija ψ con la utilidad y luego acerca π_B a π_A.',
  },
];

/* ------------------------------------------------------------------ Macro 2 (DD-AA) */

const dd = (p: Params) => pasosDD(p as any);

const MACRO2: Reto[] = [
  {
    id: 'm2-ddaa-1',
    materia: 'macro2',
    sim: 'dd-aa',
    dificultad: 'Básico',
    titulo: 'Expansión monetaria transitoria',
    enunciado: 'Con tipo flotante el equilibrio es Y = 1000 y E = 1. Elige la expansión ΔM/P para que el tipo de cambio de corto plazo suba a 1.0417.',
    inicial: { ...SIN_CHOQUE_DD },
    controles: ['dMp'],
    objetivos: [{ etiqueta: 'Tipo de cambio de corto plazo E₁', meta: 25 / 24, decimales: 4, medir: (p) => dd(p).e1.E, zona: { eje: 'y' } }],
    solucion: { dMp: 50 },
    explicacion:
      'Con ΔM/P = 50 la AA se desplaza: la tasa interna cae a 0 y la paridad con Eᵉ = 1 y R* = 4 % exige E = 1/0.96 = 1.0417. La depreciación abarata las exportaciones y el producto sube a 1011.9.',
    pista: 'Más dinero baja R y deprecia la moneda: aumenta ΔM/P.',
  },
  {
    id: 'm2-ddaa-2',
    materia: 'macro2',
    sim: 'dd-aa',
    dificultad: 'Intermedio',
    titulo: 'Devaluación con tipo fijo',
    enunciado: 'Con tipo de cambio fijo, elige la devaluación ΔE₀ para que el producto de corto plazo llegue a 1057.1.',
    inicial: { ...SIN_CHOQUE_DD, regimen: 'fijo' },
    controles: ['dE0'],
    objetivos: [{ etiqueta: 'Producto de corto plazo Y₁', meta: 370 / 0.35, decimales: 1, medir: (p) => dd(p).e1.Y, zona: { eje: 'x' } }],
    solucion: { dE0: 0.2 },
    explicacion:
      'La DD es Y = (250 + 100·E)/0.35, así que E = 1.2 da Y = 370/0.35 = 1057.1. El banco central compra divisas para sostener la nueva paridad y la oferta monetaria crece, aunque a largo plazo los precios suben y el efecto real desaparece.',
    pista: 'Cada décima de devaluación suma 28.6 al producto.',
  },
  {
    id: 'm2-ddaa-3',
    materia: 'macro2',
    sim: 'dd-aa',
    dificultad: 'Avanzado',
    titulo: 'Expansión fiscal permanente',
    enunciado: 'Con tipo flotante, un aumento permanente del gasto aprecia la moneda a largo plazo. Elige ΔG para que el tipo de cambio de largo plazo sea E₂ = 0.70.',
    inicial: { ...SIN_CHOQUE_DD },
    controles: ['dG'],
    objetivos: [{ etiqueta: 'Tipo de cambio de largo plazo E₂', meta: 0.7, decimales: 3, medir: (p) => dd(p).e2?.E ?? Number.NaN, zona: { eje: 'y' } }],
    solucion: { dG: 30 },
    explicacion:
      'Si el choque es permanente las expectativas se ajustan hasta que el producto vuelve a 1000, lo que exige 0.35·1000 = 280 + 100·E₂ y por eso E₂ = 0.70. La apreciación desplaza exportaciones netas en la misma cuantía que el gasto y la cuenta corriente empeora de −50 a −80.',
    pista: 'A largo plazo Y no cambia: la moneda se aprecia una centésima por cada peso de gasto.',
  },
];

export const RETOS_MICRO1_RESTO: Reto[] = [...MICRO1, ...MICRO2, ...MICRO3, ...MACRO2];
