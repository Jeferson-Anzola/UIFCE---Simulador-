/** Cambios aceptados de la revisión de Gemini (2026-11, ver REVISION_GEMINI.md). */
import { describe, expect, it } from 'vitest';
import { MACRO1 } from '../core/catalogo';
import { CARGADORES_MACRO1 } from './registro';

describe('Macro 1 · revisión de Gemini', () => {
  it('DA–OA: en la trampa deflacionaria la gráfica sigue mostrando la DA, su tope con i = 0 y Ȳₙ', async () => {
    const d = await CARGADORES_MACRO1['da-oa']();
    const r = d.calcular({ ...d.defecto, Yn: 5000 });
    const json = JSON.stringify(r.panel);
    expect(json).toContain('deflación');
    const nombres = r.fig.data.map((t) => String(t.name));
    expect(nombres).toContain('DA inicial');
    expect(nombres).toContain('Ȳₙ (OA de largo plazo)');
    const tope = r.fig.data.find((t) => String(t.name).startsWith('Tope de la DA con i = 0'))!;
    // La DA nunca alcanza Ȳₙ: su tope (i = 0) queda a la izquierda de la OA de largo plazo.
    expect(tope.x[0]).toBeLessThan(5000);
    const da = r.fig.data.find((t) => t.name === 'DA inicial')!;
    expect(Math.max(...da.x)).toBeLessThanOrEqual(tope.x[0] + 1e-6);
    for (const t of r.fig.data) for (const v of [...t.x, ...t.y]) expect(Number.isFinite(v)).toBe(true);
  });

  it('cruz keynesiana: el encabezado define el gasto autónomo A', () => {
    const k = MACRO1.simuladores.find((s) => s.id === 'keynesiano')!;
    expect(k.ecuacion).toContain(String.raw`A = c_0 - c_1 T_0 + \bar{I} + G`);
  });
});
