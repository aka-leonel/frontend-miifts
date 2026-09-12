import { apiClient } from "../../api/client";
import type { Paginated } from "../../api/types";

export type ConvenioItem = {
  id: number;
  nombre: string;
  requisitos: string;
  logo: string;
  tipo: "universidad" | "talentotech";
  categoria?: string;
  link_info?: string;
  link_inscripcion?: string;
};

export type ConvenioPage = {
  items: ConvenioItem[];
  page: number;
  totalPages: number;
};

// Shape real del backend (INTEGRACION_FRONT.md §1.6 "Convenios y TalentoTech").
// Se mapean a ConvenioItem para no tocar ConveniosScreen.tsx.
interface ConvenioApi {
  id: number;
  institucion: string;
  carrera_destino: string;
  descripcion: string;
  link_info: string;
  carrera_id: number;
}

interface TalentoTechApi {
  id: number;
  carrera_id: number;
  nombre_curso: string;
  categoria: string;
  descripcion: string;
  duracion: string;
  link_inscripcion: string;
}

function mapConvenio(c: ConvenioApi): ConvenioItem {
  return {
    id: c.id,
    nombre: c.institucion,
    requisitos: c.carrera_destino || c.descripcion,
    logo: c.institucion.charAt(0).toUpperCase() || "U",
    tipo: "universidad",
    link_info: c.link_info,
  };
}

function mapTalentoTech(t: TalentoTechApi): ConvenioItem {
  return {
    id: t.id,
    nombre: t.nombre_curso,
    requisitos: `${t.categoria} · ${t.duracion}`,
    logo: t.nombre_curso.charAt(0).toUpperCase() || "T",
    tipo: "talentotech",
    categoria: t.categoria,
    link_inscripcion: t.link_inscripcion,
  };
}

function toConvenioPage<T>(res: Paginated<T>, map: (item: T) => ConvenioItem): ConvenioPage {
  return { items: res.items.map(map), page: res.page, totalPages: res.total_pages };
}

export async function getConvenios(params: { page?: number; carrera_id?: number } = {}): Promise<ConvenioPage> {
  const page = Math.max(1, params.page ?? 1);

  const path =
    params.carrera_id != null ? `/convenios/carrera/${params.carrera_id}` : "/convenios/";
  const res = await apiClient<Paginated<ConvenioApi>>(`${path}?page=${page}`, { auth: false });
  return toConvenioPage(res, mapConvenio);
}

export async function getTalentoTech(
  params: { page?: number; categoria?: string; carrera_id?: number } = {},
): Promise<ConvenioPage> {
  const page = Math.max(1, params.page ?? 1);

  const path = params.categoria
    ? `/talentotech/categoria/${encodeURIComponent(params.categoria)}`
    : params.carrera_id != null
      ? `/talentotech/carrera/${params.carrera_id}`
      : "/talentotech/";
  const res = await apiClient<Paginated<TalentoTechApi>>(`${path}?page=${page}`, { auth: false });
  return toConvenioPage(res, mapTalentoTech);
}
