import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MATERIAS, buscarMateria, buscarSimulador } from '../core/catalogo';
import { ErrorParametro } from '../core/errores';
import { fmt } from '../core/formato';
import { figuraVacia } from '../core/tema';
import { CARGADORES } from '../core/registro';
import { Figura, GrupoControles, Params, SimuladorDef } from '../core/tipos';
import { CHALLENGES, retosDe } from '../desafio/challengesData';
import { hayDesafio } from '../desafio/indice';
import {
  Objetivo,
  PUNTOS,
  Progreso,
  TOLERANCIA,
  Veredicto,
  estadoInicial,
  figuraDesafio,
  guardarProgreso,
  leerProgreso,
  logros,
  puntaje,
  registrarIntento,
  verificar,
} from '../desafio/motor';
import { ControlPanel } from '../shared/control-panel';
import { PlotlyChart } from '../shared/plotly-chart';
import { NoEncontrada } from './no-encontrada';
import { Apariencia } from '../core/apariencia';

/**
 * Modo Desafío: vista aparte del simulador. Carga la misma definición del modelo, muestra solo los
 * deslizadores del reto, dibuja las curvas del estado inicial como fantasma y la zona objetivo, y
 * verifica la solución con ±1,5 % usando el mismo motor del modelo.
 */
@Component({
  selector: 'app-desafio',
  imports: [RouterLink, ControlPanel, PlotlyChart, NoEncontrada],
  templateUrl: './desafio.html',
  styleUrl: './desafio.scss',
})
export class DesafioPage {
  /** Colores de materia según el modo claro u oscuro. */
  protected readonly ap = inject(Apariencia);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ids = toSignal(
    this.ruta.paramMap.pipe(map((p) => ({ materia: p.get('materia') ?? '', sim: p.get('sim') ?? '' }))),
    { initialValue: { materia: '', sim: '' } },
  );
  private readonly consulta = toSignal(this.ruta.queryParamMap.pipe(map((q) => Number(q.get('reto') ?? 1))), {
    initialValue: 1,
  });

  protected readonly materia = computed(() => buscarMateria(this.ids().materia));
  protected readonly sim = computed(() => {
    const m = this.materia();
    return m ? buscarSimulador(m, this.ids().sim) : undefined;
  });
  /** Selectores de la cabecera: materias con desafío y sus modelos con retos. */
  protected readonly materias = MATERIAS.filter((m) => m.simuladores.some((x) => hayDesafio(m.id, x.id)));
  protected readonly modelos = computed(() =>
    (this.materia()?.simuladores ?? []).filter((x) => hayDesafio(this.ids().materia, x.id)),
  );

  protected elegirMateria(id: string): void {
    const m = this.materias.find((x) => x.id === id);
    const primero = m?.simuladores.find((x) => hayDesafio(id, x.id));
    if (primero) void this.router.navigate(['/', id, primero.id, 'desafio']);
  }

  protected elegirModelo(id: string): void {
    void this.router.navigate(['/', this.ids().materia, id, 'desafio']);
  }

  protected readonly retos = computed(() => retosDe(this.ids().materia, this.ids().sim));
  protected readonly indice = computed(() => {
    const n = this.consulta();
    const total = this.retos().length;
    return Number.isInteger(n) && n >= 1 && n <= total ? n - 1 : 0;
  });
  protected readonly reto = computed(() => this.retos()[this.indice()] ?? null);

  protected readonly def = signal<SimuladorDef | null>(null);
  protected readonly falla = signal(false);
  protected readonly params = signal<Params>({});
  protected readonly veredicto = signal<Veredicto | null>(null);
  protected readonly progreso = signal<Progreso>(leerProgreso());
  protected readonly tolerancia = `±${fmt(TOLERANCIA * 100, 1).replace('.', ',')} %`;

  /** Solo los deslizadores del reto, con los rangos y pasos del simulador. */
  protected readonly grupos = computed<GrupoControles[]>(() => {
    const d = this.def();
    const r = this.reto();
    if (!d || !r) return [];
    const todos = d.grupos.flatMap((g) => g.controles.map((c) => ({ c, grupo: g.titulo })));
    const elegidos = r.controles.map((id) => todos.find((x) => x.c.id === id)!).filter(Boolean);
    // Fuera de su grupo, dos controles con la misma etiqueta (p. ej. «Aumento (+)…» de la demanda y
    // de la oferta) se confunden: se les antepone el título de su grupo.
    const repetida = (e: string) => elegidos.filter((x) => x.c.etiqueta === e).length > 1;
    const controles = elegidos.map(({ c, grupo }) => (repetida(c.etiqueta) ? { ...c, etiqueta: `${grupo}: ${c.etiqueta}` } : c));
    return [{ titulo: 'Tus controles', controles }];
  });

