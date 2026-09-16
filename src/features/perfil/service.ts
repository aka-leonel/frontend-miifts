import { apiClient } from "../../api/client";
import type { Usuario, UsuarioUpdate } from "../../api/types";

export async function getAuthMe(): Promise<Usuario> {
  return apiClient<Usuario>("/auth/me");
}

export async function updateAuthMe(patch: UsuarioUpdate): Promise<Usuario> {
  return apiClient<Usuario>("/auth/me", { method: "PATCH", body: patch });
}
