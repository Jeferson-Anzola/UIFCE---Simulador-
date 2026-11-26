/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Retos del Modo Desafío para Fundamentos (Mankiw, Principios) y Macro 1 (Blanchard, corto plazo):
 * tres por simulador, en orden Básico → Intermedio → Avanzado.
 *
 * Igual que en challengesData.ts, cada `medir` llama a las mismas funciones del modelo con que el
 * simulador dibuja la gráfica (curvas(), equilibrio(), escenarios()…), así que la verificación es la
 * cuenta exacta del modelo y no una lectura de la figura. Las metas salen de las fórmulas cerradas
 * que se citan en cada explicación; desafio.spec.ts comprueba que la `solucion` las cumple.
 */
import { Params } from '../core/tipos';
import { comercio } from '../fundamentos/modelos/comercio';
import { precioMaximo, precioMinimo } from '../fundamentos/modelos/controles';
import { elasticidadDemanda, ingresoTotal, precioIngresoMaximo } from '../fundamentos/modelos/elasticidad';
import { excedenteCompradores, excedenteConsumidor, excedenteProductor } from '../fundamentos/modelos/excedentes';
import { externalidad } from '../fundamentos/modelos/externalidades';
import { FPP } from '../fundamentos/modelos/fpp';
import { aplicarImpuesto } from '../fundamentos/modelos/impuestos';
import { Demanda, Oferta, equilibrio } from '../fundamentos/modelos/mercado';
import { Productor, comerciar, rangoPrecio } from '../fundamentos/modelos/ventaja';
import { curvas } from '../fundamentos/simuladores/_ui';
import { COMPRADORES } from '../fundamentos/simuladores/excedentes';
import { deltaDemanda, deltaOferta } from '../fundamentos/simuladores/oferta-demanda';
import { trayectoria } from '../macro1/modelos/daoa';
import { equilibrioISLM } from '../macro1/modelos/islm';
import { equilibrioKeynes } from '../macro1/modelos/keynesiano';
import { equilibrioMF } from '../macro1/modelos/mundell';
import { escenarios as escDAOA } from '../macro1/simuladores/da-oa';
import { escenarios as escISLM } from '../macro1/simuladores/is-lm';
import { escenarios as escKeynes } from '../macro1/simuladores/keynesiano';
import { escenarios as escMF } from '../macro1/simuladores/mundell-fleming';
import { Reto } from './motor';

const n = (p: Params, k: string): number => Number(p[k]);
const mercado = (p: Params) => curvas(n(p, 'a'), n(p, 'b'), n(p, 'c'), n(p, 'd'), String(p['elastica'] ?? 'ninguna'), n(p, 'p_horizontal'));

/* ------------------------------------------------------------------ Fundamentos */

/** Equilibrio inicial (E₀) y nuevo (E₁) del simulador de oferta y demanda. */
const od = (p: Params) => {
  const [D0, S0] = mercado(p);
  const D1 = D0.desplazar(deltaDemanda(String(p['evento_d']), n(p, 'cambio_d')));
  const S1 = S0.desplazar(deltaOferta(String(p['evento_s']), n(p, 'cambio_s')));
  return { e0: equilibrio(D0, S0), e1: equilibrio(D1, S1) };
};
const demandaLineal = (p: Params) => new Demanda(n(p, 'a'), n(p, 'b'));
const excedentes = (p: Params) => {
  const [D, S] = mercado(p);
  const r = equilibrio(D, S);
  const ec = excedenteConsumidor(D, r.q, r.p);
  const ep = excedenteProductor(S, r.q, r.p);
  return { ec, ep, total: ec + ep };
};
const control = (p: Params) => {
  const [D, S] = mercado(p);
  return p['tipo'] === 'minimo' ? precioMinimo(D, S, n(p, 'precio_control')) : precioMaximo(D, S, n(p, 'precio_control'));
};
const impuesto = (p: Params) => {
  const [D, S] = mercado(p);
  return aplicarImpuesto(D, S, n(p, 't'), String(p['sobre']));
};
const comercioDe = (p: Params) =>
  comercio(
    new Demanda(n(p, 'a'), n(p, 'b')),
    new Oferta(n(p, 'c'), n(p, 'd')),
    n(p, 'precio_mundial'),
    p['politica'] === 'arancel' ? n(p, 'arancel') : 0,
    p['politica'] === 'cuota' ? n(p, 'cuota') : null,
  );
const externa = (p: Params) => {
  const [D, S] = mercado(p);
  return externalidad(D, S, String(p['tipo']), n(p, 'e'), n(p, 'intervencion'));
};
const frontera = (p: Params) =>
  new FPP(n(p, 'X'), n(p, 'Y'), n(p, 'k')).desplazar(n(p, 'recursos'), n(p, 'tecnologia_1'), n(p, 'tecnologia_2'));
const productores = (p: Params) =>
  [new Productor('Ganadero', n(p, 'horas'), n(p, 'g_carne'), n(p, 'g_papas')), new Productor('Campesino', n(p, 'horas'), n(p, 'c_carne'), n(p, 'c_papas'))] as const;
const trueque = (p: Params) => {
  const [g, c] = productores(p);
  return comerciar(g, c, n(p, 'fraccion_g'), n(p, 'fraccion_c'), 0.5, 0.5, n(p, 'carne_intercambiada'), n(p, 'precio'));
};

