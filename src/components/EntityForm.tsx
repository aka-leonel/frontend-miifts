import { type ChangeEvent, type ReactNode, useMemo } from "react";

export type FormFieldType = "text" | "number" | "select" | "switch" | "datetime" | "url";

export type FormOption = {
  value: string;
  label: string;
};

export type FormFieldSpec = {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  options?: FormOption[];
  min?: number;
  max?: number;
  lockOnEdit?: boolean;
};

export type EntityFormProps<T extends Record<string, unknown>> = {
  fields: FormFieldSpec[];
  values: T;
  errors?: Record<string, string>;
  onChange: (name: keyof T, value: unknown) => void;
  submitLabel?: string;
  showSubmitButton?: boolean;
  children?: ReactNode;
};

const fieldClassName =
  "w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none transition focus:border-violet placeholder:text-muted";

function renderField<T extends Record<string, unknown>>(
  field: FormFieldSpec,
  value: unknown,
  errors: Record<string, string> | undefined,
  onChange: (name: keyof T, value: unknown) => void,
) {
  const id = field.name;
  const hasError = Boolean(errors?.[field.name]);

  if (field.type === "switch") {
    return (
      <label key={id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text">
        <span>{field.label}</span>
        <button
          type="button"
          aria-pressed={Boolean(value)}
          onClick={() => onChange(field.name as keyof T, !value)}
          className={[
            "relative h-6 w-11 rounded-full border transition",
            value ? "border-violet bg-violet" : "border-border bg-[#2A2B36]",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-1 h-4 w-4 rounded-full bg-white transition",
              value ? "left-6" : "left-1",
            ].join(" ")}
          />
        </button>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <div key={id} className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-muted">{field.label}</label>
        <select
          value={String(value ?? "")}
          disabled={field.lockOnEdit}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(field.name as keyof T, event.target.value)}
          className={[fieldClassName, hasError ? "border-red-500" : ""].join(" ")}
        >
          <option value="">Seleccionar</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hasError ? <span className="text-xs text-red-300">{errors?.[field.name]}</span> : null}
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div key={id} className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-muted">{field.label}</label>
        <input
          type="number"
          min={field.min}
          max={field.max}
          value={String(value ?? "")}
          onChange={(event) => onChange(field.name as keyof T, event.target.value)}
          className={[fieldClassName, hasError ? "border-red-500" : ""].join(" ")}
          placeholder={field.placeholder}
        />
        {hasError ? <span className="text-xs text-red-300">{errors?.[field.name]}</span> : null}
      </div>
    );
  }

  return (
    <div key={id} className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-muted">{field.label}</label>
      <input
        type={field.type === "datetime" ? "datetime-local" : field.type === "url" ? "url" : "text"}
        value={String(value ?? "")}
        onChange={(event) => onChange(field.name as keyof T, event.target.value)}
        className={[fieldClassName, hasError ? "border-red-500" : ""].join(" ")}
        placeholder={field.placeholder}
      />
      {hasError ? <span className="text-xs text-red-300">{errors?.[field.name]}</span> : null}
    </div>
  );
}

export default function EntityForm<T extends Record<string, unknown>>({
  fields,
  values,
  errors,
  onChange,
  submitLabel = "Guardar",
  showSubmitButton = true,
  children,
}: EntityFormProps<T>) {
  const renderedFields = useMemo(
    () => fields.map((field) => renderField(field, values[field.name], errors, onChange)),
    [fields, values, errors, onChange],
  );

  return (
    <div className="space-y-4">
      {renderedFields}
      {children ? <div className="pt-1">{children}</div> : null}
      {showSubmitButton ? (
        <button
          type="button"
          className="w-full rounded-xl bg-violet px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(140,125,255,0.35)] transition hover:opacity-95"
        >
          {submitLabel}
        </button>
      ) : null}
    </div>
  );
}
