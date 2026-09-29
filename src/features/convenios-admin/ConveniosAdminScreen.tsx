// Panel Admin (ver decisions D016) — ABM real de Convenios. Pantalla de
// gestión, separada a propósito de `features/convenios` (consulta de
// estudiante, solo lectura): no comparte componentes con esa pantalla.
import { useState } from "react";
import { ApiError } from "../../api/client";
import { ConfirmDialog, FormModal, ListState, Paginador, type FormOption } from "../../components";
import { useToast } from "../../hooks/useToast";
import type { Convenio } from "../../api/types";
import { useCarreras } from "../catalogo/hooks";
import { convenioFormInitial, convenioSpec, type ConvenioForm } from "./convenioSpec";
import { useBorrarConvenio, useConveniosAdmin } from "./hooks";

export default function ConveniosAdminScreen() {
  const { pushToast } = useToast();
  const [page, setPage] = useState(1);

  const carrerasQuery = useCarreras({ per_page: 100 });
  const carrerasOptions: FormOption[] = (carrerasQuery.data?.items ?? []).map((c) => ({
    value: String(c.id),
    label: c.nombre,
  }));

  const conveniosQuery = useConveniosAdmin({ page });
  const items = conveniosQuery.data?.items ?? [];

  const [modal, setModal] = useState<{ open: boolean; item: Convenio | null }>({ open: false, item: null });
  const [aBorrar, setABorrar] = useState<Convenio | null>(null);

  const borrar = useBorrarConvenio(() => {
    pushToast("Convenio eliminado.", "success");
    conveniosQuery.refetch();
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
            <div className="text-2xl font-black tracking-[-0.04em] text-text">Convenios (Admin)</div>
            <div className="mt-1 text-sm text-muted">ABM de convenios contra la API real.</div>
          </div>
          <button
            type="button"
            onClick={() => setModal({ open: true, item: null })}
            className="flex-shrink-0 rounded-lg border border-violet/60 bg-violet/10 px-3 py-1.5 text-xs font-semibold text-violet"
          >
            + Nuevo
          </button>
        </div>

        <ListState
          loading={conveniosQuery.loading}
          error={conveniosQuery.error}
          items={items}
          emptyTitle="Sin convenios"
          emptyDescription="Tocá + Nuevo para cargar el primero."
          onRetry={() => conveniosQuery.refetch()}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <div key={c.id} className="flex flex-col rounded-2xl border border-border bg-card p-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-text">{c.institucion}</div>
                  <div className="mt-1 text-xs text-muted">{c.carrera_destino}</div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted">{c.descripcion}</p>
                </div>
                <div className="mt-3 flex gap-2 border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => setModal({ open: true, item: c })}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:text-text"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setABorrar(c)}
                    className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ListState>

        {conveniosQuery.data ? (
          <Paginador
            page={conveniosQuery.data.page}
            totalPages={conveniosQuery.data.total_pages}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      <FormModal
        open={modal.open}
        item={modal.item ? (modal.item as unknown as Partial<ConvenioForm>) : undefined}
        spec={convenioSpec(carrerasOptions)}
        initialValues={convenioFormInitial(modal.item ?? undefined)}
        onClose={() => setModal({ open: false, item: null })}
        onSuccess={() => {
          pushToast(modal.item ? "Convenio actualizado." : "Convenio creado.", "success");
          conveniosQuery.refetch();
        }}
      />

      <ConfirmDialog
        open={aBorrar != null}
        title="Borrar convenio"
        description={aBorrar ? `¿Eliminar el convenio con "${aBorrar.institucion}"?` : ""}
        confirmText="Borrar"
        onConfirm={() => void handleBorrar()}
        onClose={() => setABorrar(null)}
      />
    </div>
  );
}
