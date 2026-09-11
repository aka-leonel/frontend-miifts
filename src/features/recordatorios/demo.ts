import { ApiError } from "../../api/client";
import type { Paginated, Recordatorio, RecordatorioCreate } from "../../api/types";
import type { RecordatorioFiltros } from "./service";

export const demoTipos: Record<string, { label: string; color: string }> = {
  parcial: { label: "Parcial", color: "bg-violet/20 text-violet" },
  tp: { label: "TP", color: "bg-lime/20 text-lime" },
  final: { label: "Final", color: "bg-green/20 text-green" },
  otro: { label: "Otro", color: "bg-fuchsia-400/20 text-fuchsia-300" },
};

export const demoRecordatorios: Recordatorio[] = [
  {
    id: 201,
    titulo: "Parcial Análisis Matemático I",
    fecha: "2026-09-14T10:00:00",
    tipo: "parcial",
    materia_id: 11,
    materia: { id: 11, nombre: "Análisis Matemático I", codigo: "1.1.1" },
  },
  {
    id: 202,
    titulo: "Entrega TP Programación I",
    fecha: "2026-09-16T23:59:00",
    tipo: "tp",
    materia_id: 12,
    materia: { id: 12, nombre: "Programación I", codigo: "1.1.2" },
  },
  {
    id: 203,
    titulo: "Final Base de Datos I",
    fecha: "2026-09-24T09:00:00",
    tipo: "final",
    materia_id: 15,
    materia: { id: 15, nombre: "Base de Datos I", codigo: "2.1.1" },
  },
  {
    id: 204,
    titulo: "Clase de repaso Sistemas Operativos",
    fecha: "2026-09-28T18:00:00",
    tipo: "otro",
    materia_id: 13,
    materia: { id: 13, nombre: "Sistemas Operativos", codigo: "1.1.3" },
  },
];

const delay = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function demoGetRecordatorios(filtros: RecordatorioFiltros = {}): Promise<Paginated<Recordatorio>> {
  await delay();

  let items = [...demoRecordatorios];
  if (filtros.tipo) items = items.filter((item) => item.tipo === filtros.tipo);
  if (filtros.materia_id != null) items = items.filter((item) => item.materia_id === filtros.materia_id);
  if (filtros.desde) items = items.filter((item) => item.fecha.slice(0, 10) >= filtros.desde!);
  if (filtros.hasta) items = items.filter((item) => item.fecha.slice(0, 10) <= filtros.hasta!);

  items.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  const page = filtros.page ?? 1;
  const perPage = filtros.per_page ?? 20;
  const start = (page - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    total: items.length,
    page,
    per_page: perPage,
    total_pages: Math.max(1, Math.ceil(items.length / perPage)),
  };
}

export async function demoCreateRecordatorio(body: RecordatorioCreate): Promise<Recordatorio> {
  await delay();
  const recordatorio: Recordatorio = {
    id: Date.now(),
    titulo: body.titulo,
    fecha: body.fecha,
    tipo: body.tipo,
    materia_id: body.materia_id ?? null,
  };
  demoRecordatorios.push(recordatorio);
  return recordatorio;
}

export async function demoDeleteRecordatorio(id: number): Promise<void> {
  await delay();
  const index = demoRecordatorios.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new ApiError(404, "No encontramos ese recordatorio.");
  }
  demoRecordatorios.splice(index, 1);
}