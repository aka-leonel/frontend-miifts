// S4-10 (Admin catálogo, opcional) — ABM real de carreras y materias.
// A diferencia del resto de las features, esta NO tiene fallback DEMO_MODE:
// el propio ticket pide "sin mocks", y solo lo usa `usuario.rol === "admin"`,
// que siempre está logueado contra el backend real.
import { apiClient } from "../../api/client";
import type {
  Carrera,
  CarreraCreate,
  CarreraUpdate,
  Correlativa,
  CorrelativaCreate,
  Materia,
  MateriaCreate,
  MateriaUpdate,
  Paginated,
} from "../../api/types";

export async function crearCarrera(body: CarreraCreate): Promise<Carrera> {
  return apiClient<Carrera>("/materias/carreras", { method: "POST", body });
}

export async function editarCarrera(id: number, body: CarreraUpdate): Promise<Carrera> {
  return apiClient<Carrera>(`/materias/carreras/${id}`, { method: "PUT", body });
}

export async function borrarCarrera(id: number): Promise<void> {
  return apiClient<void>(`/materias/carreras/${id}`, { method: "DELETE" });
}

export async function crearMateria(body: MateriaCreate): Promise<Materia> {
  return apiClient<Materia>("/materias/", { method: "POST", body });
}

export async function editarMateria(id: number, body: MateriaUpdate): Promise<Materia> {
  return apiClient<Materia>(`/materias/${id}`, { method: "PUT", body });
}

export async function borrarMateria(id: number): Promise<void> {
  return apiClient<void>(`/materias/${id}`, { method: "DELETE" });
}

export async function getCorrelativas(materiaId: number): Promise<Paginated<Correlativa>> {
  return apiClient<Paginated<Correlativa>>(`/materias/correlativas/${materiaId}?per_page=100`);
}

export async function crearCorrelativa(body: CorrelativaCreate): Promise<Correlativa> {
  return apiClient<Correlativa>("/materias/correlativas", { method: "POST", body });
}

export async function borrarCorrelativa(id: number): Promise<void> {
  return apiClient<void>(`/materias/correlativas/${id}`, { method: "DELETE" });
}
