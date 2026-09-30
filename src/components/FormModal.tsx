import { useEffect, useState, type ReactNode } from "react";
import { useApiForm } from "../hooks/useApiForm";
import Modal from "./Modal";
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
  /** Contenido extra entre los campos y los botones (ej. un botón de acción puntual). */
  extra?: ReactNode;
};

export default function FormModal<T extends Record<string, unknown>>({
  open,
  item,
  spec,
  initialValues,
  onClose,
  onSuccess,
  extra,
}: FormModalProps<T>) {
  const { fieldErrors, applyApiError, clearErrors } = useApiForm();
  const [values, setValues] = useState<T>(initialValues);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    // En un callback (no suelto en el cuerpo del efecto) para no disparar
    // un render síncrono en cascada.
    queueMicrotask(() => {
      setValues(initialValues);
      clearErrors();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Modal
      title={spec.title(item)}
      onClose={onClose}
      className="m-auto w-full max-w-md p-5"
      overlayClassName=""
      headerExtra={
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-muted transition hover:text-text"
        >
          <span aria-hidden="true">×</span>
        </button>
      }
    >
        <EntityForm
          fields={spec.fields}
          values={values}
          errors={fieldErrors}
          onChange={onFieldChange}
          submitLabel={waiting ? "Guardando..." : "Guardar"}
          showSubmitButton={false}
          isEditing={Boolean(item?.id)}
        >
          {extra ? <div className="pb-1">{extra}</div> : null}
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
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {waiting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </EntityForm>
    </Modal>
  );
}
