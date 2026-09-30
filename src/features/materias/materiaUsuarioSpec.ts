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

/**
 * Qué muestra/hace el formulario de cursada:
 *  - "alta":     agregar materia. Solo MATERIA y "ESTÁS CURSANDO" (las notas se
 *                cargan después, al entrar a la materia).
 *  - "estado":   editar desde la lista de materias. Solo MATERIA y "ESTÁS CURSANDO".
 *  - "notas":    editar desde el detalle de la materia. Suma NOTA 1, NOTA 2 y FINAL.
 *  - "recursar": la materia estaba desaprobada y se vuelve a cursar: se ponen las
 *                notas viejas en null y pasa a cursando.
 */
export type ModoCursada = "alta" | "estado" | "notas" | "recursar";

function toNota(value: unknown): number | null | undefined {
  if (value === "" || value == null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

// En un PATCH, dejar el campo vacío = borrar la nota (null), no "no tocarla".
function toNotaPatch(value: unknown): number | null {
  return toNota(value) ?? null;
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
export function materiaUsuarioSpec(options: {
  materias: Materia[];
  cursadaActual?: Cursada | null;
  modo?: ModoCursada;
}): FormSpec<MateriaUsuarioForm> {
  const modo: ModoCursada = options.modo ?? (options.cursadaActual ? "notas" : "alta");
  const promocionada = options.cursadaActual?.estado === "promocionada";
  const conNotas = modo === "notas";

  const titulo = modo === "alta" ? "Agregar materia" : modo === "recursar" ? "Recursar materia" : "Editar materia";

  return {
    title: () => titulo,
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
      { name: "cursando", label: "Estás cursando", type: "switch" },
      ...(conNotas
        ? [
            { name: "nota_parcial_1", label: "Nota 1 (1–10)", type: "number" as const, min: 1, max: 10 },
            { name: "nota_parcial_2", label: "Nota 2 (1–10)", type: "number" as const, min: 1, max: 10 },
            promocionada
              ? {
                  name: "examen_final",
                  label: "Final (promoción)",
                  type: "number" as const,
                  min: 1,
                  max: 10,
                  readOnly: true,
                  hint: "Promocionaste: es el promedio de los parciales, no un examen rendido.",
                }
              : { name: "examen_final", label: "Final (1–10)", type: "number" as const, min: 1, max: 10 },
          ]
        : []),
    ],
    submit: {
      // Alta: solo la materia y si la está cursando; las notas vienen después.
      create: (values) =>
        createCursada({
          materia_id: Number(values.materia_id),
          cursando: values.cursando,
        }),
      // PATCH es "parcial": no se re-envía materia_id (se invalida con lockOnEdit).
      update: (id, values) => {
        if (modo === "recursar") {
          // Recursar: notas viejas afuera, pasa a cursando.
          return updateCursada(Number(id), {
            cursando: values.cursando,
            nota_parcial_1: null,
            nota_parcial_2: null,
            examen_final: null,
          });
        }
        if (modo === "notas") {
          return updateCursada(Number(id), {
            cursando: values.cursando,
            nota_parcial_1: toNotaPatch(values.nota_parcial_1),
            nota_parcial_2: toNotaPatch(values.nota_parcial_2),
            // Si promocionó, no se envía examen_final: es de solo lectura acá.
            ...(promocionada ? {} : { examen_final: toNotaPatch(values.examen_final) }),
          });
        }
        return updateCursada(Number(id), { cursando: values.cursando });
      },
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
