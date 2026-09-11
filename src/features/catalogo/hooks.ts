import { useCallback, useEffect, useState } from "react";
import { getCarreras, getMateriasDeCarrera } from "./service";
import type { Carrera, Materia, Paginated } from "../../api/types";

export function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: unknown }>({
    data: null,
    loading: true,
    error: null,
  });

  const load = useCallback(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));

    fetcher()
      .then((data) => {
        if (active) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (active) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      active = false;
    };
    // `deps` es a propósito el array que pasa cada caller (fetcher genérico):
    // no puede ser un literal acá.
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  }, deps);

  useEffect(() => load(), [load]);

  const refetch = useCallback(() => load(), [load]);

  return { ...state, refetch };
}

export function useCarreras(params: { page?: number } = {}) {
  return useAsync<Paginated<Carrera>>(() => getCarreras(params), [params.page]);
}

export function useMateriasDeCarrera(carreraId: number) {
  return useAsync<Paginated<Materia>>(() => getMateriasDeCarrera(carreraId), [carreraId]);
}