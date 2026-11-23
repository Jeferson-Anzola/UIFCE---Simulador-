/** Cambios aceptados de la revisión de Gemini (2026-11, ver REVISION_GEMINI.md). */
import { describe, expect, it } from 'vitest';
import { equilibrioAutarquia } from './simuladores/equilibrio-produccion';
import { CARGADORES_MICRO2 } from './registro';

const calcular = async (id: string, p: Record<string, number | string> = {}) => {
  const def = await CARGADORES_MICRO2[id]();
  return def.calcular({ ...def.defecto, ...p });
};
const traza = (r: { fig: { data: any[] } }, prefijo: string) => r.fig.data.find((t) => String(t.name).startsWith(prefijo));

describe('Micro 2 · revisión de Gemini', () => {
  it('equilibrio con producción: coincide con la solución cerrada L₁ = 0.7L, K₁ = 0.3K (no hay desvío de malla)', () => {
    const q = equilibrioAutarquia({ L: 100, K: 100, alfa: 0.7, beta: 0.3 }, 0.5);
    const exacto = Math.pow(70, 0.7) * Math.pow(30, 0.3);
    expect(q.L1).toBeCloseTo(70, 5);
    expect(q.K1).toBeCloseTo(30, 5);
    expect(q.y1).toBeCloseTo(exacto, 5);
    expect(exacto).toBeCloseTo(54.288, 3);
  });

  it('incertidumbre: brecha de Jensen u(VE) − UE (√62.5 − 7.5 con r = 0.5, w = 25 y 100)', async () => {
    const r = await calcular('incertidumbre', { enfoque: 'riesgo', r: 0.5, w1: 25, w2: 100, pi: 0.5 });
    const b = traza(r, 'Brecha de Jensen')!;
    expect(b).toBeDefined();
    expect(b.y[1]).toBeCloseTo(Math.sqrt(62.5), 10);
    expect(b.y[0]).toBeCloseTo(7.5, 10);
  });

  it('Slutsky: con la compensación de Slutsky se marca la cesta de Hicks, con menor efecto sustitución', async () => {
    const r = await calcular('slutsky', { metodo: 'slutsky' });
    const h = traza(r, 'Bᴴ')!;
    const b = r.fig.data.find((t) => t.name === 'B · cesta compensada' && t.mode?.includes('markers'));
    expect(h).toBeDefined();
    // Cobb-Douglas: Slutsky sobrecompensa, así que B tiene más x₁ que Bᴴ tras una subida de p₁.
    const r0 = await calcular('slutsky', { metodo: 'slutsky' });
    expect(JSON.stringify(r0.panel)).toContain('Slutsky sobrecompensa');
    if (b) expect(b.x[0]).toBeGreaterThan(h.x[0]);
  });

  it('empresa competitiva: proyecciones de (x*, y*) a los ejes', async () => {
    const r = await calcular('produccion', { enfoque: 'beneficio', alfa: 0.5, pp: 20, w: 5 });
    const guia = r.fig.data.find((t) => t.showlegend === false && t.line?.dash === 'dot' && t.x?.length === 5);
    expect(guia.x[0]).toBeCloseTo(4, 10);
    expect(guia.y[1]).toBeCloseTo(2, 10);
  });
});
