// src/auth/api.ts
//
// Llamadas HTTP específicas de auth. Separadas de AuthContext.tsx para que
// el Context se ocupe solo de estado (useState/useEffect), no de fetch.

import { apiClient } from "../api/client";
import type {
  ChangePasswordRequest,
  LoginRequest,
  RegistroRequest,
  TokenResponse,
  Usuario,
  UsuarioUpdate,
} from "../api/types";

export function loginRequest(payload: LoginRequest): Promise<TokenResponse> {
  return apiClient<TokenResponse>("/auth/login", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function registroRequest(payload: RegistroRequest): Promise<Usuario> {
  return apiClient<Usuario>("/auth/registro", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function meRequest(): Promise<Usuario> {
  return apiClient<Usuario>("/auth/me", { auth: true });
}

export function updateMeRequest(patch: UsuarioUpdate): Promise<Usuario> {
  return apiClient<Usuario>("/auth/me", { method: "PATCH", body: patch, auth: true });
}

export const CHANGE_PASSWORD_PATH = "/auth/change-password";

export function changePasswordRequest(payload: ChangePasswordRequest): Promise<void> {
  return apiClient<void>(CHANGE_PASSWORD_PATH, { method: "POST", body: payload, auth: true });
}
