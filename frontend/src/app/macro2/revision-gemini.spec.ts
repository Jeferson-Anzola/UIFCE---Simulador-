/** Cambios aceptados de la revisión de Gemini (2026-11, ver REVISION_GEMINI.md). */
import { describe, expect, it } from 'vitest';
import * as DAOA from './simuladores/da-oa';
import { CARGADORES_MACRO2 } from './registro';

describe('Macro 2 · revisión de Gemini', () => {
  it('DA–OA: un choque único de demanda no deja inflación permanente (E₂ en u*, π = 0) aunque P quede 20 % más alto', async () => {
    const d = await CARGADORES_MACRO2['da-oa']();
    const r = d.calcular(d.defecto);
    const panel = JSON.stringify(r.panel);
    // Fila de inflación por período: E₀ = 0, E₁ = 10 %, E₂ = 0; la variación acumulada de P sí es 20 %.
    expect(panel).toMatch(/"Inflación del período π \(%\)",0,10(\.0+\d*)?,0\]/);
    expect(panel).toMatch(/"Variación de P desde E₀ \(%\)",0,10(\.0+\d*)?,20(\.0+\d*)?\]/);
    const s = DAOA.pasos(d.defecto as never);
    const pis = DAOA.inflacionCamino(s.enlace, s.camino);
    expect(pis[0]).toBeCloseTo(10, 8);
    // La inflación de la autocorrección es positiva y decreciente hasta apagarse.
    for (let t = 1; t < pis.length; t++) expect(pis[t]).toBeLessThan(pis[t - 1] + 1e-9);
    expect(pis[pis.length - 1]).toBeLessThan(0.05);
    const e2 = r.fig.data.find((t) => t.name === 'Largo plazo' && t.xaxis === 'x2')!;
    expect(e2.x[0]).toBeCloseTo(5, 6);
    expect(e2.y[0]).toBeCloseTo(0, 8);
  });

  it('Solow: la notación es s·A·f(k) en la gráfica y en el panel', async () => {
    const d = await CARGADORES_MACRO2['solow']();
    const r = d.calcular(d.defecto);
    expect(JSON.stringify(r.fig)).not.toMatch(/"s·f\(k\)"/);
    expect(d.grupos.some((g) => g.titulo === 'Acumulación: Δk = s·A·f(k) − (n + g + δ)·k')).toBe(true);
  });

  it('Phillips: el eje de desempleo solo toma dos escalas (15 % o 30 %)', async () => {
    const d = await CARGADORES_MACRO2['phillips']();
    const rangos = new Set<number>();
    for (const c of d.grupos.flatMap((g) => g.controles).filter((c) => c.tipo === 'slider'))
      for (const v of [c.min!, (c.min! + c.max!) / 2, c.max!]) {
        const r = d.calcular({ ...d.defecto, [c.id]: v });
        const rx = r.fig.layout.xaxis?.range;
        if (rx) rangos.add(rx[1]);
      }
    for (const v of rangos) expect([15, 30]).toContain(v);
  });
});
