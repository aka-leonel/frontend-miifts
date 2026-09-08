// src/auth/api.ts
//
// Llamadas HTTP específicas de auth. Separadas de AuthContext.tsx para que
// el Context se ocupe solo de estado (useState/useEffect), no de fetch.

import { request } from "../api/client";
import type {
  LoginRequest,
  RegistroRequest,
  TokenResponse,
  Usuario,
} from "../api/types";

export function loginRequest(payload: LoginRequest): Promise<TokenResponse> {
  return request<TokenResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function registroRequest(payload: RegistroRequest): Promise<Usuario> {
  return request<Usuario>("/auth/registro", {
    method: "POST",
    body: payload,
  });
}

export function meRequest(): Promise<Usuario> {
  return request<Usuario>("/auth/me", { auth: true });
}
