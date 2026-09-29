// Panel Admin (ver decisions D016) — ABM real de Convenios sobre la forma
// cruda del backend. NO reusa `features/convenios/service.ts`: esa pantalla
// es de consulta para estudiante y mapea la respuesta a `ConvenioItem` (forma
// UI, sin `id`/`carrera_id`), no sirve para editar/borrar.
import { apiClient } from "../../api/client";
import type { Convenio, ConvenioCreate, Paginated } from "../../api/types";

export async function getConveniosAdmin(params: { page?: number } = {}): Promise<Paginated<Convenio>> {
  const page = Math.max(1, params.page ?? 1);
  return apiClient<Paginated<Convenio>>(`/convenios/?page=${page}`);
}

export async function crearConvenio(body: ConvenioCreate): Promise<Convenio> {
  return apiClient<Convenio>("/convenios/", { method: "POST", body });
}

// PUT /convenios/{id} reemplaza el registro completo: no hay `ConvenioUpdate`
// parcial en el backend (a diferencia de carreras/materias).
export async function editarConvenio(id: number, body: ConvenioCreate): Promise<Convenio> {
  return apiClient<Convenio>(`/convenios/${id}`, { method: "PUT", body });
}

export async function borrarConvenio(id: number): Promise<void> {
  return apiClient<void>(`/convenios/${id}`, { method: "DELETE" });
}
