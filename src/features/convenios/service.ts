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

export async function getConvenios(params: { page?: number; carrera_id?: number } = {}): Promise<ConvenioPage> {
  await delay(250);

  const page = Math.max(1, params.page ?? 1);
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(universidades.length / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: universidades.slice(start, start + pageSize),
    page,
    totalPages,
  };
}

export async function getTalentoTech(params: { page?: number; categoria?: string; carrera_id?: number } = {}): Promise<ConvenioPage> {
  await delay(300);

  const items = params.categoria ? talentoTech.filter((item) => item.categoria === params.categoria) : talentoTech;
  const page = Math.max(1, params.page ?? 1);
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    totalPages,
  };
}