const FUNDAMENTOS: Reto[] = [
  // Frontera de posibilidades de producción (X = 1000, Y = 3000, k = 2; punto (600, 2200))
  {
    id: 'f-fpp-1',
    materia: 'fundamentos',
    sim: 'fpp',
    dificultad: 'Básico',
    titulo: 'Llegar a la frontera',
    enunciado: 'El punto (600, 2200) deja recursos ociosos. Sin cambiar el bien 1, produce la mayor cantidad posible del bien 2 para que el punto sea eficiente.',
    inicial: {},
    controles: ['y'],
    objetivos: [{ etiqueta: 'Bien 2 (y)', meta: 2400, decimales: 0, medir: (p) => n(p, 'y'), zona: { eje: 'y' } }],
    solucion: { y: 2400 },
    explicacion:
      'Sobre la frontera (x/X)² + (y/Y)² = 1, con x = 600 el máximo del bien 2 es 3000·√(1 − 0.36) = 2400. Cualquier punto por debajo es ineficiente y cualquier punto por encima es inalcanzable con los recursos actuales.',
    pista: 'Sube el bien 2 hasta tocar la curva justo encima de x = 600.',
  },
  {
    id: 'f-fpp-2',
    materia: 'fundamentos',
    sim: 'fpp',
    dificultad: 'Intermedio',
    titulo: 'Costo de oportunidad creciente',
    enunciado: 'En x = 600 cada computadora cuesta 2.25 automóviles. Elige la producción del bien 1 en la que el costo de oportunidad sea 4 automóviles.',
    inicial: {},
    controles: ['x'],
    objetivos: [{ etiqueta: 'Costo de oportunidad (−dy/dx)', meta: 4, decimales: 2, medir: (p) => frontera(p).costoOportunidad(n(p, 'x')) }],
    solucion: { x: 800 },
    explicacion:
      'Con k = 2 el costo de oportunidad es (Y/X)·r/√(1 − r²), con r = x/X, y vale 4 cuando r = 0.8, es decir x = 800. La frontera es cóncava porque los recursos no son igual de aptos para ambos bienes y cada computadora extra exige sacrificar más automóviles.',
    pista: 'El costo crece a medida que te especializas en el bien 1: muévete hacia la derecha.',
  },
  {
    id: 'f-fpp-3',
    materia: 'fundamentos',
    sim: 'fpp',
    dificultad: 'Avanzado',
    titulo: 'Crecer con tecnología',
    enunciado: 'El punto (600, 2880) hoy es inalcanzable. Mejora solo la tecnología del bien 2 para que la nueva frontera pase exactamente por ese punto.',
    inicial: { y: 2880 },
    controles: ['tecnologia_2'],
    objetivos: [
      { etiqueta: 'Bien 2 máximo con x = 600', meta: 2880, decimales: 0, medir: (p) => frontera(p).yDeX(n(p, 'x')), zona: { eje: 'y' } },
    ],
    solucion: { tecnologia_2: 1.2 },
    explicacion:
      'Una mejora tecnológica en el bien 2 rota la frontera sobre su eje: el máximo pasa de 3000 a 3000·t₂ y en x = 600 se producen 0.8·3000·t₂ unidades. Con t₂ = 1.2 se obtienen 2880, así que el punto que antes era inalcanzable ahora es eficiente.',
    pista: 'Solo el eje vertical se estira: busca el factor que lleva 2400 a 2880.',
  },
  // Ventaja comparativa (Mankiw cap. 3: ganadero 20/10 min, campesino 60/15 min, 8 horas)
  {
    id: 'f-ventaja-1',
    materia: 'fundamentos',
    sim: 'ventaja-comparativa',
    dificultad: 'Básico',
    titulo: 'Fijar el precio del trueque',
    enunciado: 'El ganadero entrega 5 de carne al campesino. Elige el precio (papas por carne) para que el campesino termine consumiendo 19.5 de papas.',
    inicial: {},
    controles: ['precio'],
    objetivos: [{ etiqueta: 'Papas del campesino', meta: 19.5, decimales: 1, medir: (p) => trueque(p).consumoB[1] }],
    solucion: { precio: 2.5 },
    explicacion:
      'El campesino produce 32 de papas y paga 5·precio por la carne, así que consume 32 − 5·2.5 = 19.5. Ese precio está entre los costos de oportunidad de ambos (2 y 4 papas por carne), por lo que los dos ganan frente a la autarquía.',
    pista: 'Cada décima que baja el precio le deja al campesino media papa más: baja el precio.',
  },
  {
    id: 'f-ventaja-2',
    materia: 'fundamentos',
    sim: 'ventaja-comparativa',
    dificultad: 'Intermedio',
    titulo: 'Un trato que conviene a ambos',
    enunciado: 'Diseña el intercambio para que el campesino consuma 6 de carne y 17.6 de papas (en autarquía tenía 4 y 16).',
    inicial: {},
    controles: ['carne_intercambiada', 'precio'],
    objetivos: [
      { etiqueta: 'Carne del campesino', meta: 6, decimales: 1, medir: (p) => trueque(p).consumoB[0] },
      { etiqueta: 'Papas del campesino', meta: 17.6, decimales: 1, medir: (p) => trueque(p).consumoB[1] },
    ],
    solucion: { carne_intercambiada: 6, precio: 2.4 },
    explicacion:
      'El campesino recibe 6 de carne y paga 6·2.4 = 14.4 de sus 32 papas, así que queda con 17.6; el ganadero conserva 12 de carne y sube a 26.4 de papas. Con un precio entre 2 y 4 papas por carne ambos consumen fuera de su propia frontera, que es la ganancia del comercio.',
    pista: 'Primero fija la carne en 6; luego ajusta el precio hasta que sobren 17.6 papas.',
  },
  {
    id: 'f-ventaja-3',
    materia: 'fundamentos',
    sim: 'ventaja-comparativa',
    dificultad: 'Avanzado',
    titulo: 'Estrechar el rango de precios',
    enunciado: 'Hoy el precio de la carne puede ir de 2 a 4 papas. Haz que el campesino sea más lento en papas para que el techo del rango baje a 3.',
    inicial: {},
    controles: ['c_papas'],
    objetivos: [{ etiqueta: 'Precio máximo del rango', meta: 3, decimales: 2, medir: (p) => rangoPrecio(...productores(p))[1] }],
    solucion: { c_papas: 20 },
    explicacion:
      'El costo de oportunidad de la carne para el campesino es 60/c_papas papas, y con c_papas = 20 baja de 4 a 3. El rango de precios que beneficia a ambos queda entre 2 y 3, más estrecho porque sus costos se parecen más.',
    pista: 'El techo es 60 minutos de carne entre los minutos por papa del campesino.',
  },
  // Oferta y demanda (Qd = 100 − 2P, Qs = 10 + 3P: P* = 18, Q* = 64)
  {
    id: 'f-od-1',
    materia: 'fundamentos',
    sim: 'oferta-demanda',
    dificultad: 'Básico',
    titulo: 'Subir el precio de equilibrio',
    enunciado: 'Hoy P* = 18. Cambia el intercepto de la demanda (a) para que el precio de equilibrio sea 22.',
    inicial: {},
    controles: ['a'],
    objetivos: [{ etiqueta: 'Precio de equilibrio P*', meta: 22, decimales: 2, medir: (p) => od(p).e0.p, zona: { eje: 'y' } }],
    solucion: { a: 120 },
    explicacion:
      'De a − 2P = 10 + 3P sale P* = (a − 10)/5, así que P* = 22 exige a = 120. Un aumento de la demanda sube a la vez el precio y la cantidad de equilibrio, que pasa a 76.',
    pista: 'Cada 5 unidades de a suben el precio en 1: aumenta la demanda.',
  },
  {
    id: 'f-od-2',
    materia: 'fundamentos',
    sim: 'oferta-demanda',
    dificultad: 'Intermedio',
    titulo: 'Equilibrio a la medida',
    enunciado: 'Mueve la demanda (a) y la oferta (c) para que el equilibrio quede en Q* = 72 y P* = 24.',
    inicial: {},
    controles: ['a', 'c'],
    objetivos: [
      { etiqueta: 'Cantidad Q*', meta: 72, decimales: 2, medir: (p) => od(p).e0.q, zona: { eje: 'x' } },
      { etiqueta: 'Precio P*', meta: 24, decimales: 2, medir: (p) => od(p).e0.p, zona: { eje: 'y' } },
    ],
    solucion: { a: 120, c: 0 },
    explicacion:
      'Para que (72, 24) esté en la demanda hace falta a = 72 + 2·24 = 120, y para que esté en la oferta c = 72 − 3·24 = 0. Más demanda sube precio y cantidad, y menos oferta sube el precio pero baja la cantidad: combinar ambos movimientos permite elegir el equilibrio.',
    pista: 'Despeja a de la demanda y c de la oferta usando el punto (72, 24).',
  },
  {
    id: 'f-od-3',
    materia: 'fundamentos',
    sim: 'oferta-demanda',
    dificultad: 'Avanzado',
    titulo: 'Crecer sin que suba el precio',
    enunciado: 'Sube el ingreso (bien normal) y mejora la tecnología para que la cantidad llegue a Q₁ = 82 con el precio en P₁ = 18.',
    inicial: { evento_d: 'ingreso_normal', cambio_d: 0, evento_s: 'tecnologia', cambio_s: 0 },
    controles: ['cambio_d', 'cambio_s'],
    objetivos: [
      { etiqueta: 'Cantidad Q₁', meta: 82, decimales: 2, medir: (p) => od(p).e1.q, zona: { eje: 'x' } },
      { etiqueta: 'Precio P₁', meta: 18, decimales: 2, medir: (p) => od(p).e1.p, zona: { eje: 'y' } },
    ],
    solucion: { cambio_d: 18, cambio_s: 18 },
    explicacion:
      'Si ambas curvas se desplazan 18 unidades a la derecha, P₁ = (100 + Δa − 10 − Δc)/5 sigue en 18 y la cantidad sube a 64 + 18 = 82. Cuando oferta y demanda crecen a la vez la cantidad sube con seguridad, pero el precio depende de cuál se desplaza más.',
    pista: 'El precio no cambia si los dos desplazamientos son iguales: muévelos juntos.',
  },
  // Elasticidades (Qd = 14 − 2P, P = 3)
  {
    id: 'f-elasticidad-1',
    materia: 'fundamentos',
    sim: 'elasticidades',
    dificultad: 'Básico',
    titulo: 'Elasticidad unitaria',
    enunciado: 'En P = 3 la demanda es inelástica (|ε| = 0.75). Elige el precio en el que la elasticidad precio es exactamente 1.',
    inicial: {},
    controles: ['precio'],
    objetivos: [{ etiqueta: '|ε| en P', meta: 1, decimales: 3, medir: (p) => elasticidadDemanda(demandaLineal(p), n(p, 'precio')) }],
    solucion: { precio: 3.5 },
    explicacion:
      'En una demanda lineal |ε| = b·P/Q = 2P/(14 − 2P), que vale 1 en el punto medio P = a/(2b) = 3.5. Arriba de ese precio la demanda es elástica y abajo es inelástica, aunque la pendiente sea la misma en toda la recta.',
    pista: 'La elasticidad unitaria está en el punto medio de la recta de demanda.',
  },
  {
    id: 'f-elasticidad-2',
    materia: 'fundamentos',
    sim: 'elasticidades',
    dificultad: 'Intermedio',
    titulo: 'Subir el precio y perder ingreso',
    enunciado: 'Con P = 3 el ingreso total es 24. Sube el precio, entrando al tramo elástico, hasta que el ingreso total caiga a 20.',
    inicial: {},
    controles: ['precio'],
    objetivos: [{ etiqueta: 'Ingreso total P·Q', meta: 20, decimales: 2, medir: (p) => ingresoTotal(demandaLineal(p), n(p, 'precio')) }],
    solucion: { precio: 5 },
    explicacion:
      'El ingreso total es P·(14 − 2P), que alcanza su máximo de 24.5 en P = 3.5 y vale 20 en P = 5. En el tramo elástico la cantidad cae más que proporcionalmente al subir el precio, así que el ingreso baja.',
    pista: 'Pasa de 3.5 hacia arriba: el ingreso primero sube y luego cae.',
  },
  {
    id: 'f-elasticidad-3',
    materia: 'fundamentos',
    sim: 'elasticidades',
    dificultad: 'Avanzado',
    titulo: 'Diseñar la demanda',
    enunciado: 'Elige a y b para que el ingreso total máximo sea 50 y se alcance en P = 5.',
    inicial: {},
    controles: ['a', 'b'],
    objetivos: [
      { etiqueta: 'Precio que maximiza el ingreso', meta: 5, decimales: 2, medir: (p) => precioIngresoMaximo(demandaLineal(p)) ?? Number.NaN },
      {
        etiqueta: 'Ingreso total máximo',
        meta: 50,
        decimales: 2,
        medir: (p) => {
          const D = demandaLineal(p);
          return ingresoTotal(D, precioIngresoMaximo(D) ?? Number.NaN);
        },
      },
    ],
    solucion: { a: 20, b: 2 },
    explicacion:
      'El ingreso máximo está en P = a/(2b) y vale a²/(4b), así que a = 10b y 25b = 50 dan b = 2 y a = 20. En ese punto la elasticidad es unitaria, y ahí una empresa que maximiza ingresos fijaría su precio.',
    pista: 'Primero haz a = 10·b para fijar el precio en 5; luego escala ambos.',
  },
  // Excedentes (P* = 18, Q* = 64)
  {
    id: 'f-excedentes-1',
    materia: 'fundamentos',
    sim: 'excedentes',
    dificultad: 'Básico',
    titulo: 'Más excedente del consumidor',
    enunciado: 'Hoy el excedente del consumidor es 1024. Aumenta la demanda (a) hasta que sea 1225.',
    inicial: {},
    controles: ['a'],
    objetivos: [{ etiqueta: 'Excedente del consumidor', meta: 1225, decimales: 1, medir: (p) => excedentes(p).ec }],
    solucion: { a: 110 },
    explicacion:
      'El excedente del consumidor es el triángulo Q*²/(2b), y con a = 110 la cantidad de equilibrio sube a 70, lo que da 70²/4 = 1225. Más disposición a pagar amplía el triángulo bajo la demanda y sobre el precio.',
    pista: 'El excedente crece con el cuadrado de Q*: necesitas Q* = 70.',
  },
  {
    id: 'f-excedentes-2',
    materia: 'fundamentos',
    sim: 'excedentes',
    dificultad: 'Intermedio',
    titulo: 'Excedente total con mejor tecnología',
    enunciado: 'El excedente total es 1690. Desplaza la oferta (c) para que llegue a 1860.',
    inicial: {},
    controles: ['c'],
    objetivos: [{ etiqueta: 'Excedente total', meta: 1860, decimales: 1, medir: (p) => excedentes(p).total }],
    solucion: { c: 20 },
    explicacion:
      'Con c = 20 el equilibrio pasa a P* = 16 y Q* = 68: el excedente del consumidor sube a 1156 y el del productor a 704, que suman 1860. Una oferta más amplia baja el precio y el beneficio de los compradores crece más de lo que cambia el de los vendedores.',
    pista: 'Más oferta a cada precio aumenta el bienestar: sube c.',
  },
  {
    id: 'f-excedentes-3',
    materia: 'fundamentos',
    sim: 'excedentes',
    dificultad: 'Avanzado',
    titulo: 'Cuatro compradores',
    enunciado: 'En el mercado escalonado de compradores (disposiciones 100, 80, 70 y 50) elige el precio para que su excedente total sea exactamente 100.',
    inicial: { modo: 'compradores' },
    controles: ['precio_escalonado'],
    objetivos: [{ etiqueta: 'Excedente de los compradores', meta: 100, decimales: 1, medir: (p) => excedenteCompradores(COMPRADORES, n(p, 'precio_escalonado')) }],
    solucion: { precio_escalonado: 50 },
    explicacion:
      'Con P = 50 compran los cuatro y el excedente es 50 + 30 + 20 + 0 = 100, porque el último comprador paga justo su disposición. Cada comprador gana la diferencia entre lo que está dispuesto a pagar y el precio, y por eso la demanda escalonada mide el bienestar como suma de escalones.',
    pista: 'Fíjate en el precio en el que el cuarto comprador apenas entra al mercado.',
  },
  // Controles de precios (P* = 18)
  {
    id: 'f-controles-1',
    materia: 'fundamentos',
    sim: 'controles-precios',
    dificultad: 'Básico',
    titulo: 'Reducir la escasez',
    enunciado: 'Un precio máximo de 12 crea una escasez de 30 unidades. Ajusta el precio máximo para que la escasez sea 20.',
    inicial: {},
    controles: ['precio_control'],
    objetivos: [{ etiqueta: 'Escasez Qd − Qs', meta: 20, decimales: 1, medir: (p) => control(p).faltante }],
    solucion: { precio_control: 14 },
    explicacion:
      'Con un techo P̄ la escasez es (100 − 2P̄) − (10 + 3P̄) = 90 − 5P̄, que vale 20 en P̄ = 14. Cuanto más se acerca el techo al precio de equilibrio, menor es la brecha entre lo que se quiere comprar y lo que se ofrece.',
    pista: 'La escasez baja 5 unidades por cada peso que sube el techo.',
  },
  {
    id: 'f-controles-2',
    materia: 'fundamentos',
    sim: 'controles-precios',
    dificultad: 'Intermedio',
    titulo: 'Medir la pérdida irrecuperable',
    enunciado: 'Elige el precio máximo para que la pérdida irrecuperable de eficiencia sea 33.75.',
    inicial: {},
    controles: ['precio_control'],
    objetivos: [{ etiqueta: 'Pérdida irrecuperable', meta: 33.75, decimales: 2, medir: (p) => control(p).ppm }],
    solucion: { precio_control: 15 },
    explicacion:
      'Si el techo queda u pesos debajo de 18, se transan 3u unidades menos y la cuña entre demanda y oferta es 2.5u, así que la pérdida es 3.75u², igual a 33.75 con u = 3. La pérdida crece con el cuadrado de la distancia al equilibrio, por eso los controles severos son mucho más costosos.',
    pista: 'La pérdida de un techo en 12 es 135: acércalo al equilibrio.',
  },
  {
    id: 'f-controles-3',
    materia: 'fundamentos',
    sim: 'controles-precios',
    dificultad: 'Avanzado',
    titulo: 'Salario mínimo y desempleo',
    enunciado: 'Con un salario mínimo de 24 hay un desempleo de 30. Cambia la pendiente de la oferta de trabajo (d) para que el desempleo sea 18.',
    inicial: { mercado: 'laboral', tipo: 'minimo', precio_control: 24 },
    controles: ['d'],
    objetivos: [{ etiqueta: 'Desempleo (exceso de oferta)', meta: 18, decimales: 1, medir: (p) => control(p).faltante }],
    solucion: { d: 2.5 },
    explicacion:
      'Con el piso en 24 el desempleo es (10 + 24d) − 52 = 24d − 42, que vale 18 con d = 2.5. Una oferta de trabajo menos sensible al salario reduce el exceso de oferta que crea el mínimo, aunque el empleo sigue limitado por la demanda.',
    pista: 'El desempleo sube 24 por cada punto de d: baja la pendiente.',
  },
  // Impuestos (t = 5 a los vendedores)
  {
    id: 'f-impuestos-1',
    materia: 'fundamentos',
    sim: 'impuestos',
    dificultad: 'Básico',
    titulo: 'Impuesto y cantidad',
    enunciado: 'Con t = 5 se transan 58 unidades. Elige el impuesto que reduce la cantidad a 52.',
    inicial: {},
    controles: ['t'],
    objetivos: [{ etiqueta: 'Cantidad con impuesto', meta: 52, decimales: 2, medir: (p) => impuesto(p).q, zona: { eje: 'x' } }],
    solucion: { t: 10 },
    explicacion:
      'La cuña reduce la cantidad en b·d/(b + d) = 1.2 unidades por peso de impuesto, así que Q = 64 − 1.2t y Q = 52 exige t = 10. El impuesto separa el precio que pagan los compradores del que reciben los vendedores y achica el mercado.',
    pista: 'Cada peso de impuesto quita 1.2 unidades: duplica el impuesto.',
  },
  {
    id: 'f-impuestos-2',
    materia: 'fundamentos',
    sim: 'impuestos',
    dificultad: 'Intermedio',
    titulo: 'Recaudar 800',
    enunciado: 'Hoy el Estado recauda 290. Sube el impuesto hasta recaudar 800 sin pasar el máximo de la curva de Laffer.',
    inicial: {},
    controles: ['t'],
    objetivos: [{ etiqueta: 'Recaudo t·Q', meta: 800, decimales: 1, medir: (p) => impuesto(p).recaudo }],
    solucion: { t: 20 },
    explicacion:
      'El recaudo es t·(64 − 1.2t), que vale 800 en t = 20 y en t = 33.3, y su máximo está en t = 26.7. A la izquierda del máximo un impuesto mayor recauda más, y a la derecha la base gravable se encoge tanto que el recaudo cae.',
    pista: 'Hay dos impuestos que recaudan 800: busca el menor.',
  },
  {
    id: 'f-impuestos-3',
    materia: 'fundamentos',
    sim: 'impuestos',
    dificultad: 'Avanzado',
    titulo: '¿Quién paga el impuesto?',
    enunciado: 'Hoy los compradores pagan el 60 % del impuesto. Cambia la pendiente de la demanda (b) para que paguen el 75 %.',
    inicial: {},
    controles: ['b'],
    objetivos: [
      { etiqueta: 'Carga de los compradores', meta: 0.75, decimales: 3, medir: (p) => impuesto(p).cargaCompradores ?? Number.NaN },
    ],
    solucion: { b: 1 },
    explicacion:
      'La parte que pagan los compradores es d/(b + d), que con d = 3 vale 0.75 si b = 1. El lado menos elástico del mercado carga con más impuesto, sin importar a quién se le cobre legalmente.',
    pista: 'Una demanda más inelástica (b menor) hace que el comprador pague más.',
  },
  // Comercio internacional (autarquía P = 18; precio mundial 12)
  {
    id: 'f-comercio-1',
    materia: 'fundamentos',
    sim: 'comercio-internacional',
    dificultad: 'Básico',
    titulo: 'Menos importaciones',
    enunciado: 'Con un precio mundial de 12 el país importa 30 unidades. Elige el precio mundial con el que importa 10.',
    inicial: {},
    controles: ['precio_mundial'],
    objetivos: [{ etiqueta: 'Importaciones', meta: 10, decimales: 1, medir: (p) => comercioDe(p).importaciones }],
    solucion: { precio_mundial: 16 },
    explicacion:
      'Las importaciones son Qd − Qs = (100 − 2Pw) − (10 + 3Pw) = 90 − 5Pw, que valen 10 con Pw = 16. Cuanto más se acerca el precio mundial al de autarquía (18), menos gana el país con el comercio.',
    pista: 'Las importaciones bajan 5 por cada peso que sube el precio mundial.',
  },
  {
    id: 'f-comercio-2',
    materia: 'fundamentos',
    sim: 'comercio-internacional',
    dificultad: 'Intermedio',
    titulo: 'El costo de un arancel',
    enunciado: 'Con un arancel la pérdida irrecuperable es 22.5. Elige el arancel que la lleva a 40.',
    inicial: { politica: 'arancel' },
    controles: ['arancel'],
    objetivos: [{ etiqueta: 'Pérdida irrecuperable', meta: 40, decimales: 2, medir: (p) => comercioDe(p).ppm }],
    solucion: { arancel: 4 },
    explicacion:
      'Un arancel τ sube la producción en 3τ y baja el consumo en 2τ, y la pérdida son dos triángulos que suman 2.5τ², igual a 40 con τ = 4. La pérdida crece con el cuadrado del arancel, mientras que el recaudo primero sube y luego cae.',
    pista: 'La pérdida va con el cuadrado del arancel: busca τ² = 16.',
  },
  {
    id: 'f-comercio-3',
    materia: 'fundamentos',
    sim: 'comercio-internacional',
    dificultad: 'Avanzado',
    titulo: 'Cuota equivalente',
    enunciado: 'Elige la cuota de importación que lleva el precio interno a 16, el mismo que daría un arancel de 4.',
    inicial: { politica: 'cuota' },
    controles: ['cuota'],
    objetivos: [{ etiqueta: 'Precio interno', meta: 16, decimales: 2, medir: (p) => comercioDe(p).precioInterno, zona: { eje: 'y' } }],
    solucion: { cuota: 10 },
    explicacion:
      'Con la cuota el precio interno sube hasta que Qd − Qs = cuota, es decir 90 − 5P = 10, así que P = 16. El efecto sobre precios y cantidades es el mismo del arancel de 4, pero los 40 que serían recaudo quedan como rentas para quien tiene las licencias.',
    pista: 'Una cuota más pequeña sube el precio interno: redúcela.',
  },
  // Externalidades (costo externo e = 10)
  {
    id: 'f-externalidades-1',
    materia: 'fundamentos',
    sim: 'externalidades',
    dificultad: 'Básico',
    titulo: 'Impuesto pigouviano',
    enunciado: 'El mercado produce 64 unidades, pero el óptimo social es 52. Elige el impuesto que lleva la producción al óptimo.',
    inicial: {},
    controles: ['intervencion'],
    objetivos: [{ etiqueta: 'Cantidad con intervención', meta: 52, decimales: 2, medir: (p) => externa(p).q, zona: { eje: 'x' } }],
    solucion: { intervencion: 10 },
    explicacion:
      'Un impuesto igual al costo externo (t = e = 10) hace que los vendedores enfrenten el costo social completo y la cantidad baja de 64 a 52. Así se internaliza la externalidad y desaparece la pérdida de bienestar del mercado sin regular.',
    pista: 'El impuesto correcto es igual al daño que causa cada unidad.',
  },
  {
    id: 'f-externalidades-2',
    materia: 'fundamentos',
    sim: 'externalidades',
    dificultad: 'Intermedio',
    titulo: 'Un daño mayor',
    enunciado: 'Si el costo externo por unidad crece, el óptimo social cae. Elige e para que la cantidad óptima sea 46.',
    inicial: {},
    controles: ['e'],
    objetivos: [{ etiqueta: 'Cantidad óptima', meta: 46, decimales: 2, medir: (p) => externa(p).qOptimo }],
    solucion: { e: 15 },
    explicacion:
      'El costo social sube la oferta e pesos, así que la cantidad óptima es 64 − 1.2e y vale 46 con e = 15. Cuanto mayor es el daño, más se aleja el mercado del óptimo y mayor es la pérdida si nadie interviene.',
    pista: 'Cada peso de daño baja el óptimo en 1.2 unidades.',
  },
  {
    id: 'f-externalidades-3',
    materia: 'fundamentos',
    sim: 'externalidades',
    dificultad: 'Avanzado',
    titulo: 'Subsidio a una externalidad positiva',
    enunciado: 'Con un beneficio externo de 15 por unidad (por ejemplo, educación) el mercado consume muy poco. Elige el subsidio que lleva la cantidad a 82.',
    inicial: { tipo: 'positiva', e: 15 },
    controles: ['intervencion'],
    objetivos: [{ etiqueta: 'Cantidad con intervención', meta: 82, decimales: 2, medir: (p) => externa(p).q, zona: { eje: 'x' } }],
    solucion: { intervencion: -15 },
    explicacion:
      'El valor social es la demanda más 15 pesos, y el óptimo 64 + 1.2·15 = 82 se alcanza con un subsidio de 15 (intervención = −15). Con un beneficio externo el mercado produce de menos y el subsidio pigouviano corrige el error tanto como el impuesto lo hace con un costo externo.',
    pista: 'Un subsidio es una intervención negativa del mismo tamaño que el beneficio externo.',
  },
];

