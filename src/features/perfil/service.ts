import { apiClient } from "../../api/client";
import type { Usuario } from "../../api/types";

export async function getAuthMe(): Promise<Usuario> {
  return apiClient<Usuario>("/auth/me");
}
