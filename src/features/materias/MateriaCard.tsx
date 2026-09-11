import type { Cursada } from "../../api/types";
import { estadoBadgeClasses, estadoLabel } from "./estado";

function subtitulo(cursada: Cursada): string {
  const partes: string[] = [];
  if (cursada.nota_parcial_1 != null) partes.push(`1er ${cursada.nota_parcial_1}`);
  if (cursada.nota_parcial_2 != null) partes.push(`2do ${cursada.nota_parcial_2}`);
  if (cursada.nota_final != null) partes.push(`Final ${cursada.nota_final}`);
  return partes.length > 0 ? partes.join(" · ") : "Sin notas cargadas";
}

export default function MateriaCard({
  cursada,
  onOpen,
  onEdit,
  onDelete,
}: {
  cursada: Cursada;
  onOpen?: (materiaId: number) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const estado = estadoLabel(cursada);
  return (
    <div
      onClick={() => onOpen?.(cursada.materia_id)}
      className="rounded-2xl border border-border bg-card p-4 transition hover:border-violet/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-text">
            {cursada.materia?.nombre ?? `Materia #${cursada.materia_id}`}
          </div>
          <div className="mt-1 text-xs text-muted">{subtitulo(cursada)}</div>
        </div>
        <span className={["flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold", estadoBadgeClasses[estado]].join(" ")}>
          {estado}
        </span>
      </div>
      {onEdit || onDelete ? (
        <div className="mt-3 flex gap-2 border-t border-border pt-3">
          {onEdit ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:text-text"
            >
              Editar
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300"
            >
              Borrar
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
