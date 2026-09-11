// SEAM · trabajo de Integrante 1 (Fundaciones).
//
// Estos tipos van a ser GENERADOS con `npm run gen:api` (`openapi-typescript` contra
// `/openapi.json`, ver INTEGRACION_FRONT.md §1.8) y luego alias-eados en este mismo
// archivo con los MISMOS nombres. Acá están calcados a mano del contrato para que
// las features ya compilen; cuando Int. 1 entregue el schema generado, solo se
// reemplaza el contenido de este archivo SIN tocar ninguna feature.

export type Rol = "estudiante" | "admin";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  carrera_id: number;
  fecha_registro: string;
  rol: Rol;
}

export interface Carrera {
  id: number;
  nombre: string;
  duracion_cuatrimestres?: number | null;
  descripcion?: string | null;
}

export interface Materia {
  id: number;
  carrera_id: number;
  nombre: string;
  codigo: string;
  anio: number;
  cuatrimestre: number;
  duracion_cuatrimestres?: number | null;
}

export interface Correlativa {
  id: number;
  materia_id: number;
  requiere_id: number;
  requiere: Materia | null;
}

export type EstadoCursada = "cursando" | "aprobada" | "pendiente";

export interface Cursada {
  id: number;
  usuario_id: number;
  materia_id: number;
  cursando: boolean;
  estado: EstadoCursada;
  nota_parcial_1?: number | null;
  nota_parcial_2?: number | null;
  nota_final?: number | null;
  materia?: Pick<Materia, "id" | "nombre" | "codigo">;
}

export type CursadaCreate = {
  materia_id: number;
  cursando?: boolean;
  nota_parcial_1?: number | null;
  nota_parcial_2?: number | null;
  nota_final?: number | null;
};

export type CursadaUpdate = Partial<Omit<CursadaCreate, "materia_id">>;

export interface Promedio {
  promedio: number | null;
  materias_computadas: number;
}

export interface Recordatorio {
  id: number;
  titulo: string;
  fecha: string;
  tipo: string;
  materia_id?: number | null;
  materia?: Pick<Materia, "id" | "nombre" | "codigo">;
}

export type RecordatorioCreate = {
  titulo: string;
  fecha: string;
  tipo: string;
  materia_id?: number | null;
};

export interface Recurso {
  id: number;
  usuario_id: number;
  fecha_creacion: string;
  titulo: string;
  url: string;
  descripcion: string;
  tipo: string | null;
  materia_id: number;
}

export type RecursoCreate = {
  titulo: string;
  url: string;
  descripcion: string;
  tipo?: string | null;
  materia_id: number;
};

export interface Token {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export { ApiError } from "../lib/apiClient";
export type { ApiFieldErrors } from "../lib/apiClient";