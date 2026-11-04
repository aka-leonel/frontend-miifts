import { useEffect, useState } from "react";
import { ListState, Paginador } from "../../components";
import ConvenioCard from "./ConvenioCard";
import ConvenioDetalleModal from "./ConvenioDetalleModal";
import { useConvenios } from "./hooks";
import type { ConvenioItem } from "./service";
import { TalentoTechSection } from "../talentotech";

export default function ConveniosScreen() {
  const [tab, setTab] = useState<"universidades" | "talento">("universidades");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<ConvenioItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const universidades = useConvenios({ page, q: debouncedSearch });
  const items = universidades.data?.items ?? [];

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="mx-auto w-full max-w-lg px-4 pt-14 sm:max-w-2xl sm:px-6 lg:max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-[-0.04em] text-text">Convenios</h1>
          <div className="mt-1 text-sm text-muted">Oportunidades para estudiantes IFTS</div>
        </div>

        <div className="mb-4 flex rounded-xl border border-border bg-card p-1">
          {(["universidades", "talento"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={tab === option}
              onClick={() => {
                setTab(option);
                setPage(1);
                setSelected(null);
              }}
              className={[
                "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
                tab === option ? "bg-primary text-on-primary" : "text-muted",
              ].join(" ")}
            >
              {option === "universidades" ? "Universidades" : "Talento Tech"}
            </button>
          ))}
        </div>

        {tab === "universidades" ? (
          <>
            <div className="mb-5">
              <label htmlFor="convenios-buscar" className="sr-only">
                Buscar convenios
              </label>
              <input
                id="convenios-buscar"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por institución, carrera o descripción…"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text transition placeholder:text-muted focus:border-violet"
              />
            </div>

            <ListState
              loading={universidades.loading}
              error={universidades.error}
              items={items}
              emptyTitle="No hay convenios disponibles"
              emptyDescription={
                debouncedSearch
                  ? "No se encontraron convenios para esa búsqueda."
                  : "Todavía no se publicaron convenios en esta sección."
              }
              onRetry={() => universidades.refetch()}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <ConvenioCard key={item.id} item={item} onOpen={setSelected} />
                ))}
              </div>
            </ListState>

            {universidades.data && !universidades.loading ? (
              <Paginador
                page={universidades.data.page}
                totalPages={universidades.data.totalPages}
                onPageChange={(nextPage) => setPage(nextPage)}
              />
            ) : null}
          </>
        ) : (
          <TalentoTechSection />
        )}
      </div>

      <ConvenioDetalleModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
