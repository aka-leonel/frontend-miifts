// specs/recordatorio.ts (agenda global) — ver INTEGRACION_FRONT.md §2.9.
// Sin campo de materia: el alta desde `/recordatorios` no fija una materia
// (la que sí la fija vive en el detalle de materia, tarea de Integrante 3).
// La fecha futura la valida el backend (422 → useApiForm mapea a `fecha`);
// EntityForm no tiene reglas de validación propias.
import type { FormFieldSpec } from "../../components";
import type { FormSpec } from "../../components";
import { createRecordatorio } from "./service";
import type { Recordatorio, RecordatorioCreate } from "../../api/types";

export type RecordatorioForm = {
  titulo: string;
  fecha: string;
  tipo: string;
};

export const recordatorioFields: FormFieldSpec[] = [
  { name: "titulo", label: "Título", type: "text", required: true, max: 150 },
  {
    name: "fecha",
    label: "Fecha y hora",
    type: "datetime",
    required: true,
  },
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
];

export const recordatorioInitial: RecordatorioForm = {
  titulo: "",
  fecha: "",
  tipo: "parcial",
};

export const recordatorioSpec: FormSpec<RecordatorioForm> = {
  title: () => "Nuevo recordatorio",
  fields: recordatorioFields,
  submit: {
    create: (values) =>
      createRecordatorio({
        titulo: values.titulo,
        // datetime-local no lleva timezone; se interpreta como hora local.
        fecha: new Date(values.fecha).toISOString(),
        tipo: values.tipo,
      } satisfies RecordatorioCreate),
    // No hay edición de recordatorios en la agenda global todavía (no hay
    // `PATCH /recordatorios/{id}`, ver §1.7); FormModal solo se abre en modo alta.
    update: () => Promise.reject(new Error("Editar recordatorios no está soportado todavía.")),
  },
  onError: { "422": "fields" },
};

export type { Recordatorio };
