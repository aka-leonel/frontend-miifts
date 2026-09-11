// Integrante 3 (INTEGRACION_FRONT.md §2.7 Tier 3). Presentacional puro —
// mismo criterio que <MateriaCard> de Integrante 2: el padre decide si hay
// `onEdit`/`onDelete` (solo cuando `recurso.usuario_id === usuario.id`) y
// maneja el `<ConfirmDialog>` de borrado.
import type { Recurso } from "../../api/types";

interface Props {
  recurso: Recurso;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

export function RecursoCard({ recurso, onEdit, onDelete, disabled }: Props) {
  const esDueno = Boolean(onEdit || onDelete);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-text">{recurso.titulo}</div>
          {recurso.descripcion ? <p className="mt-1 text-sm text-muted">{recurso.descripcion}</p> : null}
        </div>
        {recurso.tipo ? (
          <span className="flex-shrink-0 rounded-full bg-surface2 px-2 py-0.5 text-xs uppercase text-muted">
            {recurso.tipo}
          </span>
        ) : null}
      </div>

      <a
        href={recurso.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm text-violet underline"
      >
        Ver recurso ↗
      </a>

      {esDueno ? (
        <div className="mt-3 flex gap-2 border-t border-border pt-3">
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:text-text"
            >
              Editar
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
              className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 disabled:opacity-50"
            >
              Borrar
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
