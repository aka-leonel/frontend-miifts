// Sección TalentoTech (estudiante, solo lectura) — contrato en
// docs/contexto_taletoTech/TALENTOTECH_FRONT.md.
import { apiClient } from "../../api/client";
import type { Paginated, TalentoTech } from "../../api/types";

export type TalentoTechParams = {
  page?: number;
  per_page?: number;
  categoria?: string;
  carrera_id?: number;
};

function buildQuery(params: TalentoTechParams): string {
  const query = new URLSearchParams({
    page: String(Math.max(1, params.page ?? 1)),
    per_page: String(params.per_page ?? 20),
  });
  return query.toString();
}

// Prioridad: categoría > carrera > listado completo. El backend no permite
// combinar ambos filtros en un mismo endpoint.
export async function getTalentoTech(params: TalentoTechParams = {}): Promise<Paginated<TalentoTech>> {
  const path = params.categoria
    ? `/talentotech/categoria/${encodeURIComponent(params.categoria)}`
    : params.carrera_id != null
      ? `/talentotech/carrera/${params.carrera_id}`
      : "/talentotech/";

  return apiClient<Paginated<TalentoTech>>(`${path}?${buildQuery(params)}`, { auth: false });
}
