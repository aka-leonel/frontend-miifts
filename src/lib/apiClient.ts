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

export type ApiClientOptions = RequestInit & {
  auth?: boolean;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

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
    const detail = payload?.detail ?? payload?.message ?? "La solicitud falló.";
    const errors = payload?.errors ?? {};
    throw new ApiError(response.status, detail, errors);
  }

  return payload as T;
}
