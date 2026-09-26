// Service Worker para notificaciones push - miIFTS
// Se registra en scope raíz (/) para recibir push en foreground/background/cerrada

const CACHE_NAME = "miifts-v1"

// Install: skipWaiting para activar inmediatamente
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting())
})

// Activate: claim clients para controlar páginas abiertas
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

// Push: mostrar notificación nativa con acciones y datos de navegación
self.addEventListener("push", (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    const recordatorioId = data.recordatorio_id
    const titulo = data.titulo ?? "Nuevo recordatorio"
    const cuerpo = data.cuerpo ?? "Tenés un recordatorio pendiente"
    const tipo = data.tipo ?? "general"
    const materiaId = data.materia_id

    const options = {
      body: cuerpo,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      tag: `recordatorio-${recordatorioId}`,
      data: {
        recordatorio_id: recordatorioId,
        tipo,
        materia_id: materiaId,
        url: `/recordatorios/${recordatorioId}`,
      },
      actions: [
        { action: "open", title: "Ver" },
        { action: "dismiss", title: "Descartar" },
      ],
      requireInteraction: true,
      renotify: true,
      vibrate: [200, 100, 200],
    }

    event.waitUntil(self.registration.showNotification(titulo, options))

    // Notificar a clientes abiertos (foreground) para actualizar badge
    event.waitUntil(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "PUSH_RECIBIDO", recordatorioId })
          })
        }),
    )
  } catch (err) {
    console.error("[SW] Error procesando push:", err)
  }
})

// Notification click: navegar al recordatorio o solo cerrar
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const { action } = event
  const data = event.notification.data ?? {}
  const recordatorioId = data.recordatorio_id
  const url =
    data.url ?? (recordatorioId ? `/recordatorios/${recordatorioId}` : "/")

  if (action === "dismiss") {
    return // Solo cerrar
  }

  // action === 'open' o click en el cuerpo de la notificación (action === '')
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla y navegar
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus().then((focusedClient) => {
              if (focusedClient) {
                focusedClient.postMessage({ type: "NAVEGAR_RECORDATORIO", url })
              }
            })
          }
        }
        // Si no hay ventana, abrir una nueva
        return self.clients.openWindow(url)
      }),
  )
})

// Notification close: opcional, para analytics
self.addEventListener("notificationclose", (event) => {
  const data = event.notification.data ?? {}
  const recordatorioId = data.recordatorio_id
  // Aquí se podría enviar analytics de "descartado sin abrir"
  console.log("[SW] Notificación cerrada:", recordatorioId)
})

// Message: recibir mensajes desde la app (ej. para skipWaiting manual)
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
