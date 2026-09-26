// specs/recordatorio.ts — ver INTEGRACION_FRONT.md §2.9. La usan la agenda

// global (`recordatorioSpec()`, sin materia) y la Sección Recordatorios del

// detalle de materia de Integrante 3 (`recordatorioSpec(materiaId)`, fija).

//

// La fecha futura la valida el backend (422 → useApiForm mapea a `fecha`);

// EntityForm no tiene reglas de validación propias.

import type { FormSpec } from "../../components"

import { createRecordatorio, updateRecordatorio } from "./service"

import type { Recordatorio, RecordatorioCreate } from "../../api/types"

export type RecordatorioForm = {
  titulo: string

  fecha: string

  tipo: string
}

export const recordatorioInitial: RecordatorioForm = {
  titulo: "",

  fecha: "",

  tipo: "parcial",
}

export function recordatorioSpec(
  materiaId?: number,
): FormSpec<RecordatorioForm> {
  return {
    title: (item) => (item ? "Editar recordatorio" : "Nuevo recordatorio"),

    fields: [
      {
        name: "titulo",
        label: "Título",
        type: "text",
        required: true,
        max: 150,
      },

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
    ],

    submit: {
      create: (values) => crear(values, materiaId),

      // PATCH /recordatorios/{id} — edición parcial real.

      update: (id, values) => actualizar(Number(id), values, materiaId),
    },

    onError: { "422": "fields" },

    invalidates: () => [["recordatorios"]],
  }
}

function crear(
  values: RecordatorioForm,
  materiaId?: number,
): Promise<Recordatorio> {
  // datetime-local no lleva timezone; construimos ISO string con offset local
  // para que el backend lo interprete correctamente en UTC-3 (Argentina)
  const localDate = new Date(values.fecha)
  const offsetMinutes = -localDate.getTimezoneOffset() // ej: 180 para UTC-3
  const sign = offsetMinutes >= 0 ? "+" : "-"
  const absOffset = Math.abs(offsetMinutes)
  const hours = String(Math.floor(absOffset / 60)).padStart(2, "0")
  const minutes = String(absOffset % 60).padStart(2, "0")
  const fechaConOffset = `${values.fecha}:00${sign}${hours}:${minutes}`

  return createRecordatorio({
    titulo: values.titulo,
    fecha: fechaConOffset,
    tipo: values.tipo,
    materia_id: materiaId ?? null,
  } satisfies RecordatorioCreate)
}

function actualizar(
  id: number,
  values: RecordatorioForm,
  materiaId?: number,
): Promise<Recordatorio> {
  // PATCH parcial: no se manda materia_id en la agenda global para no
  // desvincular un recordatorio creado desde el detalle de materia.

  // datetime-local no lleva timezone; construimos ISO string con offset local
  const localDate = new Date(values.fecha)
  const offsetMinutes = -localDate.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? "+" : "-"
  const absOffset = Math.abs(offsetMinutes)
  const hours = String(Math.floor(absOffset / 60)).padStart(2, "0")
  const minutes = String(absOffset % 60).padStart(2, "0")
  const fechaConOffset = `${values.fecha}:00${sign}${hours}:${minutes}`

  return updateRecordatorio(id, {
    titulo: values.titulo,
    fecha: fechaConOffset,
    tipo: values.tipo,
    ...(materiaId !== undefined ? { materia_id: materiaId } : {}),
  })
}

export function recordatorioFormInitial(r?: Recordatorio): RecordatorioForm {
  if (!r) return recordatorioInitial

  // El backend devuelve la fecha con timezone (ej: "2026-09-26T07:18:00-03:00").
  // El input datetime-local espera hora local SIN timezone (ej: "2026-09-26T04:18").
  // Convertimos: parseamos el ISO con timezone y formateamos a local datetime-local.
  const fechaLocal = new Date(r.fecha)
  const year = fechaLocal.getFullYear()
  const month = String(fechaLocal.getMonth() + 1).padStart(2, "0")
  const day = String(fechaLocal.getDate()).padStart(2, "0")
  const hours = String(fechaLocal.getHours()).padStart(2, "0")
  const minutes = String(fechaLocal.getMinutes()).padStart(2, "0")
  const fechaLocalStr = `${year}-${month}-${day}T${hours}:${minutes}`

  return {
    titulo: r.titulo,
    fecha: fechaLocalStr,
    tipo: r.tipo,
  }
}
