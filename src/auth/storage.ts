// src/auth/storage.ts
//
// Único lugar que toca localStorage para la sesión. Si en algún momento se
// cambia a cookies o a otro storage, alcanza con tocar este archivo.

import type { Usuario } from "../api/types";

const TOKEN_KEY = "miifts_token";
const USUARIO_KEY = "miifts_usuario";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getUsuarioGuardado(): Usuario | null {
  const raw = localStorage.getItem(USUARIO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    // localStorage corrupto o de una versión vieja del contrato: mejor
    // tratarlo como "sin sesión" que romper la app.
    return null;
  }
}

export function setUsuarioGuardado(usuario: Usuario): void {
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function clearSesion(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
}

/**
 * Intenta extraer la reclamación `exp` de un JWT y devolverla en segundos
 * desde epoch. Devuelve null si no se puede parsear.
 */
export function getTokenExpSeconds(token?: string | null): number | null {
  const raw = token ?? getToken();
  if (!raw) return null;
  try {
    const parts = raw.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp === "number") return payload.exp;
    return null;
  } catch {
    return null;
  }
}