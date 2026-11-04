import { useAsync } from "../../hooks/useAsyncQuery";
import { getConvenios, type ConvenioPage } from "./service";

type ConveniosParams = { page?: number; q?: string; carrera_id?: number };

export function useConvenios(params: ConveniosParams = {}) {
  return useAsync<ConvenioPage>(
    () => getConvenios(params),
    [params.page, params.q, params.carrera_id],
  );
}
