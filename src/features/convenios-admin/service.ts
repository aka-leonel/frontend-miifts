// Panel Admin (ver decisions D016) — ABM real de Convenios sobre la forma
// cruda del backend. NO reusa `features/convenios/service.ts`: esa pantalla
// es de consulta para estudiante y mapea la respuesta a `ConvenioItem` (forma
// UI), no sirve para editar/borrar.
import { apiClient } from "../../api/client";
import type { Convenio, ConvenioCreate, ConvenioUpdate, Paginated } from "../../api/types";

export async function getConveniosAdmin(
  params: { page?: number; per_page?: number; q?: string } = {},
): Promise<Paginated<Convenio>> {
  const query = new URLSearchParams({
    page: String(Math.max(1, params.page ?? 1)),
    per_page: String(params.per_page ?? 20),
  });
  const q = params.q?.trim();
  if (q) query.set("q", q);
  return apiClient<Paginated<Convenio>>(`/convenios/?${query}`);
}

export async function crearConvenio(body: ConvenioCreate): Promise<Convenio> {
  return apiClient<Convenio>("/convenios/", { method: "POST", body });
}

// PATCH aplica sólo los campos presentes; mandamos el form completo porque
// el usuario edita todos los campos a la vez.
export async function editarConvenio(id: number, body: ConvenioUpdate): Promise<Convenio> {
  return apiClient<Convenio>(`/convenios/${id}`, { method: "PATCH", body });
}

export async function borrarConvenio(id: number): Promise<void> {
  return apiClient<void>(`/convenios/${id}`, { method: "DELETE" });
}
