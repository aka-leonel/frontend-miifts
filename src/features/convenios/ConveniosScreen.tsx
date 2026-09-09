import { useState } from "react";
import { ListState, Paginador } from "../../components";
import { useConvenios, useTalentoTech } from "./hooks";

export default function ConveniosScreen() {
  const [tab, setTab] = useState<"universidades" | "talento">("universidades");
  const [page, setPage] = useState(1);

  const universidades = useConvenios({ page });
  const talento = useTalentoTech({ page });
  const active = tab === "universidades" ? universidades : talento;

  const items = active.data?.items ?? [];

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-6 pt-14">
        <div className="mb-6">
          <div className="text-2xl font-black tracking-[-0.04em] text-text">Convenios</div>
          <div className="mt-1 text-sm text-muted">Oportunidades para estudiantes IFTS</div>
        </div>

        <div className="mb-6 flex rounded-xl border border-border bg-card p-1">
          {(["universidades", "talento"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setTab(option);
                setPage(1);
              }}
              className={[
                "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                tab === option ? "bg-violet text-white" : "text-muted",
              ].join(" ")}
            >
              {option === "universidades" ? "Universidades" : "Talento Tech"}
            </button>
          ))}
        </div>

        <ListState
          loading={active.loading}
          error={active.error}
          items={items}
          emptyTitle="No hay convenios disponibles"
          emptyDescription="Todavía no se publicaron oportunidades para esta sección."
          onRetry={() => setPage(1)}
        >
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-xl text-base font-extrabold",
                      tab === "universidades" ? "bg-violet/15 text-violet" : "bg-lime/15 text-lime",
                    ].join(" ")}
                  >
                    {item.logo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-text">{item.nombre}</div>
                    <div className="mt-1 text-xs text-muted">{item.requisitos}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const url = item.link_info ?? item.link_inscripcion ?? "#";
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="w-full rounded-xl border border-violet/70 bg-violet/10 px-3 py-2.5 text-sm font-semibold text-violet"
                >
                  Más info
                </button>
              </div>
            ))}
          </div>
        </ListState>

        {active.data ? (
          <Paginador
            page={active.data.page}
            totalPages={active.data.totalPages}
            onPageChange={(nextPage) => setPage(nextPage)}
          />
        ) : null}
      </div>
    </div>
  );
}
