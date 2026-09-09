import { useState } from "react";
import { ApiError } from "../lib/apiClient";
import { useToast } from "./useToast";

export type FieldErrors = Record<string, string>;

export function useApiForm() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { pushToast } = useToast();

  const applyApiError = (error: unknown, fallbackMessage = "No se pudo guardar.") => {
    if (error instanceof ApiError) {
      const nextErrors: FieldErrors = {};

      Object.entries(error.errors ?? {}).forEach(([key, value]) => {
        const message = Array.isArray(value) ? value[0] : value;
        if (message) {
          nextErrors[key] = message;
        }
      });

      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors(nextErrors);
        return nextErrors;
      }

      pushToast(error.detail || fallbackMessage, "error");
      setFieldErrors({});
      return {};
    }

    setFieldErrors({});
    pushToast(fallbackMessage, "error");
    return {};
  };

  return {
    fieldErrors,
    setFieldErrors,
    applyApiError,
    clearErrors: () => setFieldErrors({}),
  };
}
