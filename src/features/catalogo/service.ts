// MÓDULO COMPARTIDO · dueño: Integrante 2 (catálogo académico) — ver SPRINT3_FRONT.md.
//
// PROVISIONAL mientras Int. 2 entrega el módulo final. Esta es la interfaz que se espera
// (`getCarreras` + `getMateriasDeCarrera`); las features (ej. materiaUsuarioSpec) importan
// desde acá y NO se tocan cuando Int. 2 reemplace este archivo. En modo demo responde con
// `demo.ts`, de lo contrario pega a la API real.
import { apiClient } from "../../api/client";
import { DEMO_MODE } from "../../api/demo";
import type { Carrera, Materia, Paginated } from "../../api/types";
import { demoGetCarreras, demoGetMateriasDeCarrera } from "./demo";

export async function getCarreras(params: { page?: number; per_page?: number } = {}): Promise<Paginated<Carrera>> {
  if (DEMO_MODE) {
    return demoGetCarreras(params);
  }
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.per_page ?? 20),
  });
  return apiClient<Paginated<Carrera>>(`/materias/carreras?${query}`);
}

export async function getMateriasDeCarrera(
  carreraId: number,
  params: { page?: number; per_page?: number } = {},
): Promise<Paginated<Materia>> {
  if (DEMO_MODE) {
    return demoGetMateriasDeCarrera(carreraId, params);
  }
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.per_page ?? 100),
  });
  return apiClient<Paginated<Materia>>(`/materias/carrera/${carreraId}?${query}`);
}