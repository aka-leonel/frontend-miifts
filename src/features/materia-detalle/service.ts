// Integrante 3 — Detalle de materia. Capa service (puras, sin React).
import { apiClient } from "../../api/client";
import type { Correlativa, Materia, Paginated } from "../../api/types";

export const getMateria = async (id: number): Promise<Materia> => {
  return apiClient<Materia>(`/materias/${id}`, { auth: false });
};

export const getCorrelativas = async (materiaId: number): Promise<Correlativa[]> => {
  const res = await apiClient<Paginated<Correlativa>>(`/materias/correlativas/${materiaId}?per_page=100`, {
    auth: false,
  });
  return res.items;
};
