import { useAsync, useAsyncAction } from "../../hooks/useAsyncQuery";
import {
  borrarTalentoTech,
  crearTalentoTech,
  editarTalentoTech,
  getTalentoTechAdmin,
} from "./service";
import type { Paginated, TalentoTech, TalentoTechCreate } from "../../api/types";

type Refresh = () => Promise<void> | void;

export function useTalentoTechAdmin(params: { page?: number } = {}) {
  return useAsync<Paginated<TalentoTech>>(() => getTalentoTechAdmin(params), [params.page]);
}

export function useBorrarTalentoTech(onSuccess?: Refresh) {
  const action = useAsyncAction<[number], void>((id) => borrarTalentoTech(id));
  const run = async (id: number) => {
    await action.run(id);
    await onSuccess?.();
  };
  return { ...action, run };
}

// El FormModal llama a `create`/`update` del spec; los hooks de creación y
// edición no hacen falta acá porque el modal ya maneja el loading y el error.
// Se dejan exportados por consistencia con convenios-admin.
export function useCrearTalentoTech(onSuccess?: Refresh) {
  const action = useAsyncAction<[TalentoTechCreate], TalentoTech>((body) => crearTalentoTech(body));
  const run = async (body: TalentoTechCreate) => {
    const result = await action.run(body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}

export function useEditarTalentoTech(onSuccess?: Refresh) {
  const action = useAsyncAction<[number, TalentoTechCreate], TalentoTech>((id, body) =>
    editarTalentoTech(id, body),
  );
  const run = async (id: number, body: TalentoTechCreate) => {
    const result = await action.run(id, body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}
