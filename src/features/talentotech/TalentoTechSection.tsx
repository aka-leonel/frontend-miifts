import { useMemo, useState } from "react";
import { ListState, Paginador } from "../../components";
import { useAuth } from "../../auth/AuthContext";
import type { TalentoTech } from "../../api/types";
import { useTalentoTech } from "./hooks";
import TalentoTechCard from "./TalentoTechCard";
import TalentoTechDetalleModal from "./TalentoTechDetalleModal";

const fieldClassName =
  "w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text transition focus:border-violet";

export default function TalentoTechSection() {
  const auth = useAuth();
  const [page, setPage] = useState(1);
  const [categoria, setCategoria] = useState("");
  const [soloMiCarrera, setSoloMiCarrera] = useState(false);
  const [selected, setSelected] = useState<TalentoTech | null>(null);

  const miCarreraId = auth.usuario?.carrera_id;
  const filtroCarrera = soloMiCarrera && miCarreraId != null ? miCarreraId : undefined;

  const cursos = useTalentoTech({
    page,
    categoria: categoria || undefined,
    carrera_id: filtroCarrera,
  });
  // El backend no expone un endpoint de categorías (es texto libre): traemos
  // un catálogo acotado para poblar el <select> sin hardcodear opciones.
  const catalogo = useTalentoTech({ page: 1, per_page: 100 });

  const categorias = useMemo(() => {
    const valores = new Set<string>();
    for (const curso of catalogo.data?.items ?? []) {
      if (curso.categoria) valores.add(curso.categoria);
    }
    if (categoria) valores.add(categoria);
    return [...valores].sort((a, b) => a.localeCompare(b));
  }, [catalogo.data, categoria]);

  const items = cursos.data?.items ?? [];
  const filtrando = Boolean(categoria) || soloMiCarrera;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-[-0.02em] text-text">Cursos TalentoTech</h2>
        <p className="mt-1 text-sm text-muted">Formaciones gratuitas con inscripción online.</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="talento-categoria"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted"
          >
            Categoría
          </label>
          <select
            id="talento-categoria"
            value={categoria}
            onChange={(event) => {
              setCategoria(event.target.value);
              if (event.target.value) setSoloMiCarrera(false);
              setPage(1);
            }}
            className={fieldClassName}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </select>
        </div>

        {miCarreraId != null ? (
          <button
            type="button"
            aria-pressed={soloMiCarrera}
            onClick={() => {
              const siguiente = !soloMiCarrera;
              setSoloMiCarrera(siguiente);
              if (siguiente) setCategoria("");
              setPage(1);
            }}
            className={[
              "rounded-xl border px-4 py-2.5 text-sm font-medium transition",
              soloMiCarrera
                ? "border-violet bg-violet/15 text-violet"
                : "border-border bg-card text-muted hover:text-text",
            ].join(" ")}
          >
            Solo mi carrera
          </button>
        ) : null}
      </div>

      <ListState
        loading={cursos.loading}
        error={cursos.error}
        items={items}
        emptyTitle="No hay cursos TalentoTech"
        emptyDescription={
          filtrando
            ? "No se encontraron cursos para ese filtro. Probá con otro."
            : "Todavía no se publicaron cursos en esta sección."
        }
        onRetry={() => cursos.refetch()}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((curso) => (
            <TalentoTechCard key={curso.id} curso={curso} onOpen={setSelected} />
          ))}
        </div>
      </ListState>

      {cursos.data && !cursos.loading ? (
        <Paginador
          page={cursos.data.page}
          totalPages={cursos.data.total_pages}
          onPageChange={setPage}
        />
      ) : null}

      <TalentoTechDetalleModal curso={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
