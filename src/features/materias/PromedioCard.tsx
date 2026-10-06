import type { Promedio } from "../../api/types";
import ByteMascot from "../../components/ByteMascot";

export default function PromedioCard({
  promedio,
  loading,
}: {
  promedio: Promedio | null | undefined;
  loading: boolean;
}) {
  if (loading && !promedio) {
    return <div role="status" aria-label="Cargando promedio" className="h-full min-h-28 animate-pulse rounded-2xl border border-border bg-card" />;
  }

  const value = promedio?.promedio ?? null;

  return (
    <div className="flex h-full min-h-28 items-center rounded-2xl border border-border bg-card p-4">
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <ByteMascot size={64} variant="calculadora" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Promedio</div>
            <div className="text-3xl font-black tracking-[-0.04em] text-text">
              {value != null ? value.toFixed(2) : "—"}
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-muted">
          {promedio == null
            ? "Todavía no hay notas finales para computar."
            : `${promedio.materias_computadas} ${promedio.materias_computadas === 1 ? "materia computada" : "materias computadas"}`}
        </div>
      </div>
    </div>
  );
}