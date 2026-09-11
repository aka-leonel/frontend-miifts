type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-text">{title}</h3>
        <p className="mt-2 text-sm text-muted">{description}</p>

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border bg-transparent px-3 py-2 text-sm font-medium text-muted">
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-violet px-3 py-2 text-sm font-semibold text-white">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
