// Integrante 3 — Recursos de una materia. Capa service (puras, sin React).
// El alta/edición/borrado usa `auth: true` (Bearer del token) y NUNCA manda
// `usuario_id` — sale del token en el backend (INTEGRACION_FRONT.md §3
// "Recursos de estudio").
import { apiClient } from "../../lib/apiClient";
import { DEMO_MODE } from "../../api/demo";
import { getMiUsuarioId } from "../../api/scope";
import type { Paginated, Recurso, RecursoCreate } from "../../api/types";
import { demoCreateRecurso, demoDeleteRecurso, demoGetRecursosDeMateria, demoUpdateRecurso } from "./demo";

export const getRecursosDeMateria = async (materiaId: number): Promise<Recurso[]> => {
  if (DEMO_MODE) return demoGetRecursosDeMateria(materiaId);
  const res = await apiClient<Paginated<Recurso>>(`/recursos/materia/${materiaId}?per_page=100`, {
    auth: false,
  });
  return res.items;
};

export const createRecurso = async (body: RecursoCreate): Promise<Recurso> => {
  if (DEMO_MODE) return demoCreateRecurso(getMiUsuarioId(), body);
  return apiClient<Recurso>("/recursos/", { method: "POST", body, auth: true });
};

export const updateRecurso = async (id: number, body: RecursoCreate): Promise<Recurso> => {
  if (DEMO_MODE) return demoUpdateRecurso(id, body);
  return apiClient<Recurso>(`/recursos/${id}`, { method: "PUT", body, auth: true });
};

export const deleteRecurso = async (id: number): Promise<void> => {
  if (DEMO_MODE) return demoDeleteRecurso(id);
  return apiClient<void>(`/recursos/${id}`, { method: "DELETE", auth: true });
};
