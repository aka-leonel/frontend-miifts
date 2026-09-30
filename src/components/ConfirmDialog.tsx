import Modal from "./Modal";

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
    <Modal title={title} headingLevel="h3" onClose={onClose} className="w-full max-w-sm p-5">
      <p className="text-sm text-muted">{description}</p>

      <div className="mt-5 flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border bg-transparent px-3 py-2.5 text-sm font-medium text-muted">
          {cancelText}
        </button>
        <button type="button" onClick={onConfirm} className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-on-primary">
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
