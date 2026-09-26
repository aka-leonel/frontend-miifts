import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "./useToast";

describe("useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should push toasts correctly and dismiss them", () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toEqual([]);

    act(() => {
      result.current.pushToast("Operación exitosa", "success", 3000);
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].message).toBe("Operación exitosa");
    expect(result.current.toasts[0].kind).toBe("success");

    // Dismiss manually
    act(() => {
      result.current.dismissToast(result.current.toasts[0].id);
    });

    expect(result.current.toasts).toEqual([]);
  });

  it("should auto-dismiss toast after timeout", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.pushToast("Mensaje temporal", "info", 2000);
    });

    expect(result.current.toasts.length).toBe(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.toasts).toEqual([]);
  });
});
