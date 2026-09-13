export type ApiFieldErrors = Record<string, string[] | string>;

export class ApiError extends Error {
  status: number;
  detail: string;
  errors: ApiFieldErrors;

  constructor(status: number, detail: string, errors: ApiFieldErrors = {}) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.errors = errors;
  }
}

export type ApiClientOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  // Cualquier feature puede mandar el objeto tipado tal cual (`{ titulo, ... }`);
  // acá abajo se decide si hace falta JSON.stringify o no.
  body?: unknown;
};

const API_BASE_URL = (() => {
  const configured = import.meta.env.VITE_API_URL?.trim().replace(/^['"]+|['"]+$/g, "");
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "";
    }
  }

  return "http://localhost:8000";
})();

// Handler que se invoca cuando cualquier request devuelve 401. El AuthProvider
// liga su logout aquí para que la limpieza de sesión sea centralizada.
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorizedHandler = fn;
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { method = "GET", body, headers, auth = true, ...rest } = options;

  const requestHeaders = new Headers(headers);

  if (auth) {
    const token = window.localStorage.getItem("miifts_token");
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const hasBody = body !== undefined && body !== null;
  if (hasBody && !(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    method,
    headers: requestHeaders,
    body: hasBody ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    // Si es 401, disparar el handler global antes de lanzar el error para que
    // la app pueda limpiar sesión y redirigir en un único lugar.
    if (response.status === 401) {
      try {
        unauthorizedHandler && unauthorizedHandler();
      } catch {
        // proteger la llamada del handler: no queremos que un fallo aquí oculte
        // el error original.
      }
    }

    const detail = payload?.detail ?? payload?.message ?? "La solicitud falló.";
    // El backend manda `errors` como array `{ campo, msg }[]` (ver
    // INTEGRACION_FRONT.md §1.2/§1.8), no como Record<campo, mensaje>. Sin
    // este mapeo, useApiForm() nunca encuentra el campo correcto en un 422.
    const rawErrors = payload?.errors;
    const errors: ApiFieldErrors = Array.isArray(rawErrors)
      ? rawErrors.reduce<ApiFieldErrors>((acc, item) => {
          if (item && typeof item.campo === "string" && typeof item.msg === "string") {
            acc[item.campo] = item.msg;
          }
          return acc;
        }, {})
      : (rawErrors ?? {});
    throw new ApiError(response.status, detail, errors);
  }

  return payload as T;
}
