// specs/recordatorio.ts — ver INTEGRACION_FRONT.md §2.9. La usan la agenda
// global (`recordatorioSpec()`, sin materia) y la Sección Recordatorios del
// detalle de materia de Integrante 3 (`recordatorioSpec(materiaId)`, fija).
//
// La fecha futura la valida el backend (422 → useApiForm mapea a `fecha`);
// EntityForm no tiene reglas de validación propias.
import type { FormSpec } from "../../components";
import { createRecordatorio, deleteRecordatorio } from "./service";
import type { Recordatorio, RecordatorioCreate } from "../../api/types";

export type RecordatorioForm = {
  titulo: string;
  fecha: string;
  tipo: string;
};

export const recordatorioInitial: RecordatorioForm = {
  titulo: "",
  fecha: "",
  tipo: "parcial",
};

export function recordatorioSpec(materiaId?: number): FormSpec<RecordatorioForm> {
  return {
    title: (item) => (item ? "Editar recordatorio" : "Nuevo recordatorio"),
    fields: [
      { name: "titulo", label: "Título", type: "text", required: true, max: 150 },
      { name: "fecha", label: "Fecha y hora", type: "datetime", required: true },
      {
        name: "tipo",
        label: "Tipo",
        type: "select",
        required: true,
        options: [
          { value: "parcial", label: "Parcial" },
          { value: "tp", label: "TP" },
          { value: "final", label: "Final" },
          { value: "otro", label: "Otro" },
        ],
      },
    ],
    submit: {
      create: (values) => crear(values, materiaId),
      // No hay PATCH /recordatorios/{id} todavía (gap documentado en
      // INTEGRACION_FRONT.md §1.7) → borrar + recrear con los datos nuevos.
      update: async (id, values) => {
        await deleteRecordatorio(Number(id));
        return crear(values, materiaId);
      },
    },
    onError: { "422": "fields" },
    invalidates: () => [["recordatorios"]],
  };
}

function crear(values: RecordatorioForm, materiaId?: number): Promise<Recordatorio> {
  return createRecordatorio({
    titulo: values.titulo,
    // datetime-local no lleva timezone; se interpreta como hora local.
    fecha: new Date(values.fecha).toISOString(),
    tipo: values.tipo,
    materia_id: materiaId ?? null,
  } satisfies RecordatorioCreate);
}

export function recordatorioFormInitial(r?: Recordatorio): RecordatorioForm {
  if (!r) return recordatorioInitial;
  return {
    titulo: r.titulo,
    fecha: r.fecha.slice(0, 16),
    tipo: r.tipo,
  };
}
