import { useToast } from "../hooks/useToast";

// z-[300] en los dos: por encima de los overlays de FormModal/ConfirmDialog/
// CambiarPasswordModal (z-[200]) — si no, un toast de error disparado
// mientras hay un modal abierto (ej. guardar y que tire 422/409) queda
// atrás del fondo oscuro del modal, apagado y casi invisible.

const ICONO: Record<string, string> = { error: "✕", success: "✓", info: "i" };

const CLASES_MOBILE: Record<string, string> = {
  error: "bg-red-500 text-white",
  success: "bg-emerald-500 text-white",
  info: "bg-violet text-white",
};

const CLASES_DESKTOP: Record<string, string> = {
  error: "border-red-500/40 bg-red-500/10 text-red-100",
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  info: "border-violet-500/40 bg-[#1A1B23]/95 text-text",
};

export default function Toaster() {
  const { toasts, dismissToast } = useToast();

  return (
    <>
      {/* Mobile (< md): snackbar sólido, de punta a punta, apilado desde
          abajo justo arriba del BottomNav — mismo criterio que separar
          BottomNav/SidebarNav en App.tsx: es OTRO bloque para mobile, no el
          mismo de escritorio con clases responsive por encima. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[300] flex flex-col-reverse gap-2 px-3 md:hidden">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "pointer-events-auto flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg",
              CLASES_MOBILE[toast.kind] ?? CLASES_MOBILE.info,
            ].join(" ")}
          >
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/25 text-xs font-bold">
              {ICONO[toast.kind] ?? ICONO.info}
            </span>
            <span className="flex-1 text-sm font-semibold">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-base font-bold leading-none opacity-80 transition hover:opacity-100"
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Desktop (md+): tarjeta flotante arriba a la derecha, no compite con
          el SidebarNav que ocupa la izquierda. */}
      <div className="pointer-events-none fixed right-4 top-4 z-[300] hidden w-[360px] flex-col gap-2 md:flex">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "pointer-events-auto flex items-center justify-between gap-3 rounded-xl border px-3 py-2 shadow-lg backdrop-blur-sm",
              CLASES_DESKTOP[toast.kind] ?? CLASES_DESKTOP.info,
            ].join(" ")}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-xs font-bold opacity-70 transition hover:opacity-100"
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
