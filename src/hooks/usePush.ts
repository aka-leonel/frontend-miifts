// Hook de notificaciones push. Rescatado de feature/recordatorios-front y
// reescrito contra el backend real (ver nota en src/lib/push.ts):
//
//  - Esa rama verificaba la suscripción con GET /notificaciones/suscripcion,
//    que no existe en el backend (solo hay POST y DELETE) — esa llamada
//    siempre devolvía 404 y el catch limpiaba la suscripción local en cada
//    carga. Acá se confía directamente en `pushManager.getSubscription()`.
//  - El contador de "pendientes" pedía `/recordatorios?estado=pendiente`:
//    `Recordatorio` no tiene campo `estado` (ver api/types.ts) y el filtro
//    real del backend es por fecha (`desde`). Se reemplaza por
//    `getRecordatorios({ desde: hoyISO() })`, el mismo filtro que ya usa
//    InicioScreen para "próximos".
//
// Store compartido (mismo patrón que useToast/preferencias): App.tsx (badge
// del nav) y RecordatoriosScreen (botón activar/desactivar) leen el mismo
// estado — con un useState local cada uno tenía su propia copia y activar
// desde una pantalla no actualizaba el badge de la otra.
import { useEffect, useState } from "react";
import { getRecordatorios } from "../features/recordatorios/service";
import {
  desuscribirPush,
  esPushSoportado,
  obtenerSubscriptionActual,
  registrarSW,
  solicitarPermiso,
  suscribirPush,
  suscripcionAJSON,
} from "../lib/push";
import { apiClient } from "../lib/apiClient";

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export type PushState = {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  contadorPendientes: number;
  loading: boolean;
  error: string | null;
};

let state: PushState = {
  isSupported: false,
  permission: "default",
  subscription: null,
  contadorPendientes: 0,
  loading: false,
  error: null,
};

const listeners = new Set<(state: PushState) => void>();

function setState(cambios: Partial<PushState>) {
  state = { ...state, ...cambios };
  listeners.forEach((listener) => listener(state));
}

async function cargarContador() {
  try {
    const respuesta = await getRecordatorios({ desde: hoyISO(), per_page: 1 });
    setState({ contadorPendientes: respuesta.total });
  } catch (err) {
    console.error("[Push] Error cargando el contador de recordatorios:", err);
  }
}

// Se ejecuta una sola vez (module scope), no por cada componente que llama
// al hook: soporte + registro del SW + suscripción existente.
let iniciado = false;
function iniciar() {
  if (iniciado) return;
  iniciado = true;

  const supported = esPushSoportado();
  setState({ isSupported: supported, permission: supported ? Notification.permission : "denied" });
  if (!supported) return;

  registrarSW().then(async (registration) => {
    if (!registration) return;
    const sub = await obtenerSubscriptionActual(registration);
    setState({ subscription: sub });
    if (sub) await cargarContador();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "PUSH_RECIBIDO") {
        void cargarContador();
      }
    });
  }
}

async function activar(): Promise<void> {
  setState({ loading: true, error: null });
  try {
    const registration = await registrarSW();
    if (!registration) throw new Error("Este navegador no soporta notificaciones.");

    const permission = await solicitarPermiso();
    setState({ permission });
    if (permission !== "granted") {
      throw new Error("Permiso de notificaciones denegado.");
    }

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
    if (!vapidPublicKey) {
      throw new Error("Falta configurar VITE_VAPID_PUBLIC_KEY.");
    }

    const subscription = await suscribirPush(registration, vapidPublicKey);
    if (!subscription) throw new Error("No se pudo crear la suscripción.");

    await apiClient("/notificaciones/suscripcion", {
      method: "POST",
      body: suscripcionAJSON(subscription),
      auth: true,
    });

    setState({ subscription, loading: false });
    await cargarContador();
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudieron activar las notificaciones.";
    setState({ loading: false, error: message });
    throw err;
  }
}

async function desactivar(): Promise<void> {
  setState({ loading: true, error: null });
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await obtenerSubscriptionActual(registration);
    if (subscription) {
      await apiClient("/notificaciones/suscripcion", {
        method: "DELETE",
        body: { endpoint: subscription.endpoint },
        auth: true,
      });
      await desuscribirPush(registration);
    }
    setState({ subscription: null, contadorPendientes: 0, loading: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudieron desactivar las notificaciones.";
    setState({ loading: false, error: message });
    throw err;
  }
}

export function usePush(): PushState & {
  activar: () => Promise<void>;
  desactivar: () => Promise<void>;
  actualizarContador: () => Promise<void>;
} {
  const [items, setItems] = useState(state);

  useEffect(() => {
    iniciar();
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  return { ...items, activar, desactivar, actualizarContador: cargarContador };
}
