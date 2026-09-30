import { useAsync, useAsyncAction } from "../../hooks/useAsyncQuery";
import { useMateriasDeCarrera } from "../catalogo/hooks";
import {
  createCursada,
  deleteCursada,
  getMisMaterias,
  getPromedio,
  updateCursada,
} from "./service";
import type { Cursada, CursadaCreate, CursadaUpdate, Paginated, Promedio } from "../../api/types";

export type Refresh = () => Promise<void> | void;

export function useMisMaterias(page = 1, perPage = 20) {
  return useAsync<Paginated<Cursada>>(() => getMisMaterias(page, perPage), [page, perPage]);
}

/**
 * Progreso del plan: materias aprobadas (o promocionadas) sobre el TOTAL de
 * materias de la carrera — no sobre las cursadas cargadas ni las que están en
 * curso. Pide todas las cursadas (per_page 100) para no contar solo la primera
 * página, y el total sale de la lista de materias de la carrera.
 */
export function useProgresoCarrera(carreraId: number) {
  const cursadas = useMisMaterias(1, 100);
  const materias = useMateriasDeCarrera(carreraId);
  const aprobadas = (cursadas.data?.items ?? []).filter((c) => c.estado === "aprobada" || c.estado === "promocionada").length;
  const total = materias.data?.total ?? 0;
  return { aprobadas, total, loading: cursadas.loading || materias.loading, refetch: cursadas.refetch };
}

export function usePromedio() {
  return useAsync<Promedio>(() => getPromedio(), []);
}

export function useCrearCursada(onSuccess?: Refresh) {
  const action = useAsyncAction<[CursadaCreate], Cursada>((body) => createCursada(body));
  const run = async (body: CursadaCreate) => {
    const result = await action.run(body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}

export function useEditarCursada(onSuccess?: Refresh) {
  const action = useAsyncAction<[number, CursadaUpdate], Cursada>((id, body) => updateCursada(id, body));
  const run = async (id: number, body: CursadaUpdate) => {
    const result = await action.run(id, body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}

export function useBorrarCursada(onSuccess?: Refresh) {
  const action = useAsyncAction<[number], void>((id) => deleteCursada(id));
  const run = async (id: number) => {
    await action.run(id);
    await onSuccess?.();
  };
  return { ...action, run };
}