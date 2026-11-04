import Modal from "../../components/Modal";
import type { ConvenioItem } from "./service";

export default function ConvenioDetalleModal({
  item,
  onClose,
}: {
  item: ConvenioItem | null;
  onClose: () => void;
}) {
  if (!item) return null;

  return (
    <Modal
      title="Detalle del convenio"
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
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-violet/15 text-lg font-extrabold text-violet"
        >
          {item.logo}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-snug text-text">{item.nombre}</h3>
          {item.carrera_destino ? (
            <p className="mt-1 text-sm font-semibold text-violet">{item.carrera_destino}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Descripción</h4>
        <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-text">
          {item.descripcion}
        </p>
      </div>

      <div className="mt-5">
        <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          Carreras de origen
        </h4>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.todas_las_carreras ? (
            <span className="rounded-full bg-violet/15 px-2.5 py-1 text-[11px] font-semibold text-violet">
              Todas las carreras
            </span>
          ) : (
            item.carreras.map((carrera) => (
              <span
                key={carrera.id}
                className="rounded-full border border-border bg-surface2 px-2.5 py-1 text-[11px] text-muted"
              >
                {carrera.nombre}
              </span>
            ))
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.open(item.link_info, "_blank", "noopener,noreferrer")}
        className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary shadow-[0_10px_25px_rgba(140,125,255,0.35)] transition hover:opacity-95"
      >
        Ir al sitio
      </button>
    </Modal>
  );
}
