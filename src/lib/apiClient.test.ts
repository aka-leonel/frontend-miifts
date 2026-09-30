import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiClient, ApiError, setUnauthorizedHandler } from "./apiClient";

describe("apiClient.ts", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should make successful GET request and include Authorization header when auth=true", async () => {
    localStorage.setItem("miifts_token", "my-secret-token");

    const mockResponse = { ok: true, status: 200, text: async () => JSON.stringify({ data: "success" }) };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    const result = await apiClient<{ data: string }>("/test-path");

    expect(result).toEqual({ data: "success" });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, options] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("/test-path");
    const headers = options?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer my-secret-token");
  });

  it("should set Content-Type to application/json when body is provided", async () => {
    const mockResponse = { ok: true, status: 200, text: async () => JSON.stringify({ ok: true }) };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    await apiClient("/submit", { method: "POST", body: { name: "test" } });

    const [, options] = fetchSpy.mock.calls[0];
    const headers = options?.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(options?.body).toBe(JSON.stringify({ name: "test" }));
  });

  it("should handle 204 No Content correctly", async () => {
    const mockResponse = { ok: true, status: 204, text: async () => "" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    const result = await apiClient<void>("/no-content");
    expect(result).toBeUndefined();
  });

  it("should throw ApiError and map 422 errors array correctly", async () => {
    const errorPayload = {
      detail: "Error de validación",
      errors: [
        { campo: "email", msg: "Email inválido" },
        { campo: "password", msg: "Muy corta" },
      ],
    };

    const mockResponse = {
      ok: false,
      status: 422,
      text: async () => JSON.stringify(errorPayload),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    let errorThrown: ApiError | null = null;
    try {
      await apiClient("/validate");
    } catch (err) {
      if (err instanceof ApiError) {
        errorThrown = err;
      }
    }

    expect(errorThrown).not.toBeNull();
    expect(errorThrown?.status).toBe(422);
    expect(errorThrown?.detail).toBe("Error de validación");
    expect(errorThrown?.errors).toEqual({
      email: "Email inválido",
      password: "Muy corta",
    });
  });

  it("should trigger unauthorizedHandler on 401 response", async () => {
    const unauthorizedFn = vi.fn();
    setUnauthorizedHandler(unauthorizedFn);

    const mockResponse = {
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ detail: "No autorizado" }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    await expect(apiClient("/protected")).rejects.toThrow(ApiError);
    expect(unauthorizedFn).toHaveBeenCalledTimes(1);

    setUnauthorizedHandler(null);
  });

  it("should suppress unauthorizedHandler when suppressUnauthorizedRedirect is true", async () => {
    const unauthorizedFn = vi.fn();
    setUnauthorizedHandler(unauthorizedFn);

    const mockResponse = {
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ detail: "Password actual incorrecta" }),
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    await expect(
      apiClient("/auth/password", { suppressUnauthorizedRedirect: true })
    ).rejects.toThrow(ApiError);
    expect(unauthorizedFn).not.toHaveBeenCalled();

    setUnauthorizedHandler(null);
  });
});
