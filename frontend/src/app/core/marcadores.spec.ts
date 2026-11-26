/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Marcadores destacados (core/marcadores): el centro del punto, el halo y las guías coinciden con las
 * coordenadas calculadas por el modelo; las etiquetas no se montan entre sí y los valores extremos no
 * rompen nada.
 */
import { describe, expect, it } from 'vitest';
import { CARGADORES } from './registro';
import { MARCADOR, NOMBRE_HALO, escalarMarcadores, factorPorAncho, guiasEjes, halo } from './marcadores';
import { figura, punto } from './tema';
import { equilibrio } from '../fundamentos/modelos/mercado';
import { curvas } from '../fundamentos/simuladores/_ui';
import { equilibrioISLM } from '../macro1/modelos/islm';
import { escenarios as escISLM } from '../macro1/simuladores/is-lm';

const halos = (f: any) => (f.layout.shapes ?? []).filter((s: any) => s.name === NOMBRE_HALO);
const cerca = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

describe('Estilo común de marcadores', () => {
  it('punto(): grande, con borde de contraste, halo centrado en el dato y etiqueta legible', () => {
    const f = figura('x', 'y', 'prueba');
    punto(f, 12.5, 7.25, 'E', undefined, undefined, 'E₀');
    const t = f.data.at(-1);
    expect(t.x).toEqual([12.5]);
    expect(t.y).toEqual([7.25]);
    expect(t.marker.size).toBeGreaterThanOrEqual(16);
    expect(t.marker.line.width).toBeGreaterThanOrEqual(3);
    expect(t.textfont.size).toBeGreaterThanOrEqual(14);
    expect(t.textfont.weight).toBe(700);
    const [h] = halos(f);
    expect(h).toMatchObject({ xanchor: 12.5, yanchor: 7.25, xsizemode: 'pixel', ysizemode: 'pixel', layer: 'below' });
    expect(h.x1 - h.x0).toBeGreaterThan(t.marker.size); // el halo rodea al punto
    expect(h.x0 + h.x1).toBe(0); // centrado en el dato
  });

  it('símbolos abiertos no llevan halo y conservan su color de borde', () => {
    const f = figura('x', 'y', 'prueba');
    punto(f, 1, 1, 'Sin expulsión', '#B0B8C6', 'circle-open');
    expect(halos(f).length).toBe(0);
    expect(f.data[0].marker.line.color).toBe('#B0B8C6');
  });

  it('el halo sigue el subgráfico del punto', () => {
    const f = figura('x', 'y', 'prueba');
    punto(f, 2, 3, 'Paridad', undefined, undefined, undefined, { xaxis: 'x2' });
    expect(halos(f)[0]).toMatchObject({ xref: 'x2', yref: 'y' });
  });

  it('guías: terminan exactamente en el punto y los rótulos de E₀ y E₁ se apilan sin montarse', () => {
    const f = figura('x', 'y', 'prueba');
    guiasEjes(f, 30, 18, { rotuloX: 'Q₀', rotuloY: 'P₀' });
    guiasEjes(f, 31, 18.4, { rotuloX: 'Q₁', rotuloY: 'P₁' });
    expect(f.data[0].x).toEqual([0, 30, 30]);
    expect(f.data[0].y).toEqual([18, 18, 0]);
    const rx = f.layout.annotations.filter((a: any) => a.name === 'rotulo-eje-x');
    const ry = f.layout.annotations.filter((a: any) => a.name === 'rotulo-eje-y');
    expect(rx.map((a: any) => a.text)).toEqual(['Q₀ = 30', 'Q₁ = 31']);
    expect(ry.map((a: any) => a.text)).toEqual(['P₀ = 18', 'P₁ = 18.4']);
    expect(rx[1].yshift).toBeGreaterThan(rx[0].yshift);
    expect(ry[1].yshift).toBeGreaterThan(ry[0].yshift);
    for (const a of [...rx, ...ry]) expect(a.bgcolor).toBeTruthy(); // fondo propio: no se confunde con las curvas
  });

  it('valores extremos o no finitos no agregan formas ni trazas rotas', () => {
    const f = figura('x', 'y', 'prueba');
    halo(f, Number.NaN, 1, '#fff');
    guiasEjes(f, Infinity, 2, { rotuloX: 'Q' });
    expect(f.layout.shapes ?? []).toEqual([]);
    expect(f.data).toEqual([]);
    punto(f, 1e9, 1e-9, 'Lejos');
    expect(halos(f)[0]).toMatchObject({ xanchor: 1e9, yanchor: 1e-9 });
  });

  it('escala según el ancho: menor en celular, mayor en proyector, sin tocar la figura original', () => {
    expect(factorPorAncho(360)).toBeLessThan(1);
    expect(factorPorAncho(1000)).toBe(1);
    expect(factorPorAncho(1920)).toBeGreaterThan(1);
    expect(factorPorAncho(0)).toBe(1);
    const f = figura('x', 'y', 'prueba');
    punto(f, 1, 1, 'E', undefined, undefined, 'E');
    f.data.push({ type: 'scatter', mode: 'markers', x: [1], y: [1], marker: { size: 5 } });
    const g = escalarMarcadores(f, 1.2);
    expect(g.data[0].marker.size).toBe(Math.round(MARCADOR.tamano * 1.2));
    expect(g.data[1].marker.size).toBe(5); // marcadores pequeños (trayectorias) no cambian
    expect(halos(g)[0].x1).toBeCloseTo(MARCADOR.halo * 1.2);
    expect(f.data[0].marker.size).toBe(MARCADOR.tamano);
  });
});

