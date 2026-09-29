import { useAsync, useAsyncAction } from "../../hooks/useAsyncQuery";
import { borrarConvenio, crearConvenio, editarConvenio, getConveniosAdmin } from "./service";
import type { Convenio, ConvenioCreate, Paginated } from "../../api/types";

type Refresh = () => Promise<void> | void;

export function useConveniosAdmin(params: { page?: number } = {}) {
  return useAsync<Paginated<Convenio>>(() => getConveniosAdmin(params), [params.page]);
}

export function useCrearConvenio(onSuccess?: Refresh) {
  const action = useAsyncAction<[ConvenioCreate], Convenio>((body) => crearConvenio(body));
  const run = async (body: ConvenioCreate) => {
    const result = await action.run(body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}

export function useEditarConvenio(onSuccess?: Refresh) {
  const action = useAsyncAction<[number, ConvenioCreate], Convenio>((id, body) => editarConvenio(id, body));
  const run = async (id: number, body: ConvenioCreate) => {
    const result = await action.run(id, body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}

export function useBorrarConvenio(onSuccess?: Refresh) {
  const action = useAsyncAction<[number], void>((id) => borrarConvenio(id));
  const run = async (id: number) => {
    await action.run(id);
    await onSuccess?.();
  };
  return { ...action, run };
}