  private readonly figInicial = computed<Figura | null>(() => {
    const d = this.def();
    const r = this.reto();
    if (!d || !r) return null;
    try {
      return d.calcular(estadoInicial(r, d.defecto)).fig;
    } catch {
      return null;
    }
  });

  protected readonly figura = computed<Figura | null>(() => {
    const d = this.def();
    const r = this.reto();
    if (!d || !r) return null;
    try {
      return figuraDesafio(d.calcular(this.params()).fig, this.figInicial(), r);
    } catch (e) {
      if (e instanceof ErrorParametro) return figuraVacia(e.message);
      throw e;
    }
  });

  protected readonly resueltosModelo = computed(() => this.retos().filter((r) => this.progreso().resueltos[r.id]).length);

  /** Validación en vivo: la misma cuenta exacta de «Verificar», recalculada con cada movimiento. */
  protected readonly enVivo = computed<Veredicto | null>(() => {
    const r = this.reto();
    if (!r || !this.def()) return null;
    try {
      return verificar(r, this.params());
    } catch {
      return null;
    }
  });
  protected readonly puntos = computed(() => puntaje(this.progreso(), CHALLENGES));
  protected readonly puntosReto = computed(() => {
    const r = this.reto();
    return r ? PUNTOS[r.dificultad] : 0;
  });
  protected readonly logros = computed(() => logros(this.progreso(), CHALLENGES));
  protected readonly logrosObtenidos = computed(() => this.logros().filter((l) => l.logrado).length);
  /** Logros recién desbloqueados con la última verificación (se anuncian en el banner de éxito). */
  protected readonly nuevosLogros = signal<string[]>([]);

  constructor() {
    effect(() => {
      const { materia, sim } = this.ids();
      const cargador = CARGADORES[materia]?.[sim];
      this.def.set(null);
      this.falla.set(false);
      if (!cargador) return;
      cargador()
        .then((d) => {
          if (this.ids().materia !== materia || this.ids().sim !== sim) return;
          this.def.set(d);
        })
        .catch(() => this.falla.set(true));
    });
    // Al cambiar de reto (o al cargar el modelo) se parte de su estado inicial.
    effect(() => {
      const d = this.def();
      const r = this.reto();
      if (d && r) this.reiniciarCon(d, r.id);
    });
  }

  private reiniciarCon(d: SimuladorDef, id: string): void {
    const r = this.retos().find((x) => x.id === id);
    if (!r) return;
    cancelAnimationFrame(this.cuadro);
    this.cuadro = 0;
    this.pendiente = null;
    this.params.set(estadoInicial(r, d.defecto));
    this.veredicto.set(null);
  }

  protected reiniciar(): void {
    const d = this.def();
    const r = this.reto();
    if (d && r) this.reiniciarCon(d, r.id);
  }

  protected irA(i: number): void {
    void this.router.navigate([], { relativeTo: this.ruta, queryParams: { reto: i + 1 }, replaceUrl: true });
  }

  protected verificarSolucion(): void {
    const r = this.reto();
    if (!r) return;
    const p = this.pendiente ?? this.params();
    const v = verificar(r, p);
    this.veredicto.set(v);
    const antes = new Set(this.logros().filter((l) => l.logrado).map((l) => l.id));
    const nuevo = registrarIntento(this.progreso(), r.id, v.ok);
    this.progreso.set(nuevo);
    guardarProgreso(nuevo);
    this.nuevosLogros.set(logros(nuevo, CHALLENGES).filter((l) => l.logrado && !antes.has(l.id)).map((l) => `${l.icono} ${l.titulo}`));
  }

  protected meta(o: Objetivo): string {
    return fmt(o.meta, o.decimales ?? 2);
  }

  protected valor(v: number | null, o: Objetivo): string {
    return v === null ? 'sin equilibrio' : fmt(v, o.decimales ?? 2);
  }

  private pendiente: Params | null = null;
  private cuadro = 0;

  /** Igual que en el simulador: un redibujado por cuadro de animación mientras se arrastra. */
  protected alCambiar(ev: { id: string; valor: number | string }): void {
    const d = this.def();
    if (!d) return;
    const anterior = this.pendiente ?? this.params();
    let nuevo: Params = { ...anterior, [ev.id]: ev.valor };
    const ajuste = d.alCambiar?.(anterior, nuevo);
    if (ajuste) nuevo = { ...nuevo, ...ajuste };
    this.pendiente = nuevo;
    this.veredicto.set(null);
    if (this.cuadro) return;
    this.cuadro = requestAnimationFrame(() => {
      this.cuadro = 0;
      if (this.pendiente) this.params.set(this.pendiente);
      this.pendiente = null;
    });
  }
}
