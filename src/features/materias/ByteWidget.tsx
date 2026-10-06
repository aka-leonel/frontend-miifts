import ByteMascot from "../../components/ByteMascot";

type ByteEstado = "Dormido" | "Despierto" | "Entusiasta" | "Graduado";

function byteEstado(aprobadas: number, total: number): ByteEstado {
  if (total === 0) return "Dormido";
  const pct = aprobadas / total;
  if (pct >= 1) return "Graduado";
  if (pct >= 0.5) return "Entusiasta";
  if (pct >= 0.2) return "Despierto";
  return "Dormido";
}

const byteCopy: Record<ByteEstado, string> = {
  Dormido: "¡Vamos de a poco!",
  Despierto: "¡Buen ritmo!",
  Entusiasta: "¡Casi allá!",
  Graduado: "¡Plan completado!",
};

export default function ByteWidget({ aprobadas, total }: { aprobadas: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((aprobadas / total) * 100);
  const estado = byteEstado(aprobadas, total);
  return (
    <div className="flex h-full min-h-28 items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex-shrink-0">
        <ByteMascot size={64} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-text">
          ¡Hola! Soy <span className="text-lime">Byte</span> 👾 · {byteCopy[estado]}
        </div>
        <div className="mt-1 text-xs text-muted">
          {aprobadas} de {total} materias aprobadas
        </div>
        <div role="progressbar" aria-label="Progreso de la carrera" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="mt-2 h-2 overflow-hidden rounded-full bg-surface2">
          <div className="h-full rounded-full bg-gradient-to-r from-violet to-lime" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 text-xs text-muted">{pct}% del plan completado</div>
      </div>
    </div>
  );
}
