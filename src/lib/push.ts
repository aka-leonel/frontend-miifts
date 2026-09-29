// Utilidades de bajo nivel para notificaciones push (Web Push API).
// Rescatado de feature/recordatorios-front (GonzaloPonce7) al mergear esa
// rama a dev tiraba conflicto en casi todo el repo (ver PR): se trajo acá
// solo esta feature, reescrita contra el estado actual de dev.

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export async function registrarSW(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (err) {
    console.error("[Push] Error registrando el Service Worker:", err);
    return null;
  }
}

export async function solicitarPermiso(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.requestPermission();
}

export async function suscribirPush(
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string,
): Promise<PushSubscription | null> {
  if (!("PushManager" in window)) {
    return null;
  }
  try {
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });
  } catch (err) {
    console.error("[Push] Error creando la suscripción:", err);
    return null;
  }
}

export async function desuscribirPush(registration: ServiceWorkerRegistration): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return true;
    return await subscription.unsubscribe();
  } catch (err) {
    console.error("[Push] Error al desuscribir:", err);
    return false;
  }
}

export function obtenerSubscriptionActual(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription | null> {
  return registration.pushManager.getSubscription();
}

export function suscripcionAJSON(subscription: PushSubscription): {
  endpoint: string;
  p256dh: string;
  auth: string;
} {
  return {
    endpoint: subscription.endpoint,
    p256dh: arrayBufferToBase64(subscription.getKey("p256dh")!),
    auth: arrayBufferToBase64(subscription.getKey("auth")!),
  };
}

export function esPushSoportado(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}