describe('Matemático: el centro del punto coincide con el equilibrio calculado', () => {
  it('oferta y demanda (E y guías Q*, P*)', async () => {
    const def = await CARGADORES['fundamentos']['oferta-demanda']();
    for (const [a, c] of [[100, 10], [150, -20], [60, 40], [200, 50]]) {
      const p = { ...def.defecto, a, c };
      const [D, S] = curvas(a, 2, c, 3);
      const e = equilibrio(D, S);
      if (!e.intercambio) continue;
      const r = def.calcular(p);
      const E = r.fig.data.find((t: any) => t.name === 'Equilibrio' && String(t.mode).includes('markers'));
      expect(cerca(E.x[0], e.q) && cerca(E.y[0], e.p), `${a}, ${c}`).toBe(true);
      const h = halos(r.fig).find((s: any) => cerca(s.xanchor, e.q));
      expect(h && cerca(h.yanchor, e.p)).toBe(true);
      const rot = r.fig.layout.annotations.filter((x: any) => String(x.name).startsWith('rotulo-eje'));
      expect(rot.map((x: any) => x.text.split(' = ')[0])).toEqual(['Q*', 'P*']);
    }
  });

  it('IS-LM de Macro 1 (E₀, E₁ y rótulos Y, i)', async () => {
    const def = await CARGADORES['macro1']['is-lm']();
    const p = { ...def.defecto, dG: 50 };
    const [r0, r1] = escISLM(p as any).map(equilibrioISLM);
    const r = def.calcular(p);
    const e0 = r.fig.data.find((t: any) => t.name === 'Equilibrio inicial');
    const e1 = r.fig.data.find((t: any) => t.name === 'Equilibrio final');
    expect([e0.x[0], e0.y[0]]).toEqual([r0.Y, r0.i]);
    expect([e1.x[0], e1.y[0]]).toEqual([r1.Y, r1.i]);
    expect(halos(r.fig).length).toBeGreaterThanOrEqual(2);
    const textos = r.fig.layout.annotations.filter((x: any) => String(x.name).startsWith('rotulo-eje')).map((x: any) => x.text);
    expect(textos).toEqual(['Y₀ = 966.7', 'i₀ = 5', 'Y₁ = 1133.3', 'i₁ = 5']);
  });

  it('todos los simuladores: cada halo está anclado a un punto destacado de la figura', async () => {
    for (const [materia, sims] of Object.entries(CARGADORES))
      for (const [sim, cargar] of Object.entries(sims)) {
        const def = await cargar();
        const r = def.calcular(def.defecto);
        const puntos = r.fig.data.filter((t: any) => String(t.mode ?? '').includes('markers'));
        for (const h of halos(r.fig)) {
          const ok = puntos.some(
            (t: any) =>
              (t.x ?? []).some((x: number, i: number) => cerca(x, h.xanchor) && cerca(t.y[i], h.yanchor)) &&
              (t.xaxis ?? 'x') === h.xref &&
              (t.yaxis ?? 'y') === h.yref,
          );
          expect(ok, `${materia}/${sim}: halo en (${h.xanchor}, ${h.yanchor})`).toBe(true);
        }
      }
  }, 60000);
});
