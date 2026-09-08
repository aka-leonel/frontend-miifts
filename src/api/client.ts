// src/api/client.ts
//
// Wrapper HTTP único para toda la app. Nadie debería llamar a fetch()
// directamente fuera de este archivo — así el manejo de auth, errores y el
// 401 global queda en un solo lugar.

import type { ApiError } from "./types";
import { getToken } from "../auth/storage";

const BASE_URL = import.meta.env.VITE_API_URL as string;

if (!BASE_URL) {
  // Falla rápido y claro en dev si alguien no configuró el .env, en vez de
  // dejar que todos los requests fallen en silencio con una URL relativa rara.
  console.error(
    "VITE_API_URL no está definida. Revisá tu archivo .env (ver README)."
  );
}

/** Error tipado que lanzan todos los requests que fallan (status >= 400). */
export class ApiRequestError extends Error {
  status: number;
  detail: string;
  errors?: { campo: string; msg: string }[];

  constructor(status: number, apiError: ApiError) {
    super(apiError.detail);
    this.name = "ApiRequestError";
    this.status = status;
    this.detail = apiError.detail;
    this.errors = apiError.errors;
  }
}

type UnauthorizedHandler = () => void;

// El AuthProvider registra acá su logout() al montarse. Se hace así (en vez
// de importar AuthContext directamente en este archivo) para evitar un
// import circular: auth/AuthContext.tsx ya depende de api/client.ts.
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler;
}

type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** true = manda el header Authorization: Bearer <token> */
  auth?: boolean;
  params?: QueryParams;
}

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Hace un request a la API y devuelve el body ya parseado y tipado.
 *
 * - `auth: true` agrega el header Authorization si hay token guardado.
 * - Un 401 dispara el handler global (logout + redirect) ANTES de tirar
 *   el error, así cualquier `catch` de la pantalla ya encuentra la sesión
 *   limpia.
 * - Un 204 devuelve `undefined` sin intentar parsear body (no lo tiene).
 * - Cualquier otro status >= 400 tira `ApiRequestError` con `detail` y,
 *   si es un 422, `errors[]` para mapear a campos de formulario.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = false, params } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    onUnauthorized?.();
  }

  if (!response.ok) {
    let apiError: ApiError;
    try {
      apiError = (await response.json()) as ApiError;
    } catch {
      // El backend no siempre devuelve JSON en errores inesperados
      // (502 de un proxy, por ejemplo). Fallback prolijo igual.
      apiError = { detail: `Error ${response.status}` };
    }
    throw new ApiRequestError(response.status, apiError);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
