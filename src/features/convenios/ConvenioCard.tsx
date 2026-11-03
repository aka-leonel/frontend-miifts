import type { ConvenioItem } from "./service";

export default function ConvenioCard({
  item,
  onOpen,
}: {
  item: ConvenioItem;
  onOpen: (item: ConvenioItem) => void;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 transition hover:border-violet/40">
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className={[
            "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-base font-extrabold",
            item.tipo === "universidad" ? "bg-violet/15 text-violet" : "bg-lime/15 text-lime",
          ].join(" ")}
        >
          {item.logo}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold leading-snug text-text">{item.nombre}</h2>
          {item.carrera_destino ? (
            <p className="mt-0.5 text-xs font-semibold text-violet">{item.carrera_destino}</p>
          ) : null}
          {item.tipo === "talentotech" ? (
            <p className="mt-0.5 text-xs text-muted">
              {[item.categoria, item.duracion].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
      </div>

      <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-muted">{item.descripcion}</p>

      {item.tipo === "universidad" ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
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
      ) : null}

      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={() => onOpen(item)}
          aria-label={`Más información sobre ${item.nombre} (se abre en una ventana emergente)`}
          className="w-full rounded-xl border border-violet/70 bg-violet/10 px-3 py-2.5 text-sm font-semibold text-violet"
        >
          Más info
        </button>
      </div>
    </article>
  );
}
