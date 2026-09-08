// src/api/types.ts
//
// Tipos compartidos, calcados del contrato en docs/INTEGRACION_FRONT.md §5.
// Si el backend cambia el contrato, este archivo es lo primero que hay que
// revisar (o regenerar con openapi-typescript, ver §7 del doc).

// ---- envoltorios ----

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  errors?: { campo: string; msg: string }[];
}

// ---- auth ----

export type Rol = "estudiante" | "admin";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  carrera_id: number;
  fecha_registro: string;
  rol: Rol;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest {
  nombre: string;
  email: string;
  password: string;
  carrera_id: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  usuario: Usuario | null;
}

// ---- catálogo ----

export interface Carrera {
  id: number;
  nombre: string;
  duracion_cuatrimestres: number;
  ifts_id: number;
}

export interface Materia {
  id: number;
  nombre: string;
  codigo: string;
  carrera_id: number;
  anio: number;
  cuatrimestre: 1 | 2;
}

export interface Correlativa {
  id: number;
  materia_id: number;
  requiere_id: number;
  requiere: Materia | null;
}

export interface MateriaCreate {
  carrera_id: number;
  nombre: string;
  codigo: string;
  anio: number;
  cuatrimestre: 1 | 2;
}

// ---- cursadas ----
//
// NOTA (ver docs/INTEGRACION_FRONT.md §6, punto 1): la identidad ya sale
// del token en el backend (resuelto en Sprint 2). CursadaCreate NO lleva
// usuario_id a propósito — no lo agregues, el backend lo ignora/no lo espera.

export type EstadoCursada = "cursando" | "aprobada" | "pendiente";

export interface Cursada {
  id: number;
  usuario_id: number;
  materia_id: number;
  cursando: boolean;
  estado: EstadoCursada;
  nota_parcial_1: number | null;
  nota_parcial_2: number | null;
  nota_final: number | null;
}

export interface CursadaCreate {
  materia_id: number;
  cursando?: boolean;
  nota_parcial_1?: number | null;
  nota_parcial_2?: number | null;
  nota_final?: number | null;
}

export interface Promedio {
  promedio: number | null;
  materias_computadas: number;
}

// ---- recursos ----

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

export interface RecursoCreate {
  titulo: string;
  url: string;
  descripcion: string;
  tipo?: string | null;
  materia_id: number;
}

export interface Convenio {
  id: number;
  institucion: string;
  carrera_destino: string;
  descripcion: string;
  link_info: string;
  carrera_id: number;
}

export interface TalentoTech {
  id: number;
  carrera_id: number;
  nombre_curso: string;
  categoria: string;
  descripcion: string;
  duracion: string;
  link_inscripcion: string;
}

// ---- recordatorios ----
//
// NOTA (ver docs/INTEGRACION_FRONT.md §6, punto 1): igual que cursadas,
// la identidad sale del token. RecordatorioCreate NO lleva usuario_id.

export interface Recordatorio {
  id: number;
  titulo: string;
  fecha: string;
  tipo: string;
  usuario_id: number;
  materia_id: number | null;
}

export interface RecordatorioCreate {
  titulo: string;
  fecha: string;
  tipo: string;
  materia_id?: number | null;
}
