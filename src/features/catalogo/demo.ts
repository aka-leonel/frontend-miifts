import type { Carrera, Materia, Paginated } from "../../api/types";

const demoCarreras: Carrera[] = [
  { id: 1, nombre: "Desarrollo de Software", duracion_cuatrimestres: 6 },
  { id: 2, nombre: "Análisis de Sistemas", duracion_cuatrimestres: 6 },
  { id: 3, nombre: "Redes y Comunicaciones", duracion_cuatrimestres: 6 },
  { id: 4, nombre: "Ciberseguridad", duracion_cuatrimestres: 6 },
];

export const demoMaterias: Materia[] = [
  { id: 11, carrera_id: 1, nombre: "Análisis Matemático I", codigo: "1.1.1", anio: 1, cuatrimestre: 1 },
  { id: 12, carrera_id: 1, nombre: "Programación I", codigo: "1.1.2", anio: 1, cuatrimestre: 1 },
  { id: 13, carrera_id: 1, nombre: "Sistemas Operativos", codigo: "1.1.3", anio: 1, cuatrimestre: 2 },
  { id: 14, carrera_id: 1, nombre: "Inglés Técnico", codigo: "1.1.4", anio: 1, cuatrimestre: 2 },
  { id: 15, carrera_id: 1, nombre: "Base de Datos I", codigo: "2.1.1", anio: 2, cuatrimestre: 1 },
  { id: 16, carrera_id: 1, nombre: "Metodologías Ágiles", codigo: "2.1.2", anio: 2, cuatrimestre: 1 },
];

const delay = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms));

function paginate<T>(items: T[], page: number, perPage: number): Paginated<T> {
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total: items.length,
    page,
    per_page: perPage,
    total_pages: Math.max(1, Math.ceil(items.length / perPage)),
  };
}

export async function demoGetCarreras(params: { page?: number; per_page?: number } = {}): Promise<Paginated<Carrera>> {
  await delay();
  return paginate(demoCarreras, params.page ?? 1, params.per_page ?? 20);
}

export async function demoGetMateriasDeCarrera(
  carreraId: number,
  params: { page?: number; per_page?: number } = {},
): Promise<Paginated<Materia>> {
  await delay();
  const items = demoMaterias.filter((materia) => materia.carrera_id === carreraId);
  return paginate(items, params.page ?? 1, params.per_page ?? 100);
}