// Integrante 3 — Detalle de materia. Capa service (puras, sin React).
import { apiClient } from "../../lib/apiClient";
import { DEMO_MODE } from "../../api/demo";
import type { Correlativa, Materia, Paginated } from "../../api/types";
import { demoGetCorrelativas, demoGetMateria } from "./demo";

export const getMateria = async (id: number): Promise<Materia> => {
  if (DEMO_MODE) return demoGetMateria(id);
  return apiClient<Materia>(`/materias/${id}`, { auth: false });
};

export const getCorrelativas = async (materiaId: number): Promise<Correlativa[]> => {
  if (DEMO_MODE) return demoGetCorrelativas(materiaId);
  const res = await apiClient<Paginated<Correlativa>>(`/materias/correlativas/${materiaId}?per_page=100`, {
    auth: false,
  });
  return res.items;
};
