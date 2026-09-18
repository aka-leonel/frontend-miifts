// src/auth/api.ts
//
// Llamadas HTTP específicas de auth. Separadas de AuthContext.tsx para que
// el Context se ocupe solo de estado (useState/useEffect), no de fetch.

import { apiClient } from "../api/client";
import type {
  CambiarPasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  MensajeResponse,
  RegistroRequest,
  ResetPasswordRequest,
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

// S5-13/14 (Olvidé mi contraseña, INTEGRACION §2.4bis): ambos públicos.
export function forgotPasswordRequest(
  payload: ForgotPasswordRequest
): Promise<MensajeResponse> {
  return apiClient<MensajeResponse>("/auth/forgot-password", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function resetPasswordRequest(
  payload: ResetPasswordRequest
): Promise<MensajeResponse> {
  return apiClient<MensajeResponse>("/auth/reset-password", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

// PATCH /auth/password (INTEGRACION §2.4ter): logueado (Bearer), reautentica
// con password_actual. 401 acá significa "no coincide", no sesión inválida
// (ver `suppressUnauthorizedRedirect` en lib/apiClient.ts).
export function cambiarPasswordRequest(
  payload: CambiarPasswordRequest
): Promise<MensajeResponse> {
  return apiClient<MensajeResponse>("/auth/password", {
    method: "PATCH",
    body: payload,
    suppressUnauthorizedRedirect: true,
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
