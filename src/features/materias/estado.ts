import type { Cursada, EstadoCursada } from "../../api/types";

// El backend ya calcula la regla de negocio (cursando / promocionada / aprobada /
// desaprobada / pendiente según cursando + notas) y la manda resuelta en
// `cursada.estado`. Acá NO se reimplementa esa lógica: solo se lee.
export type EstadoUI = EstadoCursada;

export function estadoLabel(cursada: Cursada): EstadoUI {
  return cursada.estado;
}

export const estadoBadgeClasses: Record<EstadoUI, string> = {
  cursando: "bg-violet/15 text-violet",
  promocionada: "bg-lime/15 text-lime",
  aprobada: "bg-green/15 text-green",
  desaprobada: "bg-red-500/15 text-red-300",
  pendiente: "bg-border text-muted",
};
