import { useAsync } from "../../hooks/useAsyncQuery";
import { getTalentoTech, type TalentoTechParams } from "./service";
import type { Paginated, TalentoTech } from "../../api/types";

export function useTalentoTech(params: TalentoTechParams = {}) {
  return useAsync<Paginated<TalentoTech>>(
    () => getTalentoTech(params),
    [params.page, params.per_page, params.categoria, params.carrera_id],
  );
}
