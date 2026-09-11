import { useEffect, useState } from "react";

export type ToastKind = "success" | "error" | "info";

export type Toast = {
  id: number;
  message: string;
  kind: ToastKind;
};

const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];
let nextId = 1;

const emit = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

const dismissToast = (id: number) => {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
};

export function useToast() {
  const [items, setItems] = useState<Toast[]>(toasts);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  const pushToast = (message: string, kind: ToastKind = "info", timeout = 3000) => {
    const toast: Toast = { id: nextId++, message, kind };
    toasts = [...toasts, toast];
    emit();

    window.setTimeout(() => dismissToast(toast.id), timeout);
    return toast;
  };

  return {
    toasts: items,
    pushToast,
    dismissToast,
  };
}

