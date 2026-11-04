// Panel Admin (ver decisions D016) — ABM real de TalentoTech. Separado a
// propósito de `features/talentotech` (consulta del estudiante, solo lectura):
// no comparte componentes con esa pantalla.
import { useState } from "react";
import { ApiError } from "../../api/client";
import { ConfirmDialog, FormModal, ListState, Paginador, type FormOption } from "../../components";
import { useToast } from "../../hooks/useToast";
import type { TalentoTech } from "../../api/types";
import { useCarreras } from "../catalogo/hooks";
import { talentoTechFormInitial, talentoTechSpec, type TalentoTechForm } from "./talentoTechSpec";
import { useBorrarTalentoTech, useTalentoTechAdmin } from "./hooks";

export default function TalentoTechAdminScreen() {
  const { pushToast } = useToast();
  const [page, setPage] = useState(1);

  const carrerasQuery = useCarreras({ per_page: 100 });
  const carrerasOptions: FormOption[] = (carrerasQuery.data?.items ?? []).map((c) => ({
    value: String(c.id),
    label: c.nombre,
  }));

  const cursosQuery = useTalentoTechAdmin({ page });
  const items = cursosQuery.data?.items ?? [];

  const [modal, setModal] = useState<{ open: boolean; item: TalentoTech | null }>({
    open: false,
    item: null,
  });
  const [aBorrar, setABorrar] = useState<TalentoTech | null>(null);

  const borrar = useBorrarTalentoTech(() => {
    pushToast("Curso eliminado.", "success");
    cursosQuery.refetch();
  });

  async function handleBorrar() {
    if (!aBorrar) return;
    try {
      await borrar.run(aBorrar.id);
    } catch (error) {
      pushToast(error instanceof ApiError ? error.detail : "No se pudo eliminar.", "error");
    } finally {
      setABorrar(null);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="mx-auto w-full max-w-lg px-4 pt-14 sm:max-w-2xl sm:px-6 lg:max-w-5xl">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-[-0.04em] text-text">Talento Tech (Admin)</h1>
            <div className="mt-1 text-sm text-muted">ABM de cursos contra la API real.</div>
          </div>
          <button
            type="button"
            onClick={() => setModal({ open: true, item: null })}
            className="flex-shrink-0 rounded-full bg-success-solid px-3 py-2 text-xs font-semibold text-on-solid"
          >
            + Nuevo
          </button>
        </div>

        <ListState
          loading={cursosQuery.loading}
          error={cursosQuery.error}
          items={items}
          emptyTitle="Sin cursos"
          emptyDescription="Tocá + Nuevo para cargar el primero."
          onRetry={() => cursosQuery.refetch()}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((curso) => (
              <div key={curso.id} className="flex flex-col rounded-2xl border border-border bg-card p-4">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-text">{curso.nombre_curso}</h2>
                  <div className="mt-1 text-xs font-medium text-lime">{curso.institucion}</div>
                  <div className="mt-1 text-xs text-muted">
                    {[curso.categoria, curso.duracion, curso.modalidad_cursada].join(" · ")}
                  </div>
                  {curso.dificultad ? (
                    <span className="mt-2 inline-block rounded-full border border-border bg-surface2 px-2 py-0.5 text-[10px] text-muted">
                      {curso.dificultad}
                    </span>
                  ) : null}
                  <p className="mt-2 line-clamp-2 text-xs text-muted">{curso.descripcion}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {curso.todas_las_carreras ? (
                      <span className="rounded-full bg-lime/15 px-2 py-0.5 text-[10px] font-semibold text-lime">
                        Todas las carreras
                      </span>
                    ) : (
                      curso.carreras.map((carrera) => (
                        <span
                          key={carrera.id}
                          className="rounded-full border border-border bg-surface2 px-2 py-0.5 text-[10px] text-muted"
                        >
                          {carrera.nombre}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2 border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => setModal({ open: true, item: curso })}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition hover:text-text"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setABorrar(curso)}
                    className="rounded-lg border border-danger/40 px-3 py-2 text-xs font-medium text-danger"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ListState>

        {cursosQuery.data ? (
          <Paginador
            page={cursosQuery.data.page}
            totalPages={cursosQuery.data.total_pages}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      <FormModal
        open={modal.open}
        item={modal.item ? (modal.item as unknown as Partial<TalentoTechForm>) : undefined}
        spec={talentoTechSpec(carrerasOptions)}
        initialValues={talentoTechFormInitial(modal.item ?? undefined)}
        onClose={() => setModal({ open: false, item: null })}
        onSuccess={() => {
          pushToast(modal.item ? "Curso actualizado." : "Curso creado.", "success");
          cursosQuery.refetch();
        }}
      />

      <ConfirmDialog
        open={aBorrar != null}
        title="Borrar curso"
        description={aBorrar ? `¿Eliminar el curso "${aBorrar.nombre_curso}"?` : ""}
        confirmText="Borrar"
        onConfirm={() => void handleBorrar()}
        onClose={() => setABorrar(null)}
      />
    </div>
  );
}
