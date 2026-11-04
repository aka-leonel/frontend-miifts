import Modal from "../../components/Modal";
import type { TalentoTech } from "../../api/types";
import { DisponibilidadCarreras } from "./TalentoTechCard";

export default function TalentoTechDetalleModal({
  curso,
  onClose,
}: {
  curso: TalentoTech | null;
  onClose: () => void;
}) {
  if (!curso) return null;

  return (
    <Modal
      title="Detalle del curso"
      onClose={onClose}
      className="m-auto max-h-[85vh] w-full max-w-lg overflow-y-auto p-5"
      overlayClassName=""
      headerExtra={
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-muted transition hover:text-text"
        >
          <span aria-hidden="true">×</span>
        </button>
      }
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-lime/15 text-lg font-extrabold text-lime"
        >
          {curso.nombre_curso.trim().charAt(0).toUpperCase() || "T"}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-snug text-text">{curso.nombre_curso}</h3>
          <p className="mt-1 text-sm font-semibold text-lime">{curso.institucion}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-lime/15 px-2.5 py-1 text-[11px] font-semibold text-lime">
              {curso.categoria}
            </span>
            {curso.dificultad ? (
              <span className="rounded-full border border-border bg-surface2 px-2.5 py-1 text-[11px] text-muted">
                {curso.dificultad}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Descripción</h4>
        <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-text">
          {curso.descripcion}
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-bg px-3 py-2.5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Duración</dt>
          <dd className="mt-1 text-sm text-text">{curso.duracion}</dd>
        </div>
        <div className="rounded-xl border border-border bg-bg px-3 py-2.5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Modalidad</dt>
          <dd className="mt-1 text-sm text-text">{curso.modalidad_cursada}</dd>
        </div>
      </dl>

      <div className="mt-5">
        <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          Disponible para
        </h4>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <DisponibilidadCarreras curso={curso} />
        </div>
      </div>

      <a
        href={curso.link_inscripcion}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 block w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-on-primary shadow-[0_10px_25px_rgba(140,125,255,0.35)] transition hover:opacity-95"
      >
        Inscribirme
      </a>
    </Modal>
  );
}
