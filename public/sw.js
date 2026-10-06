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
    // El backend manda { title, body, data: { recordatorio_id, tipo, materia_id } }
    // (ver scheduler.py) — no "titulo"/"cuerpo" sueltos ni recordatorio_id de
    // primer nivel. Con los nombres viejos la notificación igual aparecía,
    // pero siempre con el texto genérico de los `??`.
    const payload = event.data.json();
    const extra = payload.data ?? {};
    const recordatorioId = extra.recordatorio_id;
    const titulo = payload.title ?? "Nuevo recordatorio";
    const cuerpo = payload.body ?? "Tenés un recordatorio pendiente";
    const tipo = extra.tipo ?? "general";
    const materiaId = extra.materia_id;

    const options = {
      body: cuerpo,
      icon: "/pwa-192x192.png",
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
