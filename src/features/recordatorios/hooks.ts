import { useAsync } from "../../hooks/useAsyncQuery";
import { getRecordatorios, type RecordatorioFiltros } from "./service";
import type { Paginated, Recordatorio } from "../../api/types";

export function useRecordatorios(filtros: RecordatorioFiltros = {}) {
  return useAsync<Paginated<Recordatorio>>(
    () => getRecordatorios(filtros),
    [filtros.tipo, filtros.desde, filtros.hasta, filtros.materia_id, filtros.page, filtros.per_page],
  );
}
