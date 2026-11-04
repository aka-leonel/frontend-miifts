// ABM de TalentoTech (Panel Admin, ver decisions D016). El contract exige
// `carrera_ids` (mín. 1) O `todas_las_carreras: true`, nunca ambos; esa
// invariante se valida en `aBody` antes de pegarle al backend. `link_inscripcion`
// se valida como URL http(s) acá, igual que en convenios.
import { ApiError } from "../../api/client";
import type { FormFieldSpec, FormOption, FormSpec } from "../../components";
import type { TalentoTech, TalentoTechCreate } from "../../api/types";
import { crearTalentoTech, editarTalentoTech } from "./service";

export type TalentoTechForm = {
  institucion: string;
  nombre_curso: string;
  categoria: string;
  descripcion: string;
  duracion: string;
  modalidad_cursada: string;
  dificultad: string;
  link_inscripcion: string;
  todas_las_carreras: boolean;
  carrera_ids: string[];
};

export const talentoTechInitial: TalentoTechForm = {
  institucion: "",
  nombre_curso: "",
  categoria: "",
  descripcion: "",
  duracion: "",
  modalidad_cursada: "",
  dificultad: "",
  link_inscripcion: "",
  todas_las_carreras: false,
  carrera_ids: [],
};

export function talentoTechFormInitial(curso?: TalentoTech): TalentoTechForm {
  if (!curso) return talentoTechInitial;
  return {
    institucion: curso.institucion,
    nombre_curso: curso.nombre_curso,
    categoria: curso.categoria,
    descripcion: curso.descripcion,
    duracion: curso.duracion,
    modalidad_cursada: curso.modalidad_cursada,
    dificultad: curso.dificultad ?? "",
    link_inscripcion: curso.link_inscripcion,
    todas_las_carreras: curso.todas_las_carreras,
    carrera_ids: curso.carreras.map((carrera) => String(carrera.id)),
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

function aBody(values: TalentoTechForm): TalentoTechCreate {
  const link = values.link_inscripcion.trim();
  if (!esUrlValida(link)) {
    throw new ApiError(422, "El link de inscripción no es una URL válida.", {
      link_inscripcion: "Tiene que ser una URL válida (http:// o https://).",
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
    nombre_curso: values.nombre_curso.trim(),
    categoria: values.categoria.trim(),
    descripcion: values.descripcion.trim(),
    duracion: values.duracion.trim(),
    modalidad_cursada: values.modalidad_cursada.trim(),
    dificultad: values.dificultad.trim() || null,
    link_inscripcion: link,
    todas_las_carreras: values.todas_las_carreras,
    ...(values.todas_las_carreras ? {} : { carrera_ids: carreraIds }),
  };
}

export function talentoTechSpec(carrerasOptions: FormOption[]): FormSpec<TalentoTechForm> {
  const fields: FormFieldSpec[] = [
    { name: "institucion", label: "Institución", type: "text", required: true, maxLength: 150 },
    { name: "nombre_curso", label: "Nombre del curso", type: "text", required: true, maxLength: 150 },
    {
      name: "categoria",
      label: "Categoría",
      type: "text",
      required: true,
      maxLength: 20,
      hint: "Texto libre (ej. IT). El filtro del listado es por igualdad exacta.",
    },
    { name: "descripcion", label: "Descripción", type: "textarea", required: true },
    { name: "duracion", label: "Duración", type: "text", required: true, maxLength: 50, placeholder: "30hs" },
    {
      name: "modalidad_cursada",
      label: "Modalidad",
      type: "text",
      required: true,
      maxLength: 50,
      placeholder: "Virtual Asincrónico",
    },
    {
      name: "dificultad",
      label: "Dificultad (opcional)",
      type: "text",
      maxLength: 30,
      placeholder: "Introductoria",
    },
    {
      name: "link_inscripcion",
      label: "Link de inscripción",
      type: "url",
      required: true,
      placeholder: "https://...",
    },
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
    title: (item) => (item ? "Editar curso" : "Nuevo curso"),
    fields,
    submit: {
      create: (values) => crearTalentoTech(aBody(values)),
      update: (id, values) => editarTalentoTech(Number(id), aBody(values)),
    },
    onError: { "409": "toast", "422": "fields" },
    invalidates: () => [["talentotech-admin"]],
  };
}
