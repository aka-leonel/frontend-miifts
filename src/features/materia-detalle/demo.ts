import type { Correlativa, Materia } from "../../api/types";

const demoMaterias: Record<number, Materia> = {
  11: { id: 11, carrera_id: 1, nombre: "Análisis Matemático I", codigo: "1.1.1", anio: 1, cuatrimestre: 1 },
  12: { id: 12, carrera_id: 1, nombre: "Programación I", codigo: "1.1.2", anio: 1, cuatrimestre: 1 },
};

const delay = (ms = 200) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function demoGetMateria(id: number): Promise<Materia> {
  await delay();
  return demoMaterias[id] ?? { id, carrera_id: 1, nombre: `Materia #${id}`, codigo: "?", anio: 1, cuatrimestre: 1 };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- firma estable con el service real
export async function demoGetCorrelativas(materiaId: number): Promise<Correlativa[]> {
  await delay();
  return [];
}
