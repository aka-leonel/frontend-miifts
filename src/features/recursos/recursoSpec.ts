// specs/recurso.ts — ver INTEGRACION_FRONT.md §2.9. `materiaId` va fijo
// (la Sección Recursos vive dentro de UNA materia, §2.4): no hay selector,
// se manda solcito en el submit.
import { ApiError } from "../../lib/apiClient";
import type { FormSpec } from "../../components";
import { createRecurso, updateRecurso } from "./service";
import type { Recurso, RecursoCreate } from "../../api/types";

export type RecursoForm = {
  titulo: string;
  url: string;
  descripcion: string;
  tipo: string;
};

export const recursoInitial: RecursoForm = {
  titulo: "",
  url: "",
  descripcion: "",
  tipo: "",
};

function urlValida(valor: string): boolean {
  try {
    const u = new URL(valor);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function aBody(values: RecursoForm, materiaId: number): RecursoCreate {
  if (!urlValida(values.url)) {
    // Mismo canal que un 422 real: useApiForm lo mapea al campo `url`.
    throw new ApiError(422, "Tiene que ser una URL http(s) válida.", { url: "Tiene que ser una URL http(s) válida." });
  }
  return {
    titulo: values.titulo.trim(),
    url: values.url.trim(),
    descripcion: values.descripcion.trim(),
    tipo: values.tipo.trim() || null,
    materia_id: materiaId,
  };
}

export function recursoSpec(materiaId: number): FormSpec<RecursoForm> {
  return {
    title: (item) => (item ? "Editar recurso" : "Agregar recurso"),
    fields: [
      { name: "titulo", label: "Título", type: "text", required: true, max: 150 },
      { name: "url", label: "Link (URL)", type: "url", required: true, placeholder: "https://…" },
      { name: "descripcion", label: "Descripción", type: "text", required: true },
      { name: "tipo", label: "Tipo (opcional)", type: "text", placeholder: "apunte, video, práctica…" },
    ],
    submit: {
      create: (values) => createRecurso(aBody(values, materiaId)),
      update: (id, values) => updateRecurso(Number(id), aBody(values, materiaId)),
    },
    // El 403 (recurso de otro dueño) igual termina en toast: FormModal llama
    // a applyApiError() para cualquier error que no traiga errors[] de 422,
    // sin necesidad de declararlo acá (el tipo de `onError` solo admite
    // 409/422).
    onError: { "422": "fields" },
    invalidates: () => [["recursos-materia", materiaId]],
  };
}

export function recursoFormInitial(r?: Recurso): RecursoForm {
  if (!r) return recursoInitial;
  return { titulo: r.titulo, url: r.url, descripcion: r.descripcion, tipo: r.tipo ?? "" };
}
