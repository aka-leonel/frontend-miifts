// Tarea del Integrante 3 (SPRINT2_FRONT.md): "Mi carrera" — cursadas + promedio.
// Capa service (puras, 1 función por endpoint, sin React). Los componentes usan hooks,
// nunca llaman a este archivo directo.
import { apiClient } from "../../api/client";
import { withUsuarioId } from "../../api/scope";
import type { Cursada, CursadaCreate, CursadaUpdate, Paginated, Promedio } from "../../api/types";

export async function getMisMaterias(page = 1, perPage = 20): Promise<Paginated<Cursada>> {
  return apiClient<Paginated<Cursada>>(
    withUsuarioId(`/materias/usuario/{usuario_id}?page=${page}&per_page=${perPage}`),
  );
}

export async function getPromedio(): Promise<Promedio> {
  return apiClient<Promedio>(withUsuarioId("/materias/promedio/{usuario_id}"));
}

export async function createCursada(body: CursadaCreate): Promise<Cursada> {
  return apiClient<Cursada>("/materias/usuario", { method: "POST", body });
}

export async function updateCursada(id: number, body: CursadaUpdate): Promise<Cursada> {
  return apiClient<Cursada>(`/materias/cursada/${id}`, { method: "PATCH", body });
}

export async function deleteCursada(id: number): Promise<void> {
  return apiClient<void>(`/materias/cursada/${id}`, { method: "DELETE" });
}
