import { useState } from "react";
import { ConfirmDialog, ListState, Paginador } from "../../components";
import { useToast } from "../../hooks/useToast";
import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useMateriasDeCarrera } from "../catalogo/hooks";
import type { Cursada, Usuario } from "../../api/types";
import { estadoLabel, nombreDeCursada, type EstadoUI } from "./estado";
import { useBorrarCursada, useMisMaterias, useProgresoCarrera, usePromedio } from "./hooks";
import ByteWidget from "./ByteWidget";
import CursadaFormModal, { type AccionCursada } from "./CursadaFormModal";
import MateriaCard from "./MateriaCard";
import PromedioCard from "./PromedioCard";

// "cursando" primero (es lo que se mira a diario) y "Total" (todas) al final.
type Filtro = EstadoUI | "Total";
const chips: Filtro[] = ["cursando", "promocionada", "aprobada", "desaprobada", "pendiente", "Total"];

const MENSAJE: Record<AccionCursada, string> = {
  creada: "Materia cargada.",
  actualizada: "Materia actualizada.",
  recursada: "Recursando: se borraron las notas viejas y pasó a cursando.",
};

type Props = {
  onOpenMateria?: (id: number) => void;
  onAbrirAdmin?: () => void;
};

// El guard de sesión vive en este wrapper (y no dentro del componente de
// abajo) para que los hooks se llamen siempre en el mismo orden: un `return`
// temprano ANTES de useMateriasDeCarrera/useMisMaterias/etc. rompe las reglas
// de hooks y React tira "Rendered fewer hooks than expected" si la sesión cae
// (401) con esta pantalla abierta.
export default function MisMateriasScreen(props: Props) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <div className="p-6 text-sm text-muted">Tu sesión ya no es válida.</div>;
  }

  return <MisMateriasContent usuario={usuario} {...props} />;
}

function MisMateriasContent({ usuario, onOpenMateria, onAbrirAdmin }: Props & { usuario: Usuario }) {
  const { pushToast } = useToast();
  const [page, setPage] = useState(1);
  const [chip, setChip] = useState<Filtro>("cursando");
  const [modal, setModal] = useState<{ open: boolean; item: Cursada | null }>({ open: false, item: null });
  const [toDelete, setToDelete] = useState<Cursada | null>(null);

  const materiasDeMiCarrera = useMateriasDeCarrera(usuario.carrera_id);
  const lista = useMisMaterias(page);
  const promedio = usePromedio();
  // El progreso es sobre el TOTAL de materias de la carrera, no sobre las que
  // se están cursando ni sobre las cursadas cargadas.
  const progreso = useProgresoCarrera(usuario.carrera_id);

  const refrescar = () => {
    lista.refetch();
    promedio.refetch();
    progreso.refetch();
  };

  const onSaved = (accion: AccionCursada) => {
    pushToast(MENSAJE[accion], "success");
    setPage(1);
    refrescar();
  };

  const borrar = useBorrarCursada(() => {
    pushToast("Materia eliminada.", "success");
    setPage(1);
    refrescar();
  });

  const items = lista.data?.items ?? [];
  const filtrados = chip === "Total" ? items : items.filter((item) => estadoLabel(item) === chip);

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
            <h1 className="text-2xl font-black tracking-[-0.04em] text-text">Mis Materias</h1>
            <div className="mt-1 text-sm text-muted">Tus cursadas y tu promedio</div>
          </div>
          {/* S4-10: ABM de catálogo, solo visible para admin. */}
          {usuario.rol === "admin" && onAbrirAdmin ? (
            <button
              type="button"
              onClick={onAbrirAdmin}
              className="flex-shrink-0 rounded-lg border border-violet/60 bg-violet/10 px-3 py-2 text-xs font-semibold text-violet"
            >
              Admin catálogo
            </button>
          ) : null}
        </div>

        <PromedioCard promedio={promedio.data} loading={promedio.loading} />
        <div className="mb-4">
          <ByteWidget aprobadas={progreso.aprobadas} total={progreso.total} />
        </div>

        {/* S4-09: el select de "Agregar materia" sale vacío cuando el
            catálogo de la carrera del usuario no tiene materias cargadas en
            el backend (gap de datos, no de esta pantalla) — se avisa acá en
            vez de dejar el select en blanco sin explicación. */}
        {!materiasDeMiCarrera.loading && (materiasDeMiCarrera.data?.items.length ?? 0) === 0 ? (
          <div role="status" className="mb-4 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2.5 text-xs text-warning">
            Todavía no hay materias cargadas para tu carrera en el sistema. Avisale a un administrador antes de intentar agregar una cursada.
          </div>
        ) : null}

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {chips.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={chip === option}
              onClick={() => setChip(option)}
              className={[
                "flex-shrink-0 rounded-full border px-4 py-1.5 text-sm capitalize transition",
                chip === option
                  ? "border-primary bg-primary font-semibold text-on-primary"
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
          emptyTitle={chip === "Total" ? "Todavía no cargaste materias" : "No hay materias en este estado"}
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
        className="fixed bottom-[90px] right-6 z-40 flex h-13 w-13 items-center justify-center rounded-2xl bg-primary text-2xl text-on-primary shadow-[0_4px_20px_rgba(140,125,255,0.4)]"
      >
        +
      </button>

      <CursadaFormModal
        open={modal.open}
        cursada={modal.item}
        materias={materiasDeMiCarrera.data?.items ?? []}
        edicion="estado"
        onClose={() => setModal({ open: false, item: null })}
        onSaved={onSaved}
      />

      <ConfirmDialog
        open={toDelete != null}
        title="Borrar materia"
        description={toDelete ? `¿Eliminar ${nombreDeCursada(toDelete)}? No se puede deshacer.` : ""}
        confirmText="Borrar"
        onConfirm={() => void handleDelete()}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
