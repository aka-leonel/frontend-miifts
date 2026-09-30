// Panel Admin (ver decisions D016) — validaciones: todos los campos
// requeridos, `link_info` se valida como URL http(s) ACÁ antes de pegarle al
// backend (requirements §6b: "validar formato en el form antes de enviar").
// PUT reemplaza el registro completo (no hay `ConvenioUpdate` parcial), así
// que create/update mandan el mismo body.
import { ApiError } from "../../api/client";
import type { FormFieldSpec, FormOption, FormSpec } from "../../components";
import { crearConvenio, editarConvenio } from "./service";
import type { Convenio, ConvenioCreate } from "../../api/types";

export type ConvenioForm = {
  institucion: string;
  carrera_destino: string;
  descripcion: string;
  link_info: string;
  carrera_id: string | number;
};

export const convenioInitial: ConvenioForm = {
  institucion: "",
  carrera_destino: "",
  descripcion: "",
  link_info: "",
  carrera_id: "",
};

export function convenioFormInitial(c?: Convenio): ConvenioForm {
  if (!c) return convenioInitial;
  return {
    institucion: c.institucion,
    carrera_destino: c.carrera_destino,
    descripcion: c.descripcion,
    link_info: c.link_info,
    carrera_id: c.carrera_id,
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

  return {
    institucion: values.institucion.trim(),
    carrera_destino: values.carrera_destino.trim(),
    descripcion: values.descripcion.trim(),
    link_info: link,
    carrera_id: Number(values.carrera_id),
  };
}

export function convenioSpec(carrerasOptions: FormOption[]): FormSpec<ConvenioForm> {
  const fields: FormFieldSpec[] = [
    { name: "institucion", label: "Institución", type: "text", required: true },
    { name: "carrera_destino", label: "Carrera destino", type: "text", required: true },
    { name: "descripcion", label: "Descripción", type: "text", required: true },
    { name: "link_info", label: "Link de información", type: "url", required: true, placeholder: "https://..." },
    { name: "carrera_id", label: "Carrera (IFTS)", type: "select", required: true, options: carrerasOptions },
  ];

  return {
    title: (item) => (item ? "Editar convenio" : "Nuevo convenio"),
    fields,
    submit: {
      create: (values) => crearConvenio(aBody(values)),
      update: (id, values) => editarConvenio(Number(id), aBody(values)),
    },
    onError: { "422": "fields" },
    invalidates: () => [["convenios-admin"]],
  };
}
