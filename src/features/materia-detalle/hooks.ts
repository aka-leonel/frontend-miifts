import { useAsync } from "../../hooks/useAsyncQuery";
import { getCorrelativas, getMateria } from "./service";
import type { Correlativa, Materia } from "../../api/types";

export function useMateria(id: number) {
  return useAsync<Materia>(() => getMateria(id), [id]);
}

export function useCorrelativas(id: number) {
  return useAsync<Correlativa[]>(() => getCorrelativas(id), [id]);
}
