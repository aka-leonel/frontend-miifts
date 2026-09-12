// Integrante 3 — Recursos de una materia. Capa service (puras, sin React).
// El alta/edición/borrado usa `auth: true` (token) y NUNCA manda
// `usuario_id` — sale del token en el backend (INTEGRACION_FRONT.md §3
// "Recursos de estudio").
import { apiClient } from "../../api/client";
import type { Paginated, Recurso, RecursoCreate } from "../../api/types";

export const getRecursosDeMateria = async (materiaId: number): Promise<Recurso[]> => {
  const res = await apiClient<Paginated<Recurso>>(`/recursos/materia/${materiaId}?per_page=100`, {
    auth: false,
  });
  return res.items;
};

export const createRecurso = async (body: RecursoCreate): Promise<Recurso> => {
  return apiClient<Recurso>("/recursos/", { method: "POST", body, auth: true });
};

export const updateRecurso = async (id: number, body: RecursoCreate): Promise<Recurso> => {
  return apiClient<Recurso>(`/recursos/${id}`, { method: "PUT", body, auth: true });
};

export const deleteRecurso = async (id: number): Promise<void> => {
  return apiClient<void>(`/recursos/${id}`, { method: "DELETE", auth: true });
};
