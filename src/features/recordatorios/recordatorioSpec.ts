// specs/recordatorio.ts — ver INTEGRACION_FRONT.md §2.9. La usan la agenda
// global (`recordatorioSpec()`, sin materia) y la Sección Recordatorios del
// detalle de materia de Integrante 3 (`recordatorioSpec(materiaId)`, fija).
//
// La fecha futura la valida el backend (422 → useApiForm mapea a `fecha`);
// EntityForm no tiene reglas de validación propias.
import type { FormSpec } from "../../components";
import { createRecordatorio, updateRecordatorio } from "./service";
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
      // PATCH /recordatorios/{id} — edición parcial real.
      update: (id, values) => actualizar(Number(id), values, materiaId),
    },
    onError: { "422": "fields" },
    invalidates: () => [["recordatorios"]],
  };
}

// El input datetime-local no lleva timezone: su `.value` es la hora de pared
// tal como se tipeó (ej. "2026-10-01T02:30"), sin info de zona. El backend
// tampoco es timezone-aware (`fecha = Column(DateTime, ...)`, sin
// `timezone=True`, sqlite no guarda offset) — no hace ninguna conversión.
//
// Antes esto se mandaba con `new Date(values.fecha).toISOString()`, que
// interpreta el string como hora LOCAL y lo pasa a UTC (le suma las 3h de
// Argentina). El backend guarda esos números tal cual, sin marca de zona, y
// al mostrarlo el front los vuelve a leer como si ya fueran hora local — de
// ahí el corrimiento de +3h. La fecha tiene que viajar intacta en los dos
// sentidos (mismo criterio que `recordatorioFormInitial` ya usaba al revés).
function normalizarFecha(valor: string): string {
  // "YYYY-MM-DDTHH:mm" (el input no manda segundos) -> completar con ":00".
  return valor.length === 16 ? `${valor}:00` : valor;
}

function crear(values: RecordatorioForm, materiaId?: number): Promise<Recordatorio> {
  return createRecordatorio({
    titulo: values.titulo,
    fecha: normalizarFecha(values.fecha),
    tipo: values.tipo,
    materia_id: materiaId ?? null,
  } satisfies RecordatorioCreate);
}

function actualizar(id: number, values: RecordatorioForm, materiaId?: number): Promise<Recordatorio> {
  // PATCH parcial: no se manda materia_id en la agenda global para no
  // desvincular un recordatorio creado desde el detalle de materia.
  return updateRecordatorio(id, {
    titulo: values.titulo,
    fecha: normalizarFecha(values.fecha),
    tipo: values.tipo,
    ...(materiaId !== undefined ? { materia_id: materiaId } : {}),
  });
}

export function recordatorioFormInitial(r?: Recordatorio): RecordatorioForm {
  if (!r) return recordatorioInitial;
  return {
    titulo: r.titulo,
    fecha: r.fecha.slice(0, 16),
    tipo: r.tipo,
  };
}
