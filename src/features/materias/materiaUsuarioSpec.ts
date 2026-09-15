import type { FormSpec } from "../../components";
import type { Cursada, Materia } from "../../api/types";
import { createCursada, updateCursada } from "./service";

export type MateriaUsuarioForm = {
  materia_id: string | number;
  cursando: boolean;
  nota_parcial_1?: string | number | null;
  nota_parcial_2?: string | number | null;
  // Lo que se manda al backend es `examen_final` — `nota_final` es un campo
  // calculado (promedio de parciales si promociona, si no el examen) que
  // SOLO viaja en la respuesta y nunca en el body de POST/PATCH.
  examen_final?: string | number | null;
};

function toNota(value: unknown): number | null | undefined {
  if (value === "" || value == null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * fieldSpec para el `<FormModal>` de agregar/editar cursada (§2.9 del doc).
 * Opciones de materia resueltas con `useMateriasDeCarrera(usuario.carrera_id)` (Int. 2).
 *
 * `cursadaActual` es la cursada que se está editando (si la hay): cuando el
 * backend ya la marcó "promocionada" (ambos parciales ≥ 7), el campo "Final"
 * pasa a mostrar el `nota_final` calculado en modo lectura — no se manda
 * `examen_final` en ese PATCH, porque no hay examen que editar.
 */
export function materiaUsuarioSpec(options: { materias: Materia[]; cursadaActual?: Cursada | null }): FormSpec<MateriaUsuarioForm> {
  const promocionada = options.cursadaActual?.estado === "promocionada";

  return {
    title: (item) => (item?.materia_id ? "Editar materia" : "Agregar materia"),
    fields: [
      {
        name: "materia_id",
        label: "Materia",
        type: "select",
        required: true,
        lockOnEdit: true,
        options: options.materias.map((materia) => ({
          value: String(materia.id),
          label: `${materia.codigo} · ${materia.nombre}`,
        })),
      },
      { name: "cursando", label: "¿La estás cursando?", type: "switch" },
      { name: "nota_parcial_1", label: "1er parcial (1–10)", type: "number", min: 1, max: 10 },
      { name: "nota_parcial_2", label: "2do parcial (1–10)", type: "number", min: 1, max: 10 },
      promocionada
        ? {
            name: "examen_final",
            label: "Final (promoción)",
            type: "number",
            min: 1,
            max: 10,
            readOnly: true,
            hint: "Promocionaste: es el promedio de los parciales, no un examen rendido.",
          }
        : { name: "examen_final", label: "Final (1–10)", type: "number", min: 1, max: 10 },
    ],
    submit: {
      create: (values) =>
        createCursada({
          materia_id: Number(values.materia_id),
          cursando: values.cursando,
          nota_parcial_1: toNota(values.nota_parcial_1),
          nota_parcial_2: toNota(values.nota_parcial_2),
          examen_final: toNota(values.examen_final),
        }),
      // PATCH es "parcial": no se re-envía materia_id (se invalida con lockOnEdit).
      // Si promocionó, tampoco se envía examen_final: es de solo lectura acá.
      update: (id, values) =>
        updateCursada(Number(id), {
          cursando: values.cursando,
          nota_parcial_1: toNota(values.nota_parcial_1),
          nota_parcial_2: toNota(values.nota_parcial_2),
          ...(promocionada ? {} : { examen_final: toNota(values.examen_final) }),
        }),
    },
    onError: { 409: "toast", 422: "fields" },
    invalidates: () => [["mis-materias"], ["promedio"]],
  };
}

export function materiaUsuarioInitial(item?: {
  materia_id?: number;
  cursando?: boolean;
  nota_parcial_1?: number | null;
  nota_parcial_2?: number | null;
  examen_final?: number | null;
  nota_final?: number | null;
  estado?: Cursada["estado"];
}): MateriaUsuarioForm {
  const promocionada = item?.estado === "promocionada";
  return {
    materia_id: item?.materia_id ? String(item.materia_id) : "",
    cursando: item?.cursando ?? true,
    nota_parcial_1: item?.nota_parcial_1 ?? "",
    nota_parcial_2: item?.nota_parcial_2 ?? "",
    // Promocionada: mostrar el nota_final calculado en el campo de solo lectura.
    examen_final: (promocionada ? item?.nota_final : item?.examen_final) ?? "",
  };
}
