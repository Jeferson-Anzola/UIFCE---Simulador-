/** Cambios aceptados de la revisión de Gemini (2026-11, ver REVISION_GEMINI.md). */
import { describe, expect, it } from 'vitest';
import { JUEGOS, nashContinuos, nashPuros, respuestaA } from './modelos/juegos';
import { CARGADORES_MICRO3 } from './registro';

const calcular = async (id: string, p: Record<string, number | string> = {}) => {
  const def = await CARGADORES_MICRO3[id]();
  return def.calcular({ ...def.defecto, ...p });
};
const traza = (r: { fig: { data: any[] } }, prefijo: string) => r.fig.data.find((t) => String(t.name).startsWith(prefijo));

describe('Micro 3 · revisión de Gemini', () => {
  it('juegos: con a₁₂ = a₂₂ (A indiferente si B delata) hay un continuo de equilibrios en q = 0', () => {
    const g = { ...JUEGOS['dilema'].pagos, a12: 1, a22: 1 };
    // B delata (B₂) frente a cualquier p en el dilema: todo el segmento q = 0, p ∈ [0, 1] es Nash.
    expect(nashContinuos(g)).toEqual([{ q: [0, 0], p: [0, 1] }]);
    expect(nashPuros(g)).toEqual([[0, 1], [1, 1]]);
    // La mejor respuesta de A dibuja el segmento vertical en q = 0.
    const rA = respuestaA(g);
    expect(rA.q.slice(0, 2)).toEqual([0, 0]);
    expect([...rA.p.slice(0, 2)].sort()).toEqual([0, 1]);
  });

  it('juegos: el dilema estándar no tiene continuos (solo Nash puro en (A₂, B₂))', async () => {
    expect(nashContinuos(JUEGOS['dilema'].pagos)).toEqual([]);
    const r = await calcular('juegos');
    expect(traza(r, 'Continuo de equilibrios')).toBeUndefined();
  });

  it('limones: la DAP empieza en θ_min y las bandas parten las calidades en p* (k = 1.5, θ ∈ [20, 100] ⇒ p* = 60)', async () => {
    const r = await calcular('informacion', { enfoque: 'seleccion' });
    const dap = traza(r, 'Disposición a pagar')!;
    expect(dap.x[0]).toBe(20);
    expect(dap.y[0]).toBeCloseTo(1.5 * 20, 10);
    const vende = traza(r, 'Calidades que se venden')!;
    const salen = traza(r, 'Calidades que salen')!;
    expect(Math.max(...vende.x)).toBeCloseTo(60, 10);
    expect(Math.min(...salen.x)).toBeCloseTo(60, 10);
    expect(traza(r, 'Disposición con información completa')).toBeUndefined();
  });
});
