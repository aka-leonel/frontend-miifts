import type { TalentoTech } from "../../api/types";

function inicial(curso: TalentoTech): string {
  return curso.nombre_curso.trim().charAt(0).toUpperCase() || "T";
}

export function DisponibilidadCarreras({ curso }: { curso: TalentoTech }) {
  if (curso.todas_las_carreras) {
    return (
      <span className="rounded-full bg-lime/15 px-2.5 py-1 text-[11px] font-semibold text-lime">
        Todas las carreras
      </span>
    );
  }

  return (
    <>
      {curso.carreras.map((carrera) => (
        <span
          key={carrera.id}
          className="rounded-full border border-border bg-surface2 px-2.5 py-1 text-[11px] text-muted"
        >
          {carrera.nombre}
        </span>
      ))}
    </>
  );
}

export default function TalentoTechCard({
  curso,
  onOpen,
}: {
  curso: TalentoTech;
  onOpen: (curso: TalentoTech) => void;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 transition hover:border-lime/40">
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-lime/15 text-base font-extrabold text-lime"
        >
          {inicial(curso)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold leading-snug text-text">{curso.nombre_curso}</h2>
          <p className="mt-0.5 text-xs font-semibold text-lime">{curso.institucion}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-lime">
              {curso.categoria}
            </span>
            {curso.dificultad ? (
              <span className="rounded-full border border-border bg-surface2 px-2 py-0.5 text-[10px] text-muted">
                {curso.dificultad}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-muted">{curso.descripcion}</p>

      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
        <div>
          <dt className="sr-only">Duración</dt>
          <dd>{curso.duracion}</dd>
        </div>
        <div>
          <dt className="sr-only">Modalidad</dt>
          <dd>{curso.modalidad_cursada}</dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <DisponibilidadCarreras curso={curso} />
      </div>

      <div className="mt-auto flex gap-2 pt-4">
        <button
          type="button"
          onClick={() => onOpen(curso)}
          aria-label={`Ver detalle de ${curso.nombre_curso}`}
          className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-muted transition hover:text-text"
        >
          Ver detalle
        </button>
        <a
          href={curso.link_inscripcion}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Inscribirme en ${curso.nombre_curso} (se abre en una pestaña nueva)`}
          className="flex-1 rounded-xl border border-lime/70 bg-lime/10 px-3 py-2.5 text-center text-sm font-semibold text-lime transition hover:bg-lime/15"
        >
          Inscribirme
        </a>
      </div>
    </article>
  );
}
