import { useAsync, useAsyncAction } from "../../hooks/useAsyncQuery";
import { createRecurso, deleteRecurso, getRecursosDeMateria, updateRecurso } from "./service";
import type { Recurso, RecursoCreate } from "../../api/types";

export function useRecursosDeMateria(materiaId: number) {
  return useAsync<Recurso[]>(() => getRecursosDeMateria(materiaId), [materiaId]);
}

export function useCrearRecurso(onSuccess?: () => Promise<void> | void) {
  const action = useAsyncAction<[RecursoCreate], Recurso>((body) => createRecurso(body));
  const run = async (body: RecursoCreate) => {
    const result = await action.run(body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}

export function useEditarRecurso(onSuccess?: () => Promise<void> | void) {
  const action = useAsyncAction<[number, RecursoCreate], Recurso>((id, body) => updateRecurso(id, body));
  const run = async (id: number, body: RecursoCreate) => {
    const result = await action.run(id, body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}

export function useBorrarRecurso(onSuccess?: () => Promise<void> | void) {
  const action = useAsyncAction<[number], void>((id) => deleteRecurso(id));
  const run = async (id: number) => {
    await action.run(id);
    await onSuccess?.();
  };
  return { ...action, run };
}
