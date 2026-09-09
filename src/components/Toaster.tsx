import { useToast } from "../hooks/useToast";

export default function Toaster() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,360px)] flex-col gap-2">
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
