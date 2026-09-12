import type { Cursada } from "../../api/types";

export type EstadoUI = "En curso" | "Aprobada" | "Reprobada" | "Regular" | "Pendiente";

// S4-08: nota mínima para aprobar (sistema educativo argentino: 4).
// `nota_final` no tiene este chequeo en el backend (INTEGRACION_FRONT.md
// §1.7/§2.13: "estado es derivado" pero sin umbral) — se deriva acá.
const NOTA_APROBACION = 4;

export function estadoLabel(cursada: Cursada): EstadoUI {
  if (cursada.cursando) return "En curso";
  if (cursada.nota_final != null) return cursada.nota_final >= NOTA_APROBACION ? "Aprobada" : "Reprobada";
  if (cursada.nota_parcial_1 != null || cursada.nota_parcial_2 != null) return "Regular";
  return "Pendiente";
}

export const estadoBadgeClasses: Record<EstadoUI, string> = {
  "En curso": "bg-violet/15 text-violet",
  Aprobada: "bg-green/15 text-green",
  Reprobada: "bg-red-500/15 text-red-300",
  Regular: "bg-lime/15 text-lime",
  Pendiente: "bg-border text-muted",
};