import { useCallback, useEffect, useState } from "react";
import { useAsyncAction } from "../../hooks/useAsyncQuery";
import {
  borrarCarrera,
  borrarCorrelativa,
  borrarMateria,
  crearCarrera,
  crearCorrelativa,
  crearMateria,
  editarCarrera,
  editarMateria,
  getCorrelativas,
} from "./service";
import type {
  Carrera,
  CarreraCreate,
  CarreraUpdate,
  Correlativa,
  CorrelativaCreate,
  Materia,
  MateriaCreate,
  MateriaUpdate,
  Paginated,
} from "../../api/types";

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

// A diferencia de `useAsync`, acepta `materiaId: null` y no dispara ningún
// fetch en ese caso (no hay "materia_id=0" válido en el backend) — el panel
// de correlativas empieza sin materia elegida.
export function useCorrelativas(materiaId: number | null) {
  const [state, setState] = useState<{ data: Paginated<Correlativa> | null; loading: boolean; error: unknown }>({
    data: null,
    loading: false,
    error: null,
  });

  const load = useCallback(() => {
    if (materiaId == null) {
      setState({ data: null, loading: false, error: null });
      return () => {};
    }

    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));

    getCorrelativas(materiaId)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ data: null, loading: false, error });
      });

    return () => {
      active = false;
    };
  }, [materiaId]);

  useEffect(() => load(), [load]);

  return { ...state, refetch: load };
}

export function useCrearCorrelativa(onSuccess?: Refresh) {
  const action = useAsyncAction<[CorrelativaCreate], Correlativa>((body) => crearCorrelativa(body));
  const run = async (body: CorrelativaCreate) => {
    const result = await action.run(body);
    await onSuccess?.();
    return result;
  };
  return { ...action, run };
}

export function useBorrarCorrelativa(onSuccess?: Refresh) {
  const action = useAsyncAction<[number], void>((id) => borrarCorrelativa(id));
  const run = async (id: number) => {
    await action.run(id);
    await onSuccess?.();
  };
  return { ...action, run };
}
