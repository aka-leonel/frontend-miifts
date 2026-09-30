import { useSyncExternalStore } from "react";

/**
 * Preferencias de accesibilidad del usuario (Perfil → Accesibilidad).
 *
 * Se guardan en localStorage y se reflejan como atributos `data-*` en <html>,
 * que es lo que leen los bloques de src/index.css. El mismo criterio de
 * defaults está duplicado en el <script> inline de index.html, que las aplica
 * ANTES de pintar para que no haya un parpadeo de tema al recargar.
 */

export type Tema = "sistema" | "claro" | "oscuro";
export type Fuente = "normal" | "grande" | "muy-grande";

export interface Preferencias {
  tema: Tema;
  fuente: Fuente;
  /** Más contraste de texto y bordes. */
  contraste: boolean;
  /** Estados en azul/naranja/amarillo en vez de rojo/verde. */
  daltonismo: boolean;
  /** Sin animaciones ni transiciones. */
  reducirAnimaciones: boolean;
}

const KEY = "miifts_preferencias";

const consulta = (q: string) => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(q).matches;

/** Valores de fábrica: el diseño oscuro original, salvo lo que el sistema operativo ya pida. */
export function preferenciasPorDefecto(): Preferencias {
  return {
    tema: "oscuro",
    fuente: "normal",
    contraste: consulta("(prefers-contrast: more)"),
    daltonismo: false,
    reducirAnimaciones: consulta("(prefers-reduced-motion: reduce)"),
  };
}

const TEMAS: Tema[] = ["sistema", "claro", "oscuro"];
const FUENTES: Fuente[] = ["normal", "grande", "muy-grande"];

function leer(): Preferencias {
  const base = preferenciasPorDefecto();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return base;
    const p = JSON.parse(raw) as Partial<Preferencias>;
    return {
      tema: TEMAS.includes(p.tema as Tema) ? (p.tema as Tema) : base.tema,
      fuente: FUENTES.includes(p.fuente as Fuente) ? (p.fuente as Fuente) : base.fuente,
      contraste: typeof p.contraste === "boolean" ? p.contraste : base.contraste,
      daltonismo: typeof p.daltonismo === "boolean" ? p.daltonismo : base.daltonismo,
      reducirAnimaciones: typeof p.reducirAnimaciones === "boolean" ? p.reducirAnimaciones : base.reducirAnimaciones,
    };
  } catch {
    return base;
  }
}

/** "sistema" se resuelve a claro/oscuro según la preferencia del navegador. */
function temaResuelto(tema: Tema): "claro" | "oscuro" {
  if (tema === "sistema") return consulta("(prefers-color-scheme: light)") ? "claro" : "oscuro";
  return tema;
}

export function aplicarPreferencias(p: Preferencias): void {
  const el = document.documentElement;
  el.dataset.tema = temaResuelto(p.tema);
  el.dataset.fuente = p.fuente;
  el.dataset.contraste = p.contraste ? "alto" : "normal";
  el.dataset.daltonismo = p.daltonismo ? "si" : "no";
  el.dataset.animaciones = p.reducirAnimaciones ? "reducidas" : "normal";
}

// ── store mínimo para useSyncExternalStore ────────────────────────────────
let actual: Preferencias = typeof window === "undefined" ? preferenciasPorDefecto() : leer();
const oyentes = new Set<() => void>();

function emitir() {
  oyentes.forEach((fn) => fn());
}

export function guardarPreferencias(cambios: Partial<Preferencias>): void {
  actual = { ...actual, ...cambios };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(actual));
  } catch {
    // localStorage no disponible (modo privado): la preferencia vale solo esta sesión.
  }
  aplicarPreferencias(actual);
  emitir();
}

export function restablecerPreferencias(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // idem
  }
  actual = preferenciasPorDefecto();
  aplicarPreferencias(actual);
  emitir();
}

/** Se llama una vez al arrancar: aplica lo guardado y sigue al sistema si el tema es "sistema". */
export function iniciarPreferencias(): void {
  actual = leer();
  aplicarPreferencias(actual);
  if (typeof window.matchMedia === "function") {
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
      if (actual.tema === "sistema") aplicarPreferencias(actual);
    });
  }
}

function suscribir(fn: () => void) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

export function usePreferencias(): Preferencias {
  return useSyncExternalStore(suscribir, () => actual, () => actual);
}
