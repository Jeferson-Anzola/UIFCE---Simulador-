/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Estilo único de los puntos destacados (equilibrios E₀/E₁, óptimos, cortes) en todas las gráficas.
 *
 * Pensado para proyectarse en un auditorio: el punto es grande, lleva un borde del color del fondo
 * (contraste contra la curva que lo cruza) y un halo translúcido del mismo color; la etiqueta va en
 * negrita con sombra de contraste, y las guías punteadas bajan a los ejes con rótulos como Q* o P*.
 * El halo es una forma de Plotly anclada al dato con tamaño en píxeles: no agrega trazas (no cambia la
 * leyenda, el hover ni las pruebas que cuentan trazas) y se dibuja detrás de las curvas.
 */
import { COLORES } from './tema';
import { Figura } from './tipos';

/** Tamaños en píxeles a escala de escritorio; PlotlyChart los ajusta al ancho real de la gráfica. */
export const MARCADOR = {
  tamano: 17,
  borde: 3,
  halo: 17, // radio del halo
  opacidadHalo: 0.3,
  fuente: 15,
  fuenteEje: 13,
  guia: 1.6,
} as const;

/** Nombre de las formas de halo (PlotlyChart las reconoce para escalarlas). */
export const NOMBRE_HALO = 'halo-marcador';

const abierto = (simbolo: string): boolean => /-open/.test(simbolo);

/** `marker` de Plotly para un punto destacado. */
export function estiloMarcador(color: string, simbolo = 'circle', tamano: number = MARCADOR.tamano): any {
  return abierto(simbolo)
    ? { size: tamano, color, symbol: simbolo, line: { width: MARCADOR.borde, color } }
    : { size: tamano, color, symbol: simbolo, line: { width: MARCADOR.borde, color: COLORES.fondo } };
}

/** `textfont` de la etiqueta de un punto: negrita y con sombra que la separa de las curvas. */
export function estiloTexto(color: string, tamano: number = MARCADOR.fuente): any {
  return { color, size: tamano, weight: 700, shadow: 'auto' };
}

/** Halo translúcido detrás del punto (forma en píxeles anclada a las coordenadas del dato). */
export function halo(fig: Figura, x: number, y: number, color: string, xref = 'x', yref = 'y'): void {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  const r = MARCADOR.halo;
  (fig.layout.shapes ??= []).push({
    type: 'circle',
    name: NOMBRE_HALO,
    layer: 'below',
    xref,
    yref,
    xsizemode: 'pixel',
    ysizemode: 'pixel',
    xanchor: x,
    yanchor: y,
    x0: -r,
    x1: r,
    y0: -r,
    y1: r,
    fillcolor: color,
    opacity: MARCADOR.opacidadHalo,
    line: { width: 0 },
  });
}

export interface OpcionesGuias {
  /** Origen de las guías (por defecto 0, 0). */
  x0?: number;
  y0?: number;
  xref?: string;
  yref?: string;
  color?: string;
  /** Rótulos en los ejes, p. ej. «Q*» y «P*»; se muestran como «Q* = 30». */
  rotuloX?: string;
  rotuloY?: string;
  decX?: number;
  decY?: number;
  /** Marca de la traza (p. ej. 'extra' para que la paridad con Python la ignore). */
  meta?: string;
}

const cifra = (v: number, dec: number): string => {
  const s = v.toFixed(dec);
  return (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s).replace('-', '−');
};

/**
 * Líneas punteadas desde el punto hasta los ejes y, si se piden, rótulos sobre los ejes con fondo del
 * panel (no se confunden con las curvas que pasan por debajo).
 */
export function guiasEjes(fig: Figura, x: number, y: number, op: OpcionesGuias = {}): void {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  const { x0 = 0, y0 = 0, xref = 'x', yref = 'y', color = 'rgba(243,245,249,0.5)' } = op;
  fig.data.push({
    type: 'scatter',
    x: [x0, x, x],
    y: [y, y, y0],
    ...(xref !== 'x' ? { xaxis: xref } : {}),
    ...(yref !== 'y' ? { yaxis: yref } : {}),
    mode: 'lines',
    showlegend: false,
    hoverinfo: 'skip',
    line: { color, width: MARCADOR.guia, dash: 'dot' },
    ...(op.meta ? { meta: op.meta } : {}),
  });
  const rotulos: any[] = [];
  const base = {
    showarrow: false,
    bgcolor: COLORES.panel,
    bordercolor: COLORES.borde,
    borderwidth: 1,
    borderpad: 2,
    font: { size: MARCADOR.fuenteEje, color: COLORES.texto, weight: 700 },
  };
  // Varios puntos en la misma gráfica (E₀, E₁…): cada rótulo nuevo se apila para no montarse en el anterior.
  const previos = (nombre: string, ref: string) =>
    (fig.layout.annotations ?? []).filter((a: any) => a?.name === nombre && (a.xref === ref || a.yref === ref)).length;
  if (op.rotuloX)
    rotulos.push({
      ...base,
      name: 'rotulo-eje-x',
      yshift: 24 * previos('rotulo-eje-x', xref),
      x,
      y: 0,
      xref,
      yref: `${yref} domain`,
      yanchor: 'bottom',
      text: `${op.rotuloX} = ${cifra(x, op.decX ?? 1)}`,
    });
  if (op.rotuloY)
    rotulos.push({
      ...base,
      name: 'rotulo-eje-y',
      yshift: 22 * previos('rotulo-eje-y', yref),
      x: 0,
      y,
      xref: `${xref} domain`,
      yref,
      xanchor: 'left',
      text: `${op.rotuloY} = ${cifra(y, op.decY ?? 1)}`,
    });
  if (rotulos.length) fig.layout.annotations = [...(fig.layout.annotations ?? []), ...rotulos];
}

/**
 * Escala marcadores destacados, etiquetas y halos al ancho real de la gráfica (celular, escritorio,
 * proyector). Devuelve una copia; no toca la figura original.
 */
export function escalarMarcadores(fig: { data: any[]; layout: any }, factor: number): { data: any[]; layout: any } {
  if (!Number.isFinite(factor) || Math.abs(factor - 1) < 1e-3) return fig;
  const data = fig.data.map((t: any) => {
    const m = t?.marker;
    if (!m || typeof m.size !== 'number' || m.size < MARCADOR.tamano - 3 || !String(t.mode ?? '').includes('markers')) return t;
    const out = { ...t, marker: { ...m, size: Math.round(m.size * factor) } };
    if (t.textfont && typeof t.textfont.size === 'number') out.textfont = { ...t.textfont, size: Math.round(t.textfont.size * factor) };
    return out;
  });
  const shapes = fig.layout?.shapes;
  const layout = Array.isArray(shapes)
    ? {
        ...fig.layout,
        shapes: shapes.map((s: any) =>
          s?.name === NOMBRE_HALO ? { ...s, x0: s.x0 * factor, x1: s.x1 * factor, y0: s.y0 * factor, y1: s.y1 * factor } : s,
        ),
      }
    : fig.layout;
  return { data, layout };
}

/** Factor de escala según el ancho de la gráfica: menor en celular, mayor en pantallas de proyección. */
export function factorPorAncho(ancho: number): number {
  if (!(ancho > 0)) return 1;
  if (ancho < 420) return 0.72;
  if (ancho < 640) return 0.85;
  if (ancho > 1500) return 1.2;
  return 1;
}
