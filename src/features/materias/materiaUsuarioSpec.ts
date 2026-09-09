import type { FormSpec } from "../../components";
import type { Materia } from "../../api/types";
import { createCursada, updateCursada } from "./service";

export type MateriaUsuarioForm = {
  materia_id: string | number;
  cursando: boolean;
  nota_parcial_1?: string | number | null;
  nota_parcial_2?: string | number | null;
  nota_final?: string | number | null;
};

function toNota(value: unknown): number | null | undefined {
  if (value === "" || value == null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * fieldSpec para el `<FormModal>` de agregar/editar cursada (§2.9 del doc).
 * Opciones de materia resueltas con `useMateriasDeCarrera(usuario.carrera_id)` (Int. 2).
 */
export function materiaUsuarioSpec(options: { materias: Materia[] }): FormSpec<MateriaUsuarioForm> {
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
      { name: "nota_final", label: "Final (1–10)", type: "number", min: 1, max: 10 },
    ],
    submit: {
      create: (values) =>
        createCursada({
          materia_id: Number(values.materia_id),
          cursando: values.cursando,
          nota_parcial_1: toNota(values.nota_parcial_1),
          nota_parcial_2: toNota(values.nota_parcial_2),
          nota_final: toNota(values.nota_final),
        }),
      // PATCH es "parcial": no se re-envía materia_id (se invalida con lockOnEdit).
      update: (id, values) =>
        updateCursada(Number(id), {
          cursando: values.cursando,
          nota_parcial_1: toNota(values.nota_parcial_1),
          nota_parcial_2: toNota(values.nota_parcial_2),
          nota_final: toNota(values.nota_final),
        }),
    },
    onError: { 409: "toast", 422: "fields" },
    invalidates: () => [["mis-materias"], ["promedio"]],
  };
}

export function materiaUsuarioInitial(item?: { materia_id?: number; cursando?: boolean; nota_parcial_1?: number | null; nota_parcial_2?: number | null; nota_final?: number | null }): MateriaUsuarioForm {
  return {
    materia_id: item?.materia_id ? String(item.materia_id) : "",
    cursando: item?.cursando ?? true,
    nota_parcial_1: item?.nota_parcial_1 ?? "",
    nota_parcial_2: item?.nota_parcial_2 ?? "",
    nota_final: item?.nota_final ?? "",
  };
}