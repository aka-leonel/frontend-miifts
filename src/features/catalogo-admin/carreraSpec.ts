// specs/carrera.ts (S4-10, admin) — ver INTEGRACION_FRONT.md §2.9.
// Validaciones REQUERIMIENTOS §8: nombre ≥2, duracion_cuatrimestres 1-12.
// No hay catálogo de institutos (`ifts_id`) expuesto por la API: queda como
// número simple, por defecto 1 (único instituto en los datos semilla).
import type { FormSpec } from "../../components";
import { crearCarrera, editarCarrera } from "./service";
import type { Carrera, CarreraCreate } from "../../api/types";

export type CarreraForm = {
  nombre: string;
  duracion_cuatrimestres: string | number;
  ifts_id: string | number;
};

export const carreraInitial: CarreraForm = {
  nombre: "",
  duracion_cuatrimestres: "",
  ifts_id: 1,
};

export function carreraFormInitial(c?: Carrera): CarreraForm {
  if (!c) return carreraInitial;
  return { nombre: c.nombre, duracion_cuatrimestres: c.duracion_cuatrimestres, ifts_id: c.ifts_id };
}

function aBody(values: CarreraForm): CarreraCreate {
  return {
    nombre: values.nombre.trim(),
    duracion_cuatrimestres: Number(values.duracion_cuatrimestres),
    ifts_id: Number(values.ifts_id),
  };
}

export const carreraSpec: FormSpec<CarreraForm> = {
  title: (item) => (item ? "Editar carrera" : "Nueva carrera"),
  fields: [
    { name: "nombre", label: "Nombre", type: "text", required: true },
    { name: "duracion_cuatrimestres", label: "Duración (cuatrimestres)", type: "number", required: true, min: 1, max: 12 },
    { name: "ifts_id", label: "ID de instituto", type: "number", required: true, min: 1 },
  ],
  submit: {
    create: (values) => crearCarrera(aBody(values)),
    update: (id, values) => editarCarrera(Number(id), aBody(values)),
  },
  onError: { "422": "fields" },
  invalidates: () => [["carreras"]],
};
