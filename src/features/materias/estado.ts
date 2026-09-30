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
  aprobada: "bg-success/15 text-success",
  desaprobada: "bg-danger/15 text-danger",
  pendiente: "bg-border text-muted",
};


/** Nombre a mostrar de una cursada: lo que devuelve el back (`materia_nombre`) o, si falta, "Materia #id". */
export function nombreDeCursada(cursada: Cursada): string {
  return cursada.materia_nombre ?? `Materia #${cursada.materia_id}`;
}
