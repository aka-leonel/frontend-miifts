import type { Recurso, RecursoCreate } from "../../api/types";

let demoRecursos: Recurso[] = [
  {
    id: 901,
    usuario_id: 1,
    fecha_creacion: "2026-09-01T00:00:00",
    titulo: "Apunte de la unidad 1",
    url: "https://drive.google.com/ejemplo",
    descripcion: "Resumen de la primera unidad.",
    tipo: "pdf",
    materia_id: 11,
  },
];

const delay = (ms = 200) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function demoGetRecursosDeMateria(materiaId: number): Promise<Recurso[]> {
  await delay();
  return demoRecursos.filter((r) => r.materia_id === materiaId);
}

export async function demoCreateRecurso(usuarioId: number, body: RecursoCreate): Promise<Recurso> {
  await delay();
  const recurso: Recurso = {
    id: Date.now(),
    usuario_id: usuarioId,
    fecha_creacion: new Date().toISOString(),
    titulo: body.titulo,
    url: body.url,
    descripcion: body.descripcion,
    tipo: body.tipo ?? null,
    materia_id: body.materia_id,
  };
  demoRecursos = [...demoRecursos, recurso];
  return recurso;
}

export async function demoUpdateRecurso(id: number, body: RecursoCreate): Promise<Recurso> {
  await delay();
  demoRecursos = demoRecursos.map((r) => (r.id === id ? { ...r, ...body } : r));
  return demoRecursos.find((r) => r.id === id)!;
}

export async function demoDeleteRecurso(id: number): Promise<void> {
  await delay();
  demoRecursos = demoRecursos.filter((r) => r.id !== id);
}
