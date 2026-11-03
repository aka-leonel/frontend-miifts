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

  const url = item.link_info ?? item.link_inscripcion;

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
          className={[
            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-lg font-extrabold",
            item.tipo === "universidad" ? "bg-violet/15 text-violet" : "bg-lime/15 text-lime",
          ].join(" ")}
        >
          {item.logo}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-snug text-text">{item.nombre}</h3>
          {item.carrera_destino ? (
            <p className="mt-1 text-sm font-semibold text-violet">{item.carrera_destino}</p>
          ) : null}
          {item.tipo === "talentotech" ? (
            <p className="mt-1 text-xs text-muted">
              {[item.categoria, item.duracion].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Descripción</h4>
        <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-text">
          {item.descripcion}
        </p>
      </div>

      {item.tipo === "universidad" ? (
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
      ) : null}

      <button
        type="button"
        disabled={!url}
        onClick={() => {
          if (url) window.open(url, "_blank", "noopener,noreferrer");
        }}
        className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary shadow-[0_10px_25px_rgba(140,125,255,0.35)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Ir al sitio
      </button>
    </Modal>
  );
}
