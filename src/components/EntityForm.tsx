import { type ChangeEvent, type ReactNode, useId, useMemo } from "react";

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
  readOnly?: boolean;
  hint?: string;
};

export type EntityFormProps<T extends Record<string, unknown>> = {
  fields: FormFieldSpec[];
  values: T;
  errors?: Record<string, string>;
  onChange: (name: keyof T, value: unknown) => void;
  submitLabel?: string;
  showSubmitButton?: boolean;
  children?: ReactNode;
  /**
   * true si el form está editando un item existente. `lockOnEdit` en un
   * field spec solo debe deshabilitarlo en ese caso — en alta (create) el
   * campo tiene que quedar habilitado siempre (bug: antes se leía
   * `field.lockOnEdit` a secas, así que quedaba deshabilitado también al
   * crear, ej. el selector de materia en "Agregar materia").
   */
  isEditing?: boolean;
};

const fieldClassName =
  "w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text transition focus:border-violet placeholder:text-muted";

function renderField<T extends Record<string, unknown>>(
  field: FormFieldSpec,
  value: unknown,
  errors: Record<string, string> | undefined,
  onChange: (name: keyof T, value: unknown) => void,
  isEditing: boolean,
  prefix: string,
) {
  const key = field.name;
  const id = `${prefix}-${field.name}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const hasError = Boolean(errors?.[field.name]);
  // El error y la ayuda se leen junto con el campo.
  const describedBy = [hasError ? errorId : "", field.hint ? hintId : ""].filter(Boolean).join(" ") || undefined;
  const requiredProps = field.required ? { "aria-required": true as const } : {};
  const errorProps = { "aria-invalid": hasError || undefined, "aria-describedby": describedBy };
  const labelEl = (
    <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-[0.08em] text-muted">
      {field.label}
    </label>
  );
  const errorEl = hasError ? (
    <span id={errorId} role="alert" className="block text-xs text-danger">
      {errors?.[field.name]}
    </span>
  ) : null;

  if (field.type === "switch") {
    return (
      <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg px-3 py-3 text-sm text-text">
        <span id={`${id}-label`}>{field.label}</span>
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={Boolean(value)}
          aria-labelledby={`${id}-label`}
          onClick={() => onChange(field.name as keyof T, !value)}
          className={[
            "relative h-6 w-11 flex-shrink-0 rounded-full border transition",
            value ? "border-primary bg-primary" : "border-border bg-surface2",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-1 h-4 w-4 rounded-full transition",
              value ? "left-6 bg-on-primary" : "left-1 bg-muted",
            ].join(" ")}
          />
        </button>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div key={key} className="space-y-1.5">
        {labelEl}
        <select
          id={id}
          {...requiredProps}
          {...errorProps}
          value={String(value ?? "")}
          disabled={field.lockOnEdit && isEditing}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(field.name as keyof T, event.target.value)}
          className={[fieldClassName, hasError ? "border-danger" : ""].join(" ")}
        >
          <option value="">Seleccionar</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errorEl}
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div key={key} className="space-y-1.5">
        {labelEl}
        <input
          id={id}
          {...requiredProps}
          {...errorProps}
          type="number"
          inputMode="decimal"
          min={field.min}
          max={field.max}
          value={String(value ?? "")}
          disabled={field.readOnly}
          onChange={(event) => onChange(field.name as keyof T, event.target.value)}
          className={[fieldClassName, hasError ? "border-danger" : "", field.readOnly ? "cursor-not-allowed opacity-70" : ""].join(" ")}
          placeholder={field.placeholder}
        />
        {field.hint ? (
          <span id={hintId} className="block text-xs text-muted">
            {field.hint}
          </span>
        ) : null}
        {errorEl}
      </div>
    );
  }

  return (
    <div key={key} className="space-y-1.5">
      {labelEl}
      <input
        id={id}
        {...requiredProps}
        {...errorProps}
        type={field.type === "datetime" ? "datetime-local" : field.type === "url" ? "url" : "text"}
        value={String(value ?? "")}
        onChange={(event) => onChange(field.name as keyof T, event.target.value)}
        className={[fieldClassName, hasError ? "border-danger" : ""].join(" ")}
        placeholder={field.placeholder}
      />
      {errorEl}
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
  isEditing = false,
}: EntityFormProps<T>) {
  const prefix = useId();
  const renderedFields = useMemo(
    () => fields.map((field) => renderField(field, values[field.name], errors, onChange, isEditing, prefix)),
    [fields, values, errors, onChange, isEditing, prefix],
  );

  return (
    <div className="space-y-4">
      {renderedFields}
      {children ? <div className="pt-1">{children}</div> : null}
      {showSubmitButton ? (
        <button
          type="button"
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary shadow-[0_10px_25px_rgba(140,125,255,0.35)] transition hover:opacity-95"
        >
          {submitLabel}
        </button>
      ) : null}
    </div>
  );
}
