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
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex-shrink-0">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
          <ellipse cx="28" cy="16" rx="14" ry="4" fill="var(--c-lime)" />
          <rect x="14" y="12" width="28" height="6" rx="2" fill="var(--c-lime)" />
          <rect x="22" y="16" width="18" height="4" rx="2" fill="var(--c-lime)" />
          <rect x="16" y="18" width="24" height="20" rx="6" fill="var(--c-surface2)" stroke="var(--c-border)" strokeWidth="0.5" />
          <circle cx="23" cy="27" r="3.5" fill="var(--c-violet)" />
          <circle cx="33" cy="27" r="3.5" fill="var(--c-violet)" />
          <circle cx="24" cy="26" r="1.2" fill="var(--c-bg)" />
          <circle cx="34" cy="26" r="1.2" fill="var(--c-bg)" />
          <path d="M23 33 Q28 36 33 33" stroke="var(--c-lime)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <rect x="20" y="40" width="16" height="10" rx="4" fill="var(--c-surface2)" stroke="var(--c-border)" strokeWidth="0.5" />
          <line x1="28" y1="18" x2="28" y2="12" stroke="var(--c-lime)" strokeWidth="1.5" />
          <circle cx="28" cy="11" r="2" fill="var(--c-lime)" />
        </svg>
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
