// Tarea del Integrante 3 (SPRINT2_FRONT.md): "Mi carrera" — cursadas + promedio.
// Capa service (puras, 1 función por endpoint, sin React). Los componentes usan hooks,
// nunca llaman a este archivo directo.
import { apiClient } from "../../api/client";
import { DEMO_MODE } from "../../api/demo";
import { withUsuarioId } from "../../api/scope";
import type { Cursada, CursadaCreate, CursadaUpdate, Paginated, Promedio } from "../../api/types";
import {
  demoCreateCursada,
  demoDeleteCursada,
  demoGetMisMaterias,
  demoGetPromedio,
  demoUpdateCursada,
} from "./demo";

export async function getMisMaterias(page = 1, perPage = 20): Promise<Paginated<Cursada>> {
  if (DEMO_MODE) {
    return demoGetMisMaterias(page, perPage);
  }
  return apiClient<Paginated<Cursada>>(
    withUsuarioId(`/materias/usuario/{usuario_id}?page=${page}&per_page=${perPage}`),
  );
}

export async function getPromedio(): Promise<Promedio> {
  if (DEMO_MODE) {
    return demoGetPromedio();
  }
  return apiClient<Promedio>(withUsuarioId("/materias/promedio/{usuario_id}"));
}

export async function createCursada(body: CursadaCreate): Promise<Cursada> {
  if (DEMO_MODE) {
    return demoCreateCursada(body);
  }
  return apiClient<Cursada>("/materias/usuario", { method: "POST", body });
}

export async function updateCursada(id: number, body: CursadaUpdate): Promise<Cursada> {
  if (DEMO_MODE) {
    return demoUpdateCursada(id, body);
  }
  return apiClient<Cursada>(`/materias/cursada/${id}`, { method: "PATCH", body });
}

export async function deleteCursada(id: number): Promise<void> {
  if (DEMO_MODE) {
    return demoDeleteCursada(id);
  }
  return apiClient<void>(`/materias/cursada/${id}`, { method: "DELETE" });
}