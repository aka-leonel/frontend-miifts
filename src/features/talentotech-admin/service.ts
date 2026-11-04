// Panel Admin (ver decisions D016) — ABM real de TalentoTech sobre la forma
// cruda del backend. La consulta de estudiante vive en `features/talentotech`
// y mapea a su propia forma UI; acá se trabaja con `TalentoTech` tal cual.
import { apiClient } from "../../api/client";
import type { Paginated, TalentoTech, TalentoTechCreate } from "../../api/types";

export async function getTalentoTechAdmin(
  params: { page?: number; per_page?: number } = {},
): Promise<Paginated<TalentoTech>> {
  const query = new URLSearchParams({
    page: String(Math.max(1, params.page ?? 1)),
    per_page: String(params.per_page ?? 20),
  });
  return apiClient<Paginated<TalentoTech>>(`/talentotech/?${query}`);
}

export async function crearTalentoTech(body: TalentoTechCreate): Promise<TalentoTech> {
  return apiClient<TalentoTech>("/talentotech/", { method: "POST", body });
}

// No hay PATCH: la edición es un PUT de reemplazo total con el body completo.
export async function editarTalentoTech(id: number, body: TalentoTechCreate): Promise<TalentoTech> {
  return apiClient<TalentoTech>(`/talentotech/${id}`, { method: "PUT", body });
}

export async function borrarTalentoTech(id: number): Promise<void> {
  return apiClient<void>(`/talentotech/${id}`, { method: "DELETE" });
}
