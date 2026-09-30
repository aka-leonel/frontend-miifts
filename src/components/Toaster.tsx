import { useToast } from "../hooks/useToast";

// z-[300] en los dos: por encima de los overlays de FormModal/ConfirmDialog/
// CambiarPasswordModal (z-[200]) — si no, un toast de error disparado
// mientras hay un modal abierto (ej. guardar y que tire 422/409) queda
// atrás del fondo oscuro del modal, apagado y casi invisible.

const ICONO: Record<string, string> = { error: "✕", success: "✓", info: "i" };

const CLASES_MOBILE: Record<string, string> = {
  error: "bg-danger-solid text-on-solid",
  success: "bg-success-solid text-on-solid",
  info: "bg-primary text-on-primary",
};

const CLASES_DESKTOP: Record<string, string> = {
  error: "border-danger/40 bg-danger/10 text-danger",
  success: "border-success/40 bg-success/10 text-success",
  info: "border-violet/40 bg-card/95 text-text",
};

export default function Toaster() {
  const { toasts, dismissToast } = useToast();

  return (
    <>
      {/* Mobile (< md): snackbar sólido, de punta a punta, apilado desde
          abajo justo arriba del BottomNav — mismo criterio que separar
          BottomNav/SidebarNav en App.tsx: es OTRO bloque para mobile, no el
          mismo de escritorio con clases responsive por encima. */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[300] flex flex-col-reverse gap-2 px-3 md:hidden">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === "error" ? "alert" : "status"}
            className={[
              "pointer-events-auto flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg",
              CLASES_MOBILE[toast.kind] ?? CLASES_MOBILE.info,
            ].join(" ")}
          >
            <span aria-hidden="true" className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-on-solid/25 text-xs font-bold">
              {ICONO[toast.kind] ?? ICONO.info}
            </span>
            <span className="flex-1 text-sm font-semibold">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="flex h-8 w-8 items-center justify-center text-base font-bold leading-none opacity-90 transition hover:opacity-100"
              aria-label="Cerrar notificación"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>

      {/* Desktop (md+): tarjeta flotante arriba a la derecha, no compite con
          el SidebarNav que ocupa la izquierda. */}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-[300] hidden w-[360px] flex-col gap-2 md:flex">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === "error" ? "alert" : "status"}
            className={[
              "pointer-events-auto flex items-center gap-3 rounded-xl border px-3 py-2 shadow-lg backdrop-blur-sm",
              CLASES_DESKTOP[toast.kind] ?? CLASES_DESKTOP.info,
            ].join(" ")}
          >
            <span aria-hidden="true" className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
              {ICONO[toast.kind] ?? ICONO.info}
            </span>
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="flex h-8 w-8 items-center justify-center text-sm font-bold opacity-90 transition hover:opacity-100"
              aria-label="Cerrar notificación"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
