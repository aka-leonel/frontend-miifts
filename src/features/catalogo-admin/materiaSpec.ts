// specs/materia.ts (S4-10, admin) — ver INTEGRACION_FRONT.md §2.9.
// Validaciones REQUERIMIENTOS §8: anio 1-6, cuatrimestre 1|2, codigo no vacío
// upper. `carrera_id` va fijo (la sección vive dentro de UNA carrera
// seleccionada): no hay selector, igual criterio que `recursoSpec(materiaId)`.
import type { FormSpec } from "../../components";
import { crearMateria, editarMateria } from "./service";
import type { Materia, MateriaCreate, MateriaUpdate } from "../../api/types";

export type MateriaForm = {
  nombre: string;
  codigo: string;
  anio: string | number;
  cuatrimestre: string | number;
};

export const materiaInitial: MateriaForm = {
  nombre: "",
  codigo: "",
  anio: 1,
  cuatrimestre: 1,
};

export function materiaFormInitial(m?: Materia): MateriaForm {
  if (!m) return materiaInitial;
  return { nombre: m.nombre, codigo: m.codigo, anio: m.anio, cuatrimestre: m.cuatrimestre };
}

function campos(values: MateriaForm): Omit<MateriaCreate, "carrera_id"> {
  return {
    nombre: values.nombre.trim(),
    codigo: values.codigo.trim().toUpperCase(),
    anio: Number(values.anio),
    cuatrimestre: Number(values.cuatrimestre),
  };
}

export function materiaSpec(carreraId: number): FormSpec<MateriaForm> {
  return {
    title: (item) => (item ? "Editar materia" : "Nueva materia"),
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "codigo", label: "Código", type: "text", required: true, placeholder: "1.1.1" },
      { name: "anio", label: "Año (1-6)", type: "number", required: true, min: 1, max: 6 },
      { name: "cuatrimestre", label: "Cuatrimestre (1 o 2)", type: "number", required: true, min: 1, max: 2 },
    ],
    submit: {
      create: (values) => crearMateria({ ...campos(values), carrera_id: carreraId } satisfies MateriaCreate),
      update: (id, values) => editarMateria(Number(id), campos(values) satisfies MateriaUpdate),
    },
    onError: { "422": "fields" },
    invalidates: () => [["materias-carrera", carreraId]],
  };
}
