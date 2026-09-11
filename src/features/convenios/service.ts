import { apiClient } from "../../api/client";
import { DEMO_MODE } from "../../api/demo";
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

const universidades: ConvenioItem[] = [
  {
    id: 1,
    nombre: "UBA — Cs. Exactas",
    requisitos: "Regular en 5 materias",
    logo: "U",
    tipo: "universidad",
    link_info: "https://exactas.uba.ar",
    link_inscripcion: "https://exactas.uba.ar/inscripcion",
  },
  {
    id: 2,
    nombre: "UTN — FRBA",
    requisitos: "Aprobación de 1er año",
    logo: "U",
    tipo: "universidad",
    link_info: "https://www.frba.utn.edu.ar",
    link_inscripcion: "https://www.frba.utn.edu.ar/inscripciones",
  },
  {
    id: 3,
    nombre: "UNSAM",
    requisitos: "Promedio ≥ 6",
    logo: "U",
    tipo: "universidad",
    link_info: "https://www.unsam.edu.ar",
    link_inscripcion: "https://www.unsam.edu.ar/ingresantes",
  },
  {
    id: 4,
    nombre: "UNQ",
    requisitos: "Carrera en curso y promedio 7",
    logo: "U",
    tipo: "universidad",
    link_info: "https://www.unq.edu.ar",
    link_inscripcion: "https://www.unq.edu.ar/inscripciones",
  },
];

const talentoTech: ConvenioItem[] = [
  {
    id: 1,
    nombre: "Talento Tech — IA",
    requisitos: "Alumno activo IFTS",
    logo: "T",
    tipo: "talentotech",
    categoria: "ia",
    link_info: "https://talentotech.com/ia",
    link_inscripcion: "https://talentotech.com/ia/inscripcion",
  },
  {
    id: 2,
    nombre: "Talento Tech — UX",
    requisitos: "Alumno activo IFTS",
    logo: "T",
    tipo: "talentotech",
    categoria: "ux",
    link_info: "https://talentotech.com/ux",
    link_inscripcion: "https://talentotech.com/ux/inscripcion",
  },
  {
    id: 3,
    nombre: "Talento Tech — Ciberseg.",
    requisitos: "Alumno activo IFTS",
    logo: "T",
    tipo: "talentotech",
    categoria: "ciberseguridad",
    link_info: "https://talentotech.com/ciberseguridad",
    link_inscripcion: "https://talentotech.com/ciberseguridad/inscripcion",
  },
  {
    id: 4,
    nombre: "Talento Tech — Data",
    requisitos: "Alumno activo IFTS",
    logo: "T",
    tipo: "talentotech",
    categoria: "data",
    link_info: "https://talentotech.com/data",
    link_inscripcion: "https://talentotech.com/data/inscripcion",
  },
];

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function demoPaginate(items: ConvenioItem[], page: number, pageSize = 3): ConvenioPage {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

export async function getConvenios(params: { page?: number; carrera_id?: number } = {}): Promise<ConvenioPage> {
  const page = Math.max(1, params.page ?? 1);

  if (DEMO_MODE) {
    await delay(250);
    return demoPaginate(universidades, page);
  }

  const path =
    params.carrera_id != null ? `/convenios/carrera/${params.carrera_id}` : "/convenios/";
  const res = await apiClient<Paginated<ConvenioApi>>(`${path}?page=${page}`, { auth: false });
  return toConvenioPage(res, mapConvenio);
}

export async function getTalentoTech(
  params: { page?: number; categoria?: string; carrera_id?: number } = {},
): Promise<ConvenioPage> {
  const page = Math.max(1, params.page ?? 1);

  if (DEMO_MODE) {
    await delay(300);
    const items = params.categoria
      ? talentoTech.filter((item) => item.categoria === params.categoria)
      : talentoTech;
    return demoPaginate(items, page);
  }

  const path = params.categoria
    ? `/talentotech/categoria/${encodeURIComponent(params.categoria)}`
    : params.carrera_id != null
      ? `/talentotech/carrera/${params.carrera_id}`
      : "/talentotech/";
  const res = await apiClient<Paginated<TalentoTechApi>>(`${path}?page=${page}`, { auth: false });
  return toConvenioPage(res, mapTalentoTech);
}
