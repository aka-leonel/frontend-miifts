// SEAM · trabajo de Integrante 1 (Fundaciones).
//
// La mayoría de estos tipos siguen calcados a mano del contrato. Los `*Create`/
// `*Update` de catálogo/correlativas/convenios (Panel Admin, ver decisions D014)
// ya vienen de `npm run gen:api` (`openapi-typescript` contra el backend real,
// ver `schema.d.ts`) — no los edites acá, correr `gen:api` de nuevo y listo.
import type { components } from "./schema";

type S = components["schemas"];

export type Rol = "estudiante" | "admin";

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  carrera_id: number;
  fecha_registro: string;
  rol: Rol;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  carrera_id: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface Carrera {
  id: number;
  nombre: string;
  duracion_cuatrimestres: number;
  ifts_id: number;
}

export type CarreraCreate = S["CarreraCreate"];
export type CarreraUpdate = S["CarreraUpdate"];

export interface Materia {
  id: number;
  carrera_id: number;
  nombre: string;
  codigo: string;
  anio: number;
  cuatrimestre: number;
}

export type MateriaCreate = S["MateriaCreate"];
export type MateriaUpdate = S["MateriaUpdate"];

export interface Correlativa {
  id: number;
  materia_id: number;
  requiere_id: number;
  requiere: Materia | null;
}

export type CorrelativaCreate = S["CorrelativaCreate"];

export type EstadoCursada = "cursando" | "promocionada" | "aprobada" | "desaprobada" | "pendiente";

export interface Cursada {
  id: number;
  usuario_id: number;
  materia_id: number;
  cursando: boolean;
  estado: EstadoCursada;
  nota_parcial_1?: number | null;
  nota_parcial_2?: number | null;
  examen_final?: number | null;
  // Calculado por el backend: si ambos parciales cierran en 7+, es su promedio
  // (promoción); si no, es `examen_final`. Nunca se manda en el body, solo se lee.
  nota_final?: number | null;
  materia?: Pick<Materia, "id" | "nombre" | "codigo">;
}

export type CursadaCreate = {
  materia_id: number;
  cursando?: boolean;
  nota_parcial_1?: number | null;
  nota_parcial_2?: number | null;
  examen_final?: number | null;
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

// Panel Admin (ver decisions D016): forma cruda del backend, sin mapear a la
// forma UI que usa `features/convenios` (estudiante, solo lectura).
export type Convenio = S["ConvenioResponse"];
export type ConvenioCreate = S["ConvenioCreate"];

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