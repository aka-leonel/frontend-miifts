import { useEffect, useState } from "react";
import { getConvenios, getTalentoTech, type ConvenioPage } from "./service";

export function useConvenios(params: { page?: number; carrera_id?: number } = {}) {
  const [state, setState] = useState<{ data: ConvenioPage | null; loading: boolean; error: unknown }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    setState({ data: null, loading: true, error: null });

    getConvenios(params)
      .then((data) => {
        if (mounted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      mounted = false;
    };
  }, [params.page, params.carrera_id]);

  return state;
}

export function useTalentoTech(params: { page?: number; categoria?: string; carrera_id?: number } = {}) {
  const [state, setState] = useState<{ data: ConvenioPage | null; loading: boolean; error: unknown }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    setState({ data: null, loading: true, error: null });

    getTalentoTech(params)
      .then((data) => {
        if (mounted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({ data: null, loading: false, error });
        }
      });

    return () => {
      mounted = false;
    };
  }, [params.page, params.categoria, params.carrera_id]);

  return state;
}
