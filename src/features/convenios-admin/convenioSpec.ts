// Panel Admin (ver decisions D016) — validaciones: todos los campos
// requeridos, `link_info` se valida como URL http(s) ACÁ antes de pegarle al
// backend (requirements §6b: "validar formato en el form antes de enviar").
// El backend exige `carrera_ids` (mín. 1) O `todas_las_carreras: true`, nunca
// ambos; esa invariante se valida en `aBody`.
import { ApiError } from "../../api/client";
import type { FormFieldSpec, FormOption, FormSpec } from "../../components";
import { crearConvenio, editarConvenio } from "./service";
import type { Convenio, ConvenioCreate } from "../../api/types";

export type ConvenioForm = {
  institucion: string;
  carrera_destino: string;
  descripcion: string;
  link_info: string;
  todas_las_carreras: boolean;
  carrera_ids: string[];
};

export const convenioInitial: ConvenioForm = {
  institucion: "",
  carrera_destino: "",
  descripcion: "",
  link_info: "",
  todas_las_carreras: false,
  carrera_ids: [],
};

export function convenioFormInitial(c?: Convenio): ConvenioForm {
  if (!c) return convenioInitial;
  return {
    institucion: c.institucion,
    carrera_destino: c.carrera_destino,
    descripcion: c.descripcion,
    link_info: c.link_info,
    todas_las_carreras: c.todas_las_carreras,
    carrera_ids: c.carreras.map((carrera) => String(carrera.id)),
  };
}

function esUrlValida(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function aBody(values: ConvenioForm): ConvenioCreate {
  const link = values.link_info.trim();
  if (!esUrlValida(link)) {
    throw new ApiError(422, "El link no es una URL válida.", {
      link_info: "Tiene que ser una URL válida (http:// o https://).",
    });
  }

  const carreraIds = values.carrera_ids.map(Number).filter((id) => Number.isFinite(id));
  if (!values.todas_las_carreras && carreraIds.length === 0) {
    throw new ApiError(422, "Elegí al menos una carrera de origen.", {
      carrera_ids: "Elegí al menos una carrera o marcá 'Todas las carreras'.",
    });
  }

  return {
    institucion: values.institucion.trim(),
    carrera_destino: values.carrera_destino.trim(),
    descripcion: values.descripcion.trim(),
    link_info: link,
    todas_las_carreras: values.todas_las_carreras,
    ...(values.todas_las_carreras ? {} : { carrera_ids: carreraIds }),
  };
}

export function convenioSpec(carrerasOptions: FormOption[]): FormSpec<ConvenioForm> {
  const fields: FormFieldSpec[] = [
    { name: "institucion", label: "Institución", type: "text", required: true },
    { name: "carrera_destino", label: "Carrera destino", type: "text", required: true },
    { name: "descripcion", label: "Descripción", type: "text", required: true },
    { name: "link_info", label: "Link de información", type: "url", required: true, placeholder: "https://..." },
    {
      name: "todas_las_carreras",
      label: "Disponible para todas las carreras",
      type: "switch",
    },
    {
      name: "carrera_ids",
      label: "Carreras de origen (IFTS)",
      type: "multiselect",
      options: carrerasOptions,
      hint: "Si marcás 'Todas las carreras', esta selección se ignora.",
    },
  ];

  return {
    title: (item) => (item ? "Editar convenio" : "Nuevo convenio"),
    fields,
    submit: {
      create: (values) => crearConvenio(aBody(values)),
      update: (id, values) => editarConvenio(Number(id), aBody(values)),
    },
    onError: { "409": "toast", "422": "fields" },
    invalidates: () => [["convenios-admin"]],
  };
}
