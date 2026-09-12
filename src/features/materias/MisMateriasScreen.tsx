import { useState } from "react";
import { ConfirmDialog, FormModal, ListState, Paginador } from "../../components";
import { useToast } from "../../hooks/useToast";
import { ApiError } from "../../api/client";
import { getMiUsuario } from "../../api/scope";
import { useMateriasDeCarrera } from "../catalogo/hooks";
import type { Cursada } from "../../api/types";
import { estadoLabel, type EstadoUI } from "./estado";
import { useBorrarCursada, useMisMaterias, usePromedio } from "./hooks";
import ByteWidget from "./ByteWidget";
import MateriaCard from "./MateriaCard";
import PromedioCard from "./PromedioCard";
import { materiaUsuarioInitial, materiaUsuarioSpec } from "./materiaUsuarioSpec";

const chips: (EstadoUI | "Todas")[] = ["Todas", "En curso", "Regular", "Aprobada", "Reprobada", "Pendiente"];



export default function MisMateriasScreen({
  onOpenMateria,
  onAbrirAdmin,
}: {
  onOpenMateria?: (id: number) => void;
  onAbrirAdmin?: () => void;
}) {
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
  // S4-08: `c.estado==="aprobada"` es el campo crudo del backend (sin
  // umbral) — usar `estadoLabel` para que coincida con la badge "Reprobada".
  const aprobadas = items.filter((c) => estadoLabel(c) === "Aprobada").length;

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
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-2xl font-black tracking-[-0.04em] text-text">Mis Materias</div>
            <div className="mt-1 text-sm text-muted">Tus cursadas y tu promedio</div>
          </div>
          {/* S4-10: ABM de catálogo, solo visible para admin. */}
          {usuario.rol === "admin" && onAbrirAdmin ? (
            <button
              type="button"
              onClick={onAbrirAdmin}
              className="flex-shrink-0 rounded-lg border border-violet/60 bg-violet/10 px-3 py-1.5 text-xs font-semibold text-violet"
            >
              Admin catálogo
            </button>
          ) : null}
        </div>

        <PromedioCard promedio={promedio.data} loading={promedio.loading} />
        <div className="mb-4">
          <ByteWidget aprobadas={aprobadas} total={lista.data?.total ?? 0} />
        </div>

        {/* S4-09: el select de "Agregar materia" sale vacío cuando el
            catálogo de la carrera del usuario no tiene materias cargadas en
            el backend (gap de datos, no de esta pantalla) — se avisa acá en
            vez de dejar el select en blanco sin explicación. */}
        {!materiasDeMiCarrera.loading && (materiasDeMiCarrera.data?.items.length ?? 0) === 0 ? (
          <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-100">
            Todavía no hay materias cargadas para tu carrera en el sistema. Avisale a un administrador antes de intentar agregar una cursada.
          </div>
        ) : null}

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
          {/* S4-07: 1 columna en mobile, 2 desde md, 3 desde lg. */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((cursada) => (
              <MateriaCard
                key={cursada.id}
                cursada={cursada}
                onOpen={onOpenMateria}
                onEdit={() => setModal({ open: true, item: cursada })}
                onDelete={() => setToDelete(cursada)}
              />
            ))}
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
        style={{ position: "fixed", bottom: 90 }}
        // S4-06/07: antes calculaba `right` a partir del frame fijo de 430px
        // del shell viejo; con el shell fluido eso quedaba desalineado en
        // desktop, así que se ancla directo al borde del viewport.
        className="right-6 z-40 flex h-13 w-13 items-center justify-center rounded-2xl bg-violet text-2xl text-white shadow-[0_4px_20px_rgba(140,125,255,0.4)]"
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