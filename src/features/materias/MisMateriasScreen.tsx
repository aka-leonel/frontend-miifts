import { useState } from "react";
import { ConfirmDialog, FormModal, ListState, Paginador } from "../../components";
import { useToast } from "../../hooks/useToast";
import { ApiError } from "../../api/client";
import { getMiUsuario } from "../../api/scope";
import { useMateriasDeCarrera } from "../catalogo/hooks";
import type { Cursada } from "../../api/types";
import { estadoBadgeClasses, estadoLabel, type EstadoUI } from "./estado";
import { useBorrarCursada, useMisMaterias, usePromedio } from "./hooks";
import PromedioCard from "./PromedioCard";
import { materiaUsuarioInitial, materiaUsuarioSpec } from "./materiaUsuarioSpec";

const chips: (EstadoUI | "Todas")[] = ["Todas", "En curso", "Regular", "Aprobada", "Pendiente"];

function cursadaSubtitulo(cursada: Cursada): string {
  const partes: string[] = [];
  if (cursada.nota_parcial_1 != null) partes.push(`1er ${cursada.nota_parcial_1}`);
  if (cursada.nota_parcial_2 != null) partes.push(`2do ${cursada.nota_parcial_2}`);
  if (cursada.nota_final != null) partes.push(`Final ${cursada.nota_final}`);
  return partes.length > 0 ? partes.join(" · ") : "Sin notas cargadas";
}

export default function MisMateriasScreen({ onOpenMateria }: { onOpenMateria?: (id: number) => void }) {
  const { pushToast } = useToast();
  const [page, setPage] = useState(1);
  const [chip, setChip] = useState<EstadoUI | "Todas">("Todas");
  const [modal, setModal] = useState<{ open: boolean; item: Cursada | null }>({ open: false, item: null });
  const [toDelete, setToDelete] = useState<Cursada | null>(null);

  const usuario = getMiUsuario();
  const materiasDeMiCarrera = useMateriasDeCarrera(usuario.carrera_id);
  const lista = useMisMaterias(page);
  const promedio = usePromedio();

  const refrescar = () => {
    lista.refetch();
    promedio.refetch();
  };

  const onSaved = (message: string) => () => {
    pushToast(message, "success");
    setPage(1);
    refrescar();
  };

  const borrar = useBorrarCursada(() => {
    pushToast("Materia eliminada.", "success");
    setPage(1);
    refrescar();
  });

  const items = lista.data?.items ?? [];
  const filtrados = chip === "Todas" ? items : items.filter((item) => estadoLabel(item) === chip);

  const spec = materiaUsuarioSpec({
    materias: materiasDeMiCarrera.data?.items ?? [],
  });

  const crearSpec = {
    ...spec,
    submit: {
      create: spec.submit.create,
      update: async () => {},
    },
  };

  const editarSpec = {
    ...spec,
    submit: {
      create: async () => {},
      update: spec.submit.update,
    },
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await borrar.run(toDelete.id);
      setToDelete(null);
    } catch (error) {
      setToDelete(null);
      pushToast(error instanceof ApiError ? error.detail : "No se pudo eliminar.", "error");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-6 pt-14">
        <div className="mb-4">
          <div className="text-2xl font-black tracking-[-0.04em] text-text">Mis Materias</div>
          <div className="mt-1 text-sm text-muted">Tus cursadas y tu promedio</div>
        </div>

        <PromedioCard promedio={promedio.data} loading={promedio.loading} />

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {chips.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setChip(option)}
              className={[
                "flex-shrink-0 rounded-full border px-4 py-1.5 text-sm transition",
                chip === option
                  ? "border-violet bg-violet font-semibold text-white"
                  : "border-border bg-card text-muted",
              ].join(" ")}
            >
              {option}
            </button>
          ))}
        </div>

        <ListState
          loading={lista.loading}
          error={lista.error}
          items={filtrados}
          emptyTitle={chip === "Todas" ? "Todavía no cargaste materias" : "No hay materias en este estado"}
          emptyDescription="Tocá + para cargar tu primera cursada."
          onRetry={() => lista.refetch()}
        >
          <div className="space-y-3">
            {filtrados.map((cursada) => {
              const estado = estadoLabel(cursada);
              return (
                <div
                  key={cursada.id}
                  onClick={() => onOpenMateria?.(cursada.materia_id)}
                  className="rounded-2xl border border-border bg-card p-4 transition hover:border-violet/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-text">
                        {cursada.materia?.nombre ?? `Materia #${cursada.materia_id}`}
                      </div>
                      <div className="mt-1 text-xs text-muted">{cursadaSubtitulo(cursada)}</div>
                    </div>
                    <span
                      className={[
                        "flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                        estadoBadgeClasses[estado],
                      ].join(" ")}
                    >
                      {estado}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setModal({ open: true, item: cursada });
                      }}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:text-text"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setToDelete(cursada);
                      }}
                      className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 transition"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </ListState>

        {lista.data ? (
          <Paginador page={lista.data.page} totalPages={lista.data.total_pages} onPageChange={setPage} />
        ) : null}
      </div>

      <button
        type="button"
        aria-label="Agregar materia"
        onClick={() => setModal({ open: true, item: null })}
        style={{ position: "fixed", bottom: 90, right: "calc(50% - 190px)" }}
        className="z-40 flex h-13 w-13 items-center justify-center rounded-2xl bg-violet text-2xl text-white shadow-[0_4px_20px_rgba(140,125,255,0.4)]"
      >
        +
      </button>

      <FormModal
        open={modal.open}
        item={modal.item ?? undefined}
        spec={modal.item ? editarSpec : crearSpec}
        initialValues={materiaUsuarioInitial(modal.item ?? undefined)}
        onSuccess={onSaved(modal.item ? "Materia actualizada." : "Materia cargada.")}
        onClose={() => setModal({ open: false, item: null })}
      />

      <ConfirmDialog
        open={toDelete != null}
        title="Borrar materia"
        description={toDelete ? `¿Eliminar ${toDelete.materia?.nombre ?? `la materia #${toDelete.materia_id}`}? No se puede deshacer.` : ""}
        confirmText="Borrar"
        onConfirm={() => void handleDelete()}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}