// Integrante 4 (INTEGRACION_FRONT.md §2.7 Tier 3). La usan tanto la agenda
// global de recordatorios como la Sección Recordatorios del detalle de
// materia (Integrante 3) — por eso soporta un modo "con acciones" (editar/
// borrar) y uno "solo lectura" (para el Inicio de Integrante 2).
import type { Recordatorio } from "../../api/types";

const DOT_CLASS: Record<string, string> = {
  parcial: "bg-violet",
  tp: "bg-lime",
  final: "bg-green",
  otro: "bg-fuchsia-400",
};

const CHIP_CLASS: Record<string, string> = {
  parcial: "bg-violet/20 text-violet",
  tp: "bg-lime/20 text-lime",
  final: "bg-green/20 text-green",
  otro: "bg-fuchsia-400/20 text-fuchsia-300",
};

const TIPO_LABEL: Record<string, string> = {
  parcial: "Parcial",
  tp: "TP",
  final: "Final",
  otro: "Otro",
};

function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

interface Props {
  recordatorio: Recordatorio;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

export function RecordatorioCard({ recordatorio: r, onEdit, onDelete, disabled }: Props) {
  const soloLectura = !onEdit && !onDelete;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <span className={["h-2.5 w-2.5 flex-shrink-0 rounded-full", DOT_CLASS[r.tipo] ?? "bg-muted"].join(" ")} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-text">{r.titulo}</div>
        <div className="mt-1 text-xs text-muted">
          <span className={["mr-1.5 rounded-full px-2 py-0.5 text-[11px]", CHIP_CLASS[r.tipo] ?? "bg-muted/20 text-muted"].join(" ")}>
            {TIPO_LABEL[r.tipo] ?? r.tipo}
          </span>
          {formatearFecha(r.fecha)}
        </div>
      </div>
      {!soloLectura && (
        <div className="flex flex-shrink-0 gap-2">
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted transition hover:text-text"
            >
              Editar
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
              className="rounded-lg border border-red-500/40 px-2.5 py-1 text-xs font-medium text-red-300 disabled:opacity-50"
            >
              Borrar
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
