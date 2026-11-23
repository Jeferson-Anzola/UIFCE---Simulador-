/** Cambios aceptados de la revisión de Gemini (2026-11, ver REVISION_GEMINI.md). */
import { describe, expect, it } from 'vitest';
import { CostoCubico } from './modelos/costos';
import { CARGADORES_MICRO1 } from './registro';

const calcular = async (id: string, p: Record<string, number | string> = {}) => {
  const def = await CARGADORES_MICRO1[id]();
  return def.calcular({ ...def.defecto, ...p });
};

describe('Micro 1 · revisión de Gemini', () => {
  it('preferencias: la curva dorada lleva su nivel U(x0, y0) (Cobb-Douglas, (4, 5) ⇒ U = 20)', async () => {
    const r = await calcular('preferencias');
    expect(r.fig.data.some((t) => t.name === 'Curva que pasa por la canasta: U(x0, y0) = 20')).toBe(true);
  });

  it('competencia: puntos de cierre y nivelación en los mínimos del CVMe y del CMe, donde los corta el CMg', async () => {
    const r = await calcular('competencia-perfecta');
    const k = new CostoCubico(20, 10, 2, 0.5);
    const cierre = r.fig.data.find((t) => t.name === 'Punto de cierre (mín CVMe)')!;
    const nivel = r.fig.data.find((t) => t.name === 'Punto de nivelación (mín CMe)')!;
    expect(cierre.x[0]).toBeCloseTo(k.q_min_cvme(), 10);
    expect(cierre.y[0]).toBeCloseTo(k.CMg(k.q_min_cvme()), 8);
    expect(nivel.y[0]).toBeCloseTo(k.CMg(k.q_min_cme()), 8);
    const oferta = r.fig.data.find((t) => String(t.name).startsWith('Oferta de la empresa'))!;
    expect(Math.min(...oferta.y)).toBeCloseTo(k.precio_cierre(), 8);
  });
});
