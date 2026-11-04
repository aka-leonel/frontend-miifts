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
  link_info: string;
};

export type ConvenioPage = {
  items: ConvenioItem[];
  page: number;
  totalPages: number;
};

function mapConvenio(c: Convenio): ConvenioItem {
  return {
    id: c.id,
    nombre: c.institucion,
    carrera_destino: c.carrera_destino,
    descripcion: c.descripcion,
    carreras: c.carreras,
    todas_las_carreras: c.todas_las_carreras,
    logo: c.institucion.trim().charAt(0).toUpperCase() || "U",
    link_info: c.link_info,
  };
}

function toConvenioPage(res: Paginated<Convenio>): ConvenioPage {
  return { items: res.items.map(mapConvenio), page: res.page, totalPages: res.total_pages };
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
  return toConvenioPage(res);
}
