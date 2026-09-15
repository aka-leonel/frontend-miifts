// MÓDULO COMPARTIDO · dueño: Integrante 2 (catálogo académico) — ver SPRINT3_FRONT.md.
//
// PROVISIONAL mientras Int. 2 entrega el módulo final. Esta es la interfaz que se espera
// (`getCarreras` + `getMateriasDeCarrera`); las features (ej. materiaUsuarioSpec) importan
// desde acá y NO se tocan cuando Int. 2 reemplace este archivo.
import { apiClient } from "../../api/client";
import type { Carrera, Materia, Paginated } from "../../api/types";

export async function getCarreras(params: { page?: number; per_page?: number } = {}): Promise<Paginated<Carrera>> {
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
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.per_page ?? 100),
  });
  return apiClient<Paginated<Materia>>(`/materias/carrera/${carreraId}?${query}`);
}
