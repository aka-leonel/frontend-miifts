import { apiClient } from "../../api/client";
import type { CarreraResumen, Convenio, Paginated } from "../../api/types";

export type ConvenioItem = {
  id: number;
  nombre: string;
  carrera_destino?: string;
  descripcion: string;
  carreras: CarreraResumen[];
  todas_las_carreras: boolean;
  logo: string;
  tipo: "universidad" | "talentotech";
  categoria?: string;
  duracion?: string;
  link_info?: string;
  link_inscripcion?: string;
};

export type ConvenioPage = {
  items: ConvenioItem[];
  page: number;
  totalPages: number;
};

interface TalentoTechApi {
  id: number;
  carrera_id: number;
  nombre_curso: string;
  categoria: string;
  descripcion: string;
  duracion: string;
  link_inscripcion: string;
}

function mapConvenio(c: Convenio): ConvenioItem {
  return {
    id: c.id,
    nombre: c.institucion,
    carrera_destino: c.carrera_destino,
    descripcion: c.descripcion,
    carreras: c.carreras,
    todas_las_carreras: c.todas_las_carreras,
    logo: c.institucion.trim().charAt(0).toUpperCase() || "U",
    tipo: "universidad",
    link_info: c.link_info,
  };
}

function mapTalentoTech(t: TalentoTechApi): ConvenioItem {
  return {
    id: t.id,
    nombre: t.nombre_curso,
    descripcion: t.descripcion,
    carreras: [],
    todas_las_carreras: false,
    logo: t.nombre_curso.trim().charAt(0).toUpperCase() || "T",
    tipo: "talentotech",
    categoria: t.categoria,
    duracion: t.duracion,
    link_inscripcion: t.link_inscripcion,
  };
}

function toConvenioPage<T>(res: Paginated<T>, map: (item: T) => ConvenioItem): ConvenioPage {
  return { items: res.items.map(map), page: res.page, totalPages: res.total_pages };
}

function buildQuery(params: { page?: number; per_page?: number; q?: string }): string {
  const query = new URLSearchParams({
    page: String(Math.max(1, params.page ?? 1)),
    per_page: String(params.per_page ?? 20),
  });
  const q = params.q?.trim();
  if (q) query.set("q", q);
  return query.toString();
}

export async function getConvenios(
  params: { page?: number; per_page?: number; q?: string; carrera_id?: number } = {},
): Promise<ConvenioPage> {
  const path =
    params.carrera_id != null ? `/convenios/carrera/${params.carrera_id}` : "/convenios/";
  const res = await apiClient<Paginated<Convenio>>(`${path}?${buildQuery(params)}`, { auth: false });
  return toConvenioPage(res, mapConvenio);
}

export async function getTalentoTech(
  params: { page?: number; per_page?: number; q?: string; categoria?: string; carrera_id?: number } = {},
): Promise<ConvenioPage> {
  const path = params.categoria
    ? `/talentotech/categoria/${encodeURIComponent(params.categoria)}`
    : params.carrera_id != null
      ? `/talentotech/carrera/${params.carrera_id}`
      : "/talentotech/";
  const res = await apiClient<Paginated<TalentoTechApi>>(`${path}?${buildQuery(params)}`, { auth: false });
  return toConvenioPage(res, mapTalentoTech);
}
