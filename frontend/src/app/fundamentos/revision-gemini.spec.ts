/**
 * Cambios aceptados de la revisión de Gemini (2026-11, ver REVISION_GEMINI.md): cada prueba verifica la
 * propiedad económica que justifica el cambio, no solo que la traza exista.
 */
import { describe, expect, it } from 'vitest';
import { Simulacion } from '../core/tipos';
import { CARGADORES_FUNDAMENTOS } from './registro';

const calcular = async (id: string, p: Record<string, number | string>): Promise<Simulacion> => {
  const def = await CARGADORES_FUNDAMENTOS[id]();
  return def.calcular({ ...def.defecto, ...p });
};
const traza = (r: Simulacion, prefijo: string) => r.fig.data.find((t) => String(t.name).startsWith(prefijo));
const fila = (r: Simulacion, nombre: string): number => {
  const filas = JSON.stringify(r.panel).match(new RegExp(`\\["${nombre.replace(/[()·]/g, '.')}[^"]*",(-?[\\d.e+-]+)\\]`));
  if (!filas) throw new Error(`No está la fila «${nombre}»`);
  return Number(filas[1]);
};

describe('Fundamentos · revisión de Gemini', () => {
  it('controles de b y d: se nombran como respuesta de la cantidad, no como pendiente dibujada', async () => {
    const def = await CARGADORES_FUNDAMENTOS['oferta-demanda']();
    const etiquetas = def.grupos.flatMap((g) => g.controles).map((c) => c.etiqueta);
    expect(etiquetas.some((e) => e.startsWith('Pendiente'))).toBe(false);
    expect(etiquetas).toContain('Respuesta b de Qd al precio (b = 0: perfectamente inelástica)');
  });

  it('elasticidades: efecto precio + efecto cantidad = ΔIT (subida y bajada de precio)', async () => {
    for (const delta of [1, -1.5]) {
      const r = await calcular('elasticidades', { a: 14, b: 2, precio: 3, delta });
      const dIT = fila(r, 'Cambio en el ingreso total');
      expect(fila(r, 'Efecto precio') + fila(r, 'Efecto cantidad')).toBeCloseTo(dIT, 10);
      expect(traza(r, 'Efecto precio')).toBeDefined();
      expect(traza(r, 'Efecto cantidad')).toBeDefined();
    }
    // a = 14, b = 2, P: 3 → 4: Q: 8 → 6; efecto precio = +6, efecto cantidad = −6 (elasticidad arco unitaria).
    const r = await calcular('elasticidades', { a: 14, b: 2, precio: 3, delta: 1 });
    expect(fila(r, 'Efecto precio')).toBeCloseTo(6, 10);
    expect(fila(r, 'Efecto cantidad')).toBeCloseTo(-6, 10);
  });

  it('impuestos: la línea de P* reparte el recaudo según la incidencia (60 % / 40 % con b = 2, d = 3)', async () => {
    const r = await calcular('impuestos', { t: 10 });
    const t = traza(r, 'Recaudo: compradores')!;
    expect(t).toBeDefined();
    // Qt = 64 − 1.2·10 = 52; compradores pagan 6 por unidad y vendedores 4.
    expect(t.y[0]).toBeCloseTo(18, 10);
    expect(t.name).toContain('312');
    expect(t.name).toContain('208');
  });

  it('impuestos: con subsidio se dibuja el gasto (Pv − Pc)·Q', async () => {
    const r = await calcular('impuestos', { t: -5 });
    const g = traza(r, 'Gasto en subsidio')!;
    expect(g).toBeDefined();
    // Qs = 64 + 1.2·5 = 70; gasto = 5·70 = 350.
    expect(g.name).toContain('350');
    expect(Math.max(...g.y) - Math.min(...g.y)).toBeCloseTo(5, 10);
  });

  it('controles: el tramo de escasez mide Qd − Qs al precio máximo', async () => {
    const r = await calcular('controles-precios', { tipo: 'maximo', precio_control: 12 });
    const e = traza(r, 'Escasez')!;
    // Qd(12) = 76, Qs(12) = 46.
    expect(e.x).toEqual([46, 76]);
    expect(e.name).toContain('30');
  });

  it('externalidades: el segmento vertical en Q* mide exactamente e', async () => {
    const r = await calcular('externalidades', { tipo: 'negativa', e: 10 });
    const s = traza(r, 'Costo externo por unidad')!;
    expect(s.y[1] - s.y[0]).toBeCloseTo(10, 10);
    expect(s.x[0]).toBeCloseTo(fila(r, 'Cantidad óptima'), 10);
  });
});
