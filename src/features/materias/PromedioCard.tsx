import type { Promedio } from "../../api/types";

export default function PromedioCard({
  promedio,
  loading,
}: {
  promedio: Promedio | null | undefined;
  loading: boolean;
}) {
  if (loading && !promedio) {
    return <div className="h-20 animate-pulse rounded-2xl border border-border bg-card" />;
  }

  const value = promedio?.promedio ?? null;

  return (
    <div className="mb-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Promedio</div>
          <div className="text-3xl font-black tracking-[-0.04em] text-text">
            {value != null ? value.toFixed(2) : "—"}
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