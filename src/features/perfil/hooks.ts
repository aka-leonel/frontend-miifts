import { useAsync } from "../../hooks/useAsyncQuery";
import { getAuthMe } from "./service";
import type { Usuario } from "../../api/types";

export function useAuthMe() {
  return useAsync<Usuario>(() => getAuthMe(), []);
}
