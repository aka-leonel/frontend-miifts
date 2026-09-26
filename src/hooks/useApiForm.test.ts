import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useApiForm } from "./useApiForm";
import { ApiError } from "../lib/apiClient";

describe("useApiForm", () => {
  it("should initialize with empty field errors", () => {
    const { result } = renderHook(() => useApiForm());
    expect(result.current.fieldErrors).toEqual({});
  });

  it("should apply ApiError field errors correctly", () => {
    const { result } = renderHook(() => useApiForm());

    const apiError = new ApiError(422, "Error de validación", {
      email: ["Email ya registrado"],
      password: "Contraseña muy débil",
    });

    let applied: Record<string, string> = {};
    act(() => {
      applied = result.current.applyApiError(apiError);
    });

    expect(result.current.fieldErrors).toEqual({
      email: "Email ya registrado",
      password: "Contraseña muy débil",
    });
    expect(applied).toEqual(result.current.fieldErrors);

    act(() => {
      result.current.clearErrors();
    });
    expect(result.current.fieldErrors).toEqual({});
  });

  it("should handle generic errors via toast fallback", () => {
    const { result } = renderHook(() => useApiForm());

    const genericError = new Error("Error desconocido");

    act(() => {
      result.current.applyApiError(genericError, "Fallback msg");
    });

    expect(result.current.fieldErrors).toEqual({});
  });
});
