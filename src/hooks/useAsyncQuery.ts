// Helper de async enganchado a React.
// Infra TEMPORAL hasta que Int. 1 deje TanStack Query configurado (§2.2 del doc);
// mientras tanto replicamos la misma forma `{ data, loading, error, refetch }` que ya
// usa `features/convenios`.
import { useCallback, useEffect, useState } from "react";

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

export function useAsyncAction<TParams extends unknown[], TResult>(
  action: (...args: TParams) => Promise<TResult>,
) {
  const [state, setState] = useState<{ loading: boolean; error: unknown; data: TResult | null }>({
    loading: false,
    error: null,
    data: null,
  });

  const run = useCallback(
    async (...args: TParams): Promise<TResult> => {
      setState({ loading: true, error: null, data: null });
      try {
        const data = await action(...args);
        setState({ loading: false, error: null, data });
        return data;
      } catch (error) {
        setState({ loading: false, error, data: null });
        throw error;
      }
    },
    [action],
  );

  return { ...state, run };
}