import { ApiError } from "../../api/client";
import type { Cursada, CursadaCreate, CursadaUpdate, EstadoCursada, Paginated, Promedio } from "../../api/types";
import { demoMaterias } from "../catalogo/demo";

// Simula la regla de negocio del backend (§ ver mensaje del equipo de back):
// ambos parciales >= 7 promociona con el promedio de esos parciales; si no,
// el examen final decide aprobada/desaprobada. Solo existe acá porque este
// archivo reemplaza al backend entero en DEMO_MODE — el resto del front NUNCA
// debe reimplementar esto.
function calcularNotaFinalYEstado(input: {
  cursando: boolean;
  nota_parcial_1?: number | null;
  nota_parcial_2?: number | null;
  examen_final?: number | null;
}): { nota_final: number | null; estado: EstadoCursada } {
  if (input.cursando) {
    return { nota_final: null, estado: "cursando" };
  }
  const p1 = input.nota_parcial_1 ?? null;
  const p2 = input.nota_parcial_2 ?? null;
  if (p1 != null && p2 != null && p1 >= 7 && p2 >= 7) {
    return { nota_final: Math.round(((p1 + p2) / 2) * 100) / 100, estado: "promocionada" };
  }
  if (input.examen_final != null) {
    return { nota_final: input.examen_final, estado: input.examen_final >= 4 ? "aprobada" : "desaprobada" };
  }
  return { nota_final: null, estado: "pendiente" };
}

export const demoCursadas: Cursada[] = [
  {
    id: 101,
    usuario_id: 1,
    materia_id: 11,
    cursando: true,
    estado: "cursando",
    nota_parcial_1: 7,
    materia: { id: 11, nombre: "Análisis Matemático I", codigo: "1.1.1" },
  },
  {
    id: 102,
    usuario_id: 1,
    materia_id: 12,
    cursando: false,
    estado: "aprobada",
    nota_parcial_1: 8,
    nota_parcial_2: 8,
    nota_final: 9,
    materia: { id: 12, nombre: "Programación I", codigo: "1.1.2" },
  },
  {
    id: 103,
    usuario_id: 1,
    materia_id: 13,
    cursando: false,
    estado: "pendiente",
    nota_parcial_1: 6,
    nota_parcial_2: 5,
    materia: { id: 13, nombre: "Sistemas Operativos", codigo: "1.1.3" },
  },
  {
    id: 104,
    usuario_id: 1,
    materia_id: 14,
    cursando: false,
    estado: "pendiente",
    materia: { id: 14, nombre: "Inglés Técnico", codigo: "1.1.4" },
  },
  {
    id: 105,
    usuario_id: 1,
    materia_id: 15,
    cursando: false,
    estado: "aprobada",
    nota_parcial_1: 9,
    nota_parcial_2: 10,
    nota_final: 10,
    materia: { id: 15, nombre: "Base de Datos I", codigo: "2.1.1" },
  },
];

const delay = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms));

function paginate<T>(items: T[], page: number, perPage: number): Paginated<T> {
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total: items.length,
    page,
    per_page: perPage,
    total_pages: Math.max(1, Math.ceil(items.length / perPage)),
  };
}

function embedMateria(cursada: Cursada): Cursada {
  if (cursada.materia) {
    return cursada;
  }
  const materia = demoMaterias.find((item) => item.id === cursada.materia_id);
  return materia
    ? { ...cursada, materia: { id: materia.id, nombre: materia.nombre, codigo: materia.codigo } }
    : cursada;
}

export async function demoGetMisMaterias(page = 1, perPage = 20): Promise<Paginated<Cursada>> {
  await delay();
  return paginate(demoCursadas.map(embedMateria), page, perPage);
}

export async function demoGetPromedio(): Promise<Promedio> {
  await delay();
  const computadas = demoCursadas.filter((cursada) => cursada.nota_final != null);
  if (computadas.length === 0) {
    return { promedio: null, materias_computadas: 0 };
  }
  const suma = computadas.reduce((acc, cursada) => acc + (cursada.nota_final as number), 0);
  return { promedio: Math.round((suma / computadas.length) * 100) / 100, materias_computadas: computadas.length };
}

export async function demoCreateCursada(body: CursadaCreate): Promise<Cursada> {
  await delay();
  const exists = demoCursadas.some((cursada) => cursada.materia_id === body.materia_id);
  if (exists) {
    throw new ApiError(409, "Ya tenés cargada esa materia.");
  }
  const materia = demoMaterias.find((item) => item.id === body.materia_id);
  const cursando = body.cursando ?? false;
  const { nota_final, estado } = calcularNotaFinalYEstado({
    cursando,
    nota_parcial_1: body.nota_parcial_1,
    nota_parcial_2: body.nota_parcial_2,
    examen_final: body.examen_final,
  });
  const cursada: Cursada = {
    id: Date.now(),
    usuario_id: 1,
    materia_id: body.materia_id,
    cursando,
    estado,
    nota_parcial_1: body.nota_parcial_1 ?? null,
    nota_parcial_2: body.nota_parcial_2 ?? null,
    examen_final: body.examen_final ?? null,
    nota_final,
    materia: materia ? { id: materia.id, nombre: materia.nombre, codigo: materia.codigo } : undefined,
  };
  demoCursadas.push(cursada);
  return cursada;
}

export async function demoUpdateCursada(id: number, body: CursadaUpdate): Promise<Cursada> {
  await delay();
  const index = demoCursadas.findIndex((cursada) => cursada.id === id);
  if (index === -1) {
    throw new ApiError(404, "No encontramos esa cursada.");
  }
  const merged = { ...demoCursadas[index], ...body };
  const { nota_final, estado } = calcularNotaFinalYEstado({
    cursando: merged.cursando,
    nota_parcial_1: merged.nota_parcial_1,
    nota_parcial_2: merged.nota_parcial_2,
    examen_final: merged.examen_final,
  });
  demoCursadas[index] = { ...merged, nota_final, estado };
  return embedMateria(demoCursadas[index]);
}

export async function demoDeleteCursada(id: number): Promise<void> {
  await delay();
  const index = demoCursadas.findIndex((cursada) => cursada.id === id);
  if (index === -1) {
    throw new ApiError(404, "No encontramos esa cursada.");
  }
  demoCursadas.splice(index, 1);
}