import type { Cursada } from "../../api/types";

export type EstadoUI = "En curso" | "Aprobada" | "Regular" | "Pendiente";

export function estadoLabel(cursada: Cursada): EstadoUI {
  if (cursada.cursando) return "En curso";
  if (cursada.nota_final != null) return "Aprobada";
  if (cursada.nota_parcial_1 != null || cursada.nota_parcial_2 != null) return "Regular";
  return "Pendiente";
}

export const estadoBadgeClasses: Record<EstadoUI, string> = {
  "En curso": "bg-violet/15 text-violet",
  Aprobada: "bg-green/15 text-green",
  Regular: "bg-lime/15 text-lime",
  Pendiente: "bg-border text-muted",
};