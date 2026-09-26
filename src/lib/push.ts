// Utilidades para notificaciones push - miIFTS

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

export async function registrarSW(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("[Push] Service Worker no soportado")
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    })
    console.log("[Push] SW registrado:", registration.scope)
    return registration
  } catch (err) {
    console.error("[Push] Error registrando SW:", err)
    return null
  }
}

export async function solicitarPermiso(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("[Push] Notificaciones no soportadas")
    return "denied"
  }

  const permission = await Notification.requestPermission()
  console.log("[Push] Permiso:", permission)
  return permission
}

export async function suscribirPush(
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string,
): Promise<PushSubscription | null> {
  if (!("PushManager" in window)) {
    console.warn("[Push] PushManager no soportado")
    return null
  }

  try {
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    })
    console.log("[Push] Suscripción creada:", subscription.endpoint)
    return subscription
  } catch (err) {
    console.error("[Push] Error suscribiendo:", err)
    return null
  }
}

export async function desuscribirPush(
  registration: ServiceWorkerRegistration,
): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      const result = await subscription.unsubscribe()
      console.log("[Push] Desuscrito:", result)
      return result
    }
    return true
  } catch (err) {
    console.error("[Push] Error desuscribiendo:", err)
    return false
  }
}

export function obtenerSubscriptionActual(
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription | null> {
  return registration.pushManager.getSubscription()
}

export function suscripcionAJSON(
  subscription: PushSubscription,
): {
  endpoint: string;
  p256dh: string;
  auth: string;
} {
  return {
    endpoint: subscription.endpoint,
    p256dh: arrayBufferToBase64(subscription.getKey("p256dh")!),
    auth: arrayBufferToBase64(subscription.getKey("auth")!),
  }
}

export function esPushSoportado(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}
