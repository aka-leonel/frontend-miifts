import { useAsyncAction } from "../../hooks/useAsyncQuery";
import { borrarCarrera, borrarMateria, crearCarrera, crearMateria, editarCarrera, editarMateria } from "./service";
import type { Carrera, CarreraCreate, CarreraUpdate, Materia, MateriaCreate, MateriaUpdate } from "../../api/types";

type Refresh = () => Promise<void> | void;

export function useCrearCarrera(onSuccess?: Refresh) {
  const action = useAsyncAction<[CarreraCreate], Carrera>((body) => crearCarrera(body));
  const run = async (body: CarreraCreate) => {
    const result = await action.run(body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}

export function useEditarCarrera(onSuccess?: Refresh) {
  const action = useAsyncAction<[number, CarreraUpdate], Carrera>((id, body) => editarCarrera(id, body));
  const run = async (id: number, body: CarreraUpdate) => {
    const result = await action.run(id, body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}

export function useBorrarCarrera(onSuccess?: Refresh) {
  const action = useAsyncAction<[number], void>((id) => borrarCarrera(id));
  const run = async (id: number) => {
    await action.run(id);
    await onSuccess?.();
  };
  return { ...action, run };
}

export function useCrearMateria(onSuccess?: Refresh) {
  const action = useAsyncAction<[MateriaCreate], Materia>((body) => crearMateria(body));
  const run = async (body: MateriaCreate) => {
    const result = await action.run(body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}

export function useEditarMateria(onSuccess?: Refresh) {
  const action = useAsyncAction<[number, MateriaUpdate], Materia>((id, body) => editarMateria(id, body));
  const run = async (id: number, body: MateriaUpdate) => {
    const result = await action.run(id, body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}

export function useBorrarMateria(onSuccess?: Refresh) {
  const action = useAsyncAction<[number], void>((id) => borrarMateria(id));
  const run = async (id: number) => {
    await action.run(id);
    await onSuccess?.();
  };
  return { ...action, run };
}
