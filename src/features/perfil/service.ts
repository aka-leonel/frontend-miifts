// Integrante 4 (INTEGRACION_FRONT.md §2.14 y §2.11 "/perfil"): Mi perfil.
//
// `PATCH /auth/me` todavía no existe en el backend (gap documentado en
// INTEGRACION_FRONT.md §1.7, a cargo de Integrante 1) → "guardar cambios"
// queda solo visual hasta que se entregue, tal como pide ese gap.
import { apiClient } from "../../api/client";
import { DEMO_MODE } from "../../api/demo";
import { getMiUsuario } from "../../api/scope";
import type { Usuario } from "../../api/types";

export async function getAuthMe(): Promise<Usuario> {
  if (DEMO_MODE) {
    return Promise.resolve(getMiUsuario());
  }
  return apiClient<Usuario>("/auth/me");
}
