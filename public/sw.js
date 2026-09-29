// Service Worker para notificaciones push de miIFTS.
// Registrado manualmente desde src/lib/push.ts (navigator.serviceWorker.register),
// no depende de ningún plugin de build. Rescatado de feature/recordatorios-front
// (ver nota en src/lib/push.ts): los íconos apuntaban a .png inexistentes,
// acá se usan los .svg que sí están en public/icons.

const CACHE_NAME = "miifts-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const recordatorioId = data.recordatorio_id;
    const titulo = data.titulo ?? "Nuevo recordatorio";
    const cuerpo = data.cuerpo ?? "Tenés un recordatorio pendiente";
    const tipo = data.tipo ?? "general";
    const materiaId = data.materia_id;

    const options = {
      body: cuerpo,
      icon: "/icons/icon-192.svg",
      badge: "/icons/badge-72.svg",
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
    };

    event.waitUntil(self.registration.showNotification(titulo, options));

    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "PUSH_RECIBIDO", recordatorioId });
        });
      }),
    );
  } catch (err) {
    console.error("[SW] Error procesando push:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { action } = event;
  const data = event.notification.data ?? {};
  const recordatorioId = data.recordatorio_id;
  const url = data.url ?? (recordatorioId ? `/recordatorios/${recordatorioId}` : "/");

  if (action === "dismiss") return;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus().then((focusedClient) => {
            if (focusedClient) {
              focusedClient.postMessage({ type: "NAVEGAR_RECORDATORIO", url });
            }
          });
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
