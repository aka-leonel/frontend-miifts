// Integrante 4 (INTEGRACION_FRONT.md §2.14): Agenda global de recordatorios.
// service.ts ya pegaba a la API real; acá solo faltaban los hooks.
import { useAsync, useAsyncAction } from "../../hooks/useAsyncQuery";
import {
  createRecordatorio,
  deleteRecordatorio,
  getRecordatorios,
  type RecordatorioFiltros,
} from "./service";
import type { Paginated, Recordatorio, RecordatorioCreate } from "../../api/types";

export type Refresh = () => Promise<void> | void;

export function useRecordatorios(filtros: RecordatorioFiltros = {}) {
  return useAsync<Paginated<Recordatorio>>(
    () => getRecordatorios(filtros),
    [filtros.tipo, filtros.desde, filtros.hasta, filtros.materia_id, filtros.page, filtros.per_page],
  );
}

export function useCrearRecordatorio(onSuccess?: Refresh) {
  const action = useAsyncAction<[RecordatorioCreate], Recordatorio>((body) => createRecordatorio(body));
  const run = async (body: RecordatorioCreate) => {
    const result = await action.run(body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}

export function useBorrarRecordatorio(onSuccess?: Refresh) {
  const action = useAsyncAction<[number], void>((id) => deleteRecordatorio(id));
  const run = async (id: number) => {
    await action.run(id);
    await onSuccess?.();
  };
  return { ...action, run };
}
