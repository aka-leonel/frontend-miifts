import { useAsync, useAsyncAction } from "../../hooks/useAsyncQuery";
import {
  createCursada,
  deleteCursada,
  getMisMaterias,
  getPromedio,
  updateCursada,
} from "./service";
import type { Cursada, CursadaCreate, CursadaUpdate, Paginated, Promedio } from "../../api/types";

export type Refresh = () => Promise<void> | void;

export function useMisMaterias(page = 1) {
  return useAsync<Paginated<Cursada>>(() => getMisMaterias(page), [page]);
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