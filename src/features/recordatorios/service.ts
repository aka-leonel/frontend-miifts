// Tarea del Integrante 3 (SPRINT2_FRONT.md): agenda de recordatorios.
// Identidad desde el token: NO se manda `usuario_id` ni en GET ni en POST/DELETE.
import { apiClient } from "../../api/client";
import { DEMO_MODE } from "../../api/demo";
import type { Paginated, Recordatorio, RecordatorioCreate } from "../../api/types";
import {
  demoCreateRecordatorio,
  demoDeleteRecordatorio,
  demoGetRecordatorios,
} from "./demo";

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
  if (DEMO_MODE) {
    return demoGetRecordatorios(filtros);
  }
  return apiClient<Paginated<Recordatorio>>(`/recordatorios/?${buildQuery(filtros)}`);
}

export async function createRecordatorio(body: RecordatorioCreate): Promise<Recordatorio> {
  if (DEMO_MODE) {
    return demoCreateRecordatorio(body);
  }
  return apiClient<Recordatorio>("/recordatorios/", { method: "POST", body });
}

export async function deleteRecordatorio(id: number): Promise<void> {
  if (DEMO_MODE) {
    return demoDeleteRecordatorio(id);
  }
  return apiClient<void>(`/recordatorios/${id}`, { method: "DELETE" });
}