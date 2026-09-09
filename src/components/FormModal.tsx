import { useEffect, useState } from "react";
import { useApiForm } from "../hooks/useApiForm";
import EntityForm, { type FormFieldSpec } from "./EntityForm";

export type FormSpec<T extends Record<string, unknown>> = {
  title: (item?: Partial<T>) => string;
  fields: FormFieldSpec[];
  submit: {
    create: (values: T) => Promise<unknown> | unknown;
    update: (id: string | number, values: T) => Promise<unknown> | unknown;
  };
  onError?: {
    "409"?: "toast";
    "422"?: "fields";
  };
  invalidates?: (id?: string | number) => unknown[];
};

export type FormModalProps<T extends Record<string, unknown>> = {
  open: boolean;
  item?: Partial<T>;
  spec: FormSpec<T>;
  initialValues: T;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function FormModal<T extends Record<string, unknown>>({
  open,
  item,
  spec,
  initialValues,
  onClose,
  onSuccess,
}: FormModalProps<T>) {
  const { fieldErrors, applyApiError, clearErrors } = useApiForm();
  const [values, setValues] = useState<T>(initialValues);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(initialValues);
    clearErrors();
  }, [open, item?.id]);

  if (!open) return null;

  const onFieldChange = (name: keyof T, value: unknown) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async () => {
    setWaiting(true);

    try {
      if (item?.id) {
        await spec.submit.update(item.id as string | number, values);
      } else {
        await spec.submit.create(values);
      }

      clearErrors();
      onSuccess?.();
      onClose();
    } catch (error) {
      applyApiError(error, "No se pudo guardar el formulario.");
    } finally {
      setWaiting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-text">{spec.title(item)}</h2>
          <button type="button" onClick={onClose} className="text-xl text-muted transition hover:text-text">
            ×
          </button>
        </div>

        <EntityForm
          fields={spec.fields}
          values={values}
          errors={fieldErrors}
          onChange={onFieldChange}
          submitLabel={waiting ? "Guardando..." : "Guardar"}
          showSubmitButton={false}
        >
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={waiting}
              className="flex-1 rounded-xl bg-violet px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {waiting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </EntityForm>
      </div>
    </div>
  );
}
