import { useToast } from "../hooks/useToast";

export default function Toaster() {
  const { toasts, dismissToast } = useToast();

  return (
    // z-[300]: por encima de los overlays de FormModal/ConfirmDialog/
    // CambiarPasswordModal (z-[200]) — si no, un toast de error disparado
    // mientras hay un modal abierto (ej. guardar y que tire 422/409) queda
    // atrás del fondo oscuro del modal, apagado y casi invisible.
    //
    // Mismo quiebre `md:` que BottomNav/SidebarNav: en mobile es un banner
    // de ancho completo (con margen) arriba de la pantalla — más fácil de
    // leer con el pulgar y no compite con la barra inferior; desde `md:` se
    // achica a una pila angosta arriba a la derecha, que es lo que ya tenía
    // sentido con el sidebar ocupando la izquierda.
    <div className="pointer-events-none fixed inset-x-4 top-4 z-[300] flex flex-col gap-2 md:inset-x-auto md:right-4 md:w-[360px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            "pointer-events-auto flex items-center justify-between gap-3 rounded-xl border px-3 py-2 shadow-lg backdrop-blur-sm",
            toast.kind === "error"
              ? "border-red-500/40 bg-red-500/10 text-red-100"
              : toast.kind === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                : "border-violet-500/40 bg-[#1A1B23]/95 text-text",
          ].join(" ")}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="text-xs font-bold opacity-70 transition hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
