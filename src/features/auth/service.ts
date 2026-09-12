// SEAM · trabajo de Integrante 1 (Fundaciones): AuthProvider / useAuth real.
//
// `LoginScreen` (App.tsx) hasta ahora era 100% mock: el botón "Ingresar"
// navegaba a "registro" sin pegarle al backend (INTEGRACION_FRONT.md §1.6,
// §3 Flujo Auth: `POST /auth/login` → guardar token+usuario). Guarda la
// sesión bajo las mismas claves que ya leen `api/scope.ts` y
// `features/perfil` (`miifts_token` / `miifts_usuario`), así que cuando
// Int. 1 entregue el AuthProvider definitivo el resto del código no cambia.
import { apiClient } from "../../api/client";
import { DEMO_MODE } from "../../api/demo";
import { DEMO_USUARIO } from "../../api/scope";
import type { Usuario } from "../../api/types";

const TOKEN_KEY = "miifts_token";
const USUARIO_KEY = "miifts_usuario";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export function guardarSesion(token: string, usuario: Usuario): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function haySesion(): boolean {
  return window.localStorage.getItem(TOKEN_KEY) != null;
}

export async function login(body: LoginRequest): Promise<TokenResponse> {
  if (DEMO_MODE) {
    return Promise.resolve({ access_token: "demo-token", token_type: "bearer", usuario: DEMO_USUARIO });
  }
  // Pública: sin Bearer (todavía no hay token).
  return apiClient<TokenResponse>("/auth/login", { method: "POST", body, auth: false });
}
