import { apiClient } from "../../api/client";
import type { Paginated, Recordatorio, RecordatorioCreate } from "../../api/types";

export type RecordatorioFiltros = {
  tipo?: string;
  desde?: string;
  hasta?: string;
  materia_id?: number;
  page?: number;
  per_page?: number;
};

function buildQuery(filtros: RecordatorioFiltros): string {
  const params = new URLSearchParams();
  params.set("page", String(filtros.page ?? 1));
  params.set("per_page", String(filtros.per_page ?? 20));
  if (filtros.tipo) params.set("tipo", filtros.tipo);
  if (filtros.desde) params.set("desde", filtros.desde);
  if (filtros.hasta) params.set("hasta", filtros.hasta);
  if (filtros.materia_id != null) params.set("materia_id", String(filtros.materia_id));
  return params.toString();
}

export async function getRecordatorios(filtros: RecordatorioFiltros = {}): Promise<Paginated<Recordatorio>> {
  return apiClient<Paginated<Recordatorio>>(`/recordatorios/?${buildQuery(filtros)}`);
}

export async function createRecordatorio(body: RecordatorioCreate): Promise<Recordatorio> {
  return apiClient<Recordatorio>("/recordatorios/", { method: "POST", body });
}

export async function deleteRecordatorio(id: number): Promise<void> {
  return apiClient<void>(`/recordatorios/${id}`, { method: "DELETE" });
}