/* ------------------------------------------------------------------ Macro 1 */

const keynes = (p: Params) => escKeynes(p as any).map(equilibrioKeynes);
const islm = (p: Params) => escISLM(p as any).map(equilibrioISLM);
const daoa = (p: Params) => {
  const [b, nuevo] = escDAOA(p as any);
  return trayectoria(b, nuevo);
};
const mf = (p: Params) => escMF(p as any).map(equilibrioMF);

const MACRO1: Reto[] = [
  // Modelo keynesiano (c₀ = 100, c₁ = 0.6, t = 0.25, I = 150, G = 200: Y₀ = 818.2)
  {
    id: 'm1-keynes-1',
    materia: 'macro1',
    sim: 'keynesiano',
    dificultad: 'Básico',
    titulo: 'Llegar a Y = 1000',
    enunciado: 'El multiplicador es 1/0.55 ≈ 1.82 y el producto inicial es 818.2. Elige el aumento del gasto ΔG para que el producto final sea 1000.',
    inicial: {},
    controles: ['dG'],
    objetivos: [{ etiqueta: 'Producto final Y₁', meta: 1000, decimales: 1, medir: (p) => keynes(p)[1].Y, zona: { eje: 'x' } }],
    solucion: { dG: 100 },
    explicacion:
      'El equilibrio es Y = A/(1 − c₁(1 − t)) = A/0.55, así que llegar a 1000 exige un gasto autónomo de 550, es decir ΔG = 100. Cada peso de gasto público se multiplica porque genera ingreso que a su vez se consume.',
    pista: 'Necesitas que el gasto autónomo suba de 450 a 550.',
  },
  {
    id: 'm1-keynes-2',
    materia: 'macro1',
    sim: 'keynesiano',
    dificultad: 'Intermedio',
    titulo: 'Un multiplicador de 2.5',
    enunciado: 'Con t = 0.25 el multiplicador es 1.82. Elige la propensión a consumir c₁ para que el multiplicador sea 2.5.',
    inicial: {},
    controles: ['c1'],
    objetivos: [{ etiqueta: 'Multiplicador', meta: 2.5, decimales: 3, medir: (p) => keynes(p)[0].multiplicador }],
    solucion: { c1: 0.8 },
    explicacion:
      'El multiplicador es 1/(1 − c₁(1 − t)), que vale 2.5 cuando c₁·0.75 = 0.6, es decir c₁ = 0.8. Si los hogares gastan una fracción mayor de cada peso adicional, cada ronda de gasto genera más ingreso.',
    pista: 'Busca que 1 − 0.75·c₁ sea 0.4.',
  },
  {
    id: 'm1-keynes-3',
    materia: 'macro1',
    sim: 'keynesiano',
    dificultad: 'Avanzado',
    titulo: 'Financiar el gasto con impuestos',
    enunciado: 'El gobierno sube el gasto en ΔG = 60. Elige el alza de impuestos ΔT₀ que deja el producto en su nivel inicial, 818.2.',
    inicial: { dG: 60 },
    controles: ['dT'],
    objetivos: [{ etiqueta: 'Producto final Y₁', meta: 4500 / 5.5, decimales: 1, medir: (p) => keynes(p)[1].Y, zona: { eje: 'x' } }],
    solucion: { dT: 100 },
    explicacion:
      'Un impuesto de suma fija reduce el gasto autónomo en c₁·ΔT₀, así que compensar ΔG = 60 exige 0.6·ΔT₀ = 60, es decir ΔT₀ = 100. El multiplicador de los impuestos es menor que el del gasto porque parte del impuesto sale del ahorro y no del consumo.',
    pista: 'Solo el 60 % del impuesto reduce el consumo: hace falta un impuesto mayor que el gasto.',
  },
  // IS-LM (Blanchard: ī = 5, Y₀ = 966.7)
  {
    id: 'm1-islm-1',
    materia: 'macro1',
    sim: 'is-lm',
    dificultad: 'Básico',
    titulo: 'Expansión fiscal',
    enunciado: 'Con la tasa fija en ī = 5 el producto es 966.7. Elige el aumento del gasto ΔG para que el producto final sea 1100.',
    inicial: {},
    controles: ['dG'],
    objetivos: [{ etiqueta: 'Producto final Y₁', meta: 1100, decimales: 1, medir: (p) => islm(p)[1].Y, zona: { eje: 'x' } }],
    solucion: { dG: 40 },
    explicacion:
      'Con la tasa fija la IS se desplaza sin que la inversión se reduzca, y el multiplicador es 1/(1 − c₁ − b₁) = 1/0.3. Por eso ΔY = ΔG/0.3 y subir 133.3 exige ΔG = 40.',
    pista: 'Cada peso de gasto sube el producto en 3.33 cuando la tasa no se mueve.',
  },
  {
    id: 'm1-islm-2',
    materia: 'macro1',
    sim: 'is-lm',
    dificultad: 'Intermedio',
    titulo: 'Mezcla de políticas',
    enunciado: 'El gasto sube ΔG = 50 y el producto llegaría a 1133.3. Elige cuánto sube el banco central la tasa (Δī) para que el producto quede en 1050.',
    inicial: {},
    controles: ['di'],
    objetivos: [{ etiqueta: 'Producto final Y₁', meta: 1050, decimales: 1, medir: (p) => islm(p)[1].Y, zona: { eje: 'x' } }],
    solucion: { di: 2.5 },
    explicacion:
      'Cada punto de tasa reduce la inversión en b₂ = 10 y el producto en 10/0.3 = 33.3, así que bajar 83.3 exige Δī = 2.5. Es una mezcla de política fiscal expansiva y monetaria contractiva que modera el auge.',
    pista: 'Sube la tasa: cada punto quita unas 33 unidades de producto.',
  },
  {
    id: 'm1-islm-3',
    materia: 'macro1',
    sim: 'is-lm',
    dificultad: 'Avanzado',
    titulo: 'Acomodar con la oferta de dinero',
    enunciado: 'Con la LM de oferta monetaria (M = 400) y ΔG = 50 la tasa sube y desplaza inversión. Elige ΔM para que el equilibrio final sea Y₁ = 1100 con i₁ = 6.',
    inicial: { modo: 'oferta' },
    controles: ['dM'],
    objetivos: [
      { etiqueta: 'Producto final Y₁', meta: 1100, decimales: 1, medir: (p) => islm(p)[1].Y, zona: { eje: 'x' } },
      { etiqueta: 'Tasa final i₁', meta: 6, decimales: 2, medir: (p) => islm(p)[1].i, zona: { eje: 'y' } },
    ],
    solucion: { dM: 30 },
    explicacion:
      'La IS con ΔG = 50 pasa por (1100, 6) y la LM M = 0.5Y − 20i exige M = 430 en ese punto, es decir ΔM = 30. Sin esa expansión monetaria la tasa subiría a 6.8 y el efecto expulsión dejaría el producto en 1072.7.',
    pista: 'Más dinero baja la tasa y deja que la inversión acompañe al gasto.',
  },
  // Demanda y oferta agregadas (Ȳₙ = 1000, M = 400: P₀ = 0.952)
  {
    id: 'm1-daoa-1',
    materia: 'macro1',
    sim: 'da-oa',
    dificultad: 'Básico',
    titulo: 'Neutralidad del dinero',
    enunciado: 'En el mediano plazo P₀ = 0.952 con M = 400. Elige el aumento de dinero ΔM que lleva el nivel de precios de mediano plazo a 1.429.',
    inicial: {},
    controles: ['dM'],
    objetivos: [{ etiqueta: 'Precio de mediano plazo P₂', meta: 600 / 420, decimales: 3, medir: (p) => daoa(p).final.P, zona: { eje: 'y' } }],
    solucion: { dM: 200 },
    explicacion:
      'En el mediano plazo Y vuelve a Ȳₙ y la tasa la fija la IS, así que M/P no cambia y P sube en la misma proporción que M: P₂ = 600/420 con ΔM = 200. El dinero es neutral a mediano plazo, aunque en el impacto sí mueva el producto.',
    pista: 'Los precios crecen en la misma proporción que el dinero: sube M un 50 %.',
  },
  {
    id: 'm1-daoa-2',
    materia: 'macro1',
    sim: 'da-oa',
    dificultad: 'Intermedio',
    titulo: 'Gasto público a mediano plazo',
    enunciado: 'Sin cambiar el dinero, elige ΔG para que la tasa de interés de mediano plazo pase de 4 a 6 %.',
    inicial: { dM: 0 },
    controles: ['dG'],
    objetivos: [{ etiqueta: 'Tasa de mediano plazo i₂', meta: 6, decimales: 2, medir: (p) => daoa(p).final.i }],
    solucion: { dG: 20 },
    explicacion:
      'En el mediano plazo el producto vuelve a Ȳₙ = 1000, así que la IS fija la tasa: i = (A − 0.3·Ȳₙ)/b₂, y ΔG = 20 la sube de 4 a 6. El gasto no cambia el producto a mediano plazo y desplaza por completo la inversión.',
    pista: 'Cada 10 de gasto suben la tasa de mediano plazo un punto.',
  },
  {
    id: 'm1-daoa-3',
    materia: 'macro1',
    sim: 'da-oa',
    dificultad: 'Avanzado',
    titulo: 'Crecer con precios estables',
    enunciado: 'El producto natural crece en ΔȲₙ = 100 y, sin más dinero, el nivel de precios de mediano plazo caería a 0.755. Elige ΔM para que P₂ sea 1.',
    inicial: { dM: 0, dYn: 100 },
    controles: ['dM'],
    objetivos: [{ etiqueta: 'Precio de mediano plazo P₂', meta: 1, decimales: 3, medir: (p) => daoa(p).final.P, zona: { eje: 'y' } }],
    solucion: { dM: 130 },
    explicacion:
      'Con Y = Ȳₙ = 1100 la IS fija i = (340 − 0.3·1100)/10 = 1 y la demanda de dinero real es 0.5·1100 − 20·1 = 530, así que P₂ = 1 exige M = 530, es decir ΔM = 130. Si la oferta de dinero no acompaña el crecimiento del producto potencial, el ajuste de mediano plazo llega por deflación.',
    pista: 'Los saldos reales que pide la economía suben a 530: aumenta M hasta igualarlos.',
  },
  // Mundell-Fleming (Blanchard cap. 20: Y₀ = 1000, i = i* = 5, e = 1)
  {
    id: 'm1-mf-1',
    materia: 'macro1',
    sim: 'mundell-fleming',
    dificultad: 'Básico',
    titulo: 'Devaluar para crecer',
    enunciado: 'Con tipo de cambio fijo y Y = 1000, elige la devaluación de ē (en %) que lleva el producto a 1025.',
    inicial: { regimen: 'fijo', dG: 0 },
    controles: ['debar'],
    objetivos: [{ etiqueta: 'Producto final Y₁', meta: 1025, decimales: 1, medir: (p) => mf(p)[1].Y, zona: { eje: 'x' } }],
    solucion: { debar: 20 },
    explicacion:
      'Con i = i* la IS abierta da Y = (A + φ·ē − b₂·i*)/s, así que subir Y en 25 exige φ·Δē = 25·0.4 = 10 y ē debe pasar de 1 a 1.2. La devaluación abarata las exportaciones y mejora las exportaciones netas a cada nivel de producto.',
    pista: 'Cada 1 % de devaluación suma 1.25 al producto: sube ē.',
  },
  {
    id: 'm1-mf-2',
    materia: 'macro1',
    sim: 'mundell-fleming',
    dificultad: 'Intermedio',
    titulo: 'Compensar la tasa externa',
    enunciado: 'Con tipo de cambio fijo la tasa externa sube 2 puntos y el producto cae a 950. Elige ΔG para devolverlo a 1000.',
    inicial: { regimen: 'fijo', dG: 0, dis: 2 },
    controles: ['dG'],
    objetivos: [{ etiqueta: 'Producto final Y₁', meta: 1000, decimales: 1, medir: (p) => mf(p)[1].Y, zona: { eje: 'x' } }],
    solucion: { dG: 20 },
    explicacion:
      'Con ē fijo la tasa interna tiene que seguir a i*, y 2 puntos más reducen la inversión en 20 y el producto en 20/0.4 = 50. Como la política monetaria está atada al tipo de cambio, la fiscal es la única que puede compensar y necesita ΔG = 20.',
    pista: 'Tienes que reponer las 20 unidades de inversión que se pierden.',
  },
  {
    id: 'm1-mf-3',
    materia: 'macro1',
    sim: 'mundell-fleming',
    dificultad: 'Avanzado',
    titulo: 'Política monetaria con tipo flexible',
    enunciado: 'Con tipo de cambio flexible, elige la expansión monetaria ΔM que lleva el equilibrio de (1000, 5 %) a Y₁ = 1047.5 con i₁ = 3.19 %.',
    inicial: { dG: 0 },
    controles: ['dM'],
    objetivos: [
      { etiqueta: 'Producto final Y₁', meta: 1047.5, decimales: 1, medir: (p) => mf(p)[1].Y, zona: { eje: 'x' } },
      { etiqueta: 'Tasa final i₁', meta: 3.19, decimales: 2, medir: (p) => mf(p)[1].i, zona: { eje: 'y' } },
    ],
    solucion: { dM: 60 },
    explicacion:
      'Con ΔM = 60 la tasa baja a 3.19 %, la paridad deprecia la moneda de 1 a 1.018 y suben a la vez la inversión (de 150 a 172.9) y la competitividad de las exportaciones. Con tipo flexible la política monetaria actúa por dos canales, mientras que con tipo fijo no puede usarse.',
    pista: 'Más dinero baja i y deprecia e: los dos efectos empujan el producto.',
  },
];

export const RETOS_FUNDAMENTOS_MACRO1: Reto[] = [...FUNDAMENTOS, ...MACRO1];
