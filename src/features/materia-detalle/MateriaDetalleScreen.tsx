// src/features/materia-detalle/MateriaDetalleScreen.tsx
//
// Integrante 3 — Detalle de materia. Sin react-router en esta app todavía
// (el resto de las pantallas navega con el switch de App.tsx, no con URLs),
// así que recibe `materiaId` por prop en vez de leerlo con `useParams()`.
//
// Importa, como pide INTEGRACION_FRONT.md §2.14, lo que YA publicaron los
// dueños de cada cosa: `materiaUsuarioSpec`/`estadoLabel` (Integrante 2),
// `useRecordatorios`/`recordatorioSpec`/`<RecordatorioCard>` (Integrante 4).
import { useMemo, useState } from "react";
import { ApiError } from "../../api/client";
import { getMiUsuario } from "../../api/scope";
import type { Recordatorio, Recurso } from "../../api/types";
import { ConfirmDialog, FormModal, ListState } from "../../components";
import { useToast } from "../../hooks/useToast";
import { useMateriasDeCarrera } from "../catalogo/hooks";
import { estadoBadgeClasses, estadoLabel } from "../materias/estado";
import { useMisMaterias } from "../materias/hooks";
import { materiaUsuarioInitial, materiaUsuarioSpec } from "../materias/materiaUsuarioSpec";
import { RecordatorioCard } from "../recordatorios/RecordatorioCard";
import { useBorrarRecordatorio, useRecordatorios } from "../recordatorios/hooks";
import { recordatorioFormInitial, recordatorioSpec } from "../recordatorios/recordatorioSpec";
import { CorrelativaItem } from "./CorrelativaItem";
import { useCorrelativas, useMateria } from "./hooks";
import { RecursoCard } from "../recursos/RecursoCard";
import { useBorrarRecurso, useRecursosDeMateria } from "../recursos/hooks";
import { recursoFormInitial, recursoSpec, type RecursoForm } from "../recursos/recursoSpec";

interface Props {
  materiaId: number;
  onVolver: () => void;
}

export function MateriaDetalleScreen({ materiaId, onVolver }: Props) {
  const usuario = getMiUsuario();
  const { pushToast } = useToast();

  const materia = useMateria(materiaId);
  const correlativas = useCorrelativas(materiaId);
  const recursos = useRecursosDeMateria(materiaId);
  const materiasDeMiCarrera = useMateriasDeCarrera(usuario.carrera_id);
  const misMaterias = useMisMaterias(1);
  const recordatoriosParams = useMemo(() => ({ materia_id: materiaId, per_page: 50 }), [materiaId]);
  const recordatorios = useRecordatorios(recordatoriosParams);

  const cursadaActual = misMaterias.data?.items.find((c) => c.materia_id === materiaId) ?? null;

  const [modalNotas, setModalNotas] = useState(false);
  const [modalRecurso, setModalRecurso] = useState<{ open: boolean; item: Recurso | null }>({
    open: false,
    item: null,
  });
  const [aBorrarRecurso, setABorrarRecurso] = useState<Recurso | null>(null);
  const [modalRecordatorio, setModalRecordatorio] = useState<{ open: boolean; item: Recordatorio | null }>({
    open: false,
    item: null,
  });
  const [aBorrarRecordatorio, setABorrarRecordatorio] = useState<Recordatorio | null>(null);

  const borrarRecurso = useBorrarRecurso(() => {
    pushToast("Recurso eliminado.", "success");
    recursos.refetch();
  });
  const borrarRecordatorio = useBorrarRecordatorio(() => {
    pushToast("Recordatorio eliminado.", "success");
    recordatorios.refetch();
  });

  async function handleBorrarRecurso() {
    if (!aBorrarRecurso) return;
    try {
      await borrarRecurso.run(aBorrarRecurso.id);
    } catch (error) {
      pushToast(error instanceof ApiError ? error.detail : "No se pudo eliminar.", "error");
    } finally {
      setABorrarRecurso(null);
    }
  }

  async function handleBorrarRecordatorio() {
    if (!aBorrarRecordatorio) return;
    try {
      await borrarRecordatorio.run(aBorrarRecordatorio.id);
    } catch (error) {
      pushToast(error instanceof ApiError ? error.detail : "No se pudo eliminar.", "error");
    } finally {
      setABorrarRecordatorio(null);
    }
  }

  if (materia.loading && !materia.data) {
    return (
      <div className="px-6 pt-14">
        <div className="h-20 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    );
  }

  if (materia.error || !materia.data) {
    return (
      <div className="px-6 pt-14">
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center text-red-100">
          No se pudo cargar la materia.
        </div>
        <button type="button" onClick={onVolver} className="mt-4 text-sm text-violet">
          ← Volver
        </button>
      </div>
    );
  }

  const m = materia.data;
  const estado = cursadaActual ? estadoLabel(cursadaActual) : "Pendiente";

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-6 pt-14">
        <button type="button" onClick={onVolver} className="mb-4 text-sm text-muted transition hover:text-text">
          ← Materias
        </button>

        <div className="mb-2 text-2xl font-black tracking-[-0.04em] text-text">{m.nombre}</div>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-surface2 px-2 py-1 text-xs text-muted">{m.codigo}</span>
          <span className="text-xs text-muted">
            {m.anio}º año · {m.cuatrimestre}º cuatrimestre
          </span>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-text">Tu cursada</span>
            <button
              type="button"
              onClick={() => setModalNotas(true)}
              className="rounded-lg border border-violet/60 bg-violet/10 px-3 py-1.5 text-xs font-semibold text-violet"
            >
              {cursadaActual ? "Editar notas" : "Agregar cursada"}
            </button>
          </div>
          {cursadaActual ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className={["rounded-full px-3 py-1 text-xs font-semibold", estadoBadgeClasses[estado]].join(" ")}>
                {estado}
              </span>
              {cursadaActual.nota_final != null ? (
                <span className="rounded-full bg-surface2 px-2 py-1 text-xs text-muted">
                  Final: {cursadaActual.nota_final}
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">Todavía no cargaste esta materia entre tus cursadas.</p>
          )}
        </div>

        <div className="mb-6">
          <div className="mb-3 text-sm font-bold text-text">Correlativas</div>
          <ListState
            loading={correlativas.loading}
            error={correlativas.error}
            items={correlativas.data ?? []}
            emptyTitle="Sin correlativas"
            emptyDescription="Se puede cursar libremente."
            onRetry={() => correlativas.refetch()}
          >
            <div className="space-y-2">
              {(correlativas.data ?? []).map((c) => (
                <CorrelativaItem key={c.id} nombre={c.requiere?.nombre ?? `Materia #${c.requiere_id}`} codigo={c.requiere?.codigo ?? "?"} />
              ))}
            </div>
          </ListState>
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-text">Recursos</span>
            <button
              type="button"
              onClick={() => setModalRecurso({ open: true, item: null })}
              className="text-xs font-semibold text-violet"
            >
              + Agregar
            </button>
          </div>
          <ListState
            loading={recursos.loading}
            error={recursos.error}
            items={recursos.data ?? []}
            emptyTitle="Sin recursos"
            emptyDescription="Tocá + Agregar para publicar el primero."
            onRetry={() => recursos.refetch()}
          >
            <div className="space-y-2">
              {(recursos.data ?? []).map((r) => {
                const esDueno = r.usuario_id === usuario.id;
                return (
                  <RecursoCard
                    key={r.id}
                    recurso={r}
                    disabled={borrarRecurso.loading}
                    onEdit={esDueno ? () => setModalRecurso({ open: true, item: r }) : undefined}
                    onDelete={esDueno ? () => setABorrarRecurso(r) : undefined}
                  />
                );
              })}
            </div>
          </ListState>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-text">Recordatorios</span>
            <button
              type="button"
              onClick={() => setModalRecordatorio({ open: true, item: null })}
              className="text-xs font-semibold text-violet"
            >
              + Agregar
            </button>
          </div>
          <ListState
            loading={recordatorios.loading}
            error={recordatorios.error}
            items={recordatorios.data?.items ?? []}
            emptyTitle="Sin recordatorios"
            emptyDescription="Tocá + Agregar para crear el primero."
            onRetry={() => recordatorios.refetch()}
          >
            <div className="space-y-2">
              {(recordatorios.data?.items ?? []).map((r) => (
                <RecordatorioCard
                  key={r.id}
                  recordatorio={r}
                  disabled={borrarRecordatorio.loading}
                  onEdit={() => setModalRecordatorio({ open: true, item: r })}
                  onDelete={() => setABorrarRecordatorio(r)}
                />
              ))}
            </div>
          </ListState>
        </div>
      </div>

      <FormModal
        open={modalNotas}
        item={cursadaActual ?? undefined}
        spec={materiaUsuarioSpec({ materias: materiasDeMiCarrera.data?.items ?? [] })}
        initialValues={materiaUsuarioInitial(cursadaActual ?? { materia_id: materiaId })}
        onClose={() => setModalNotas(false)}
        onSuccess={() => {
          pushToast(cursadaActual ? "Cursada actualizada." : "Cursada agregada.", "success");
          misMaterias.refetch();
        }}
      />

      <FormModal
        open={modalRecurso.open}
        // FormModal solo lee `item.id` (para elegir crear vs. editar); el
        // resto de los valores vienen de `initialValues`. El cast evita el
        // choque de tipos entre `Recurso.tipo` (string|null) y el form.
        item={modalRecurso.item ? (modalRecurso.item as unknown as Partial<RecursoForm>) : undefined}
        spec={recursoSpec(materiaId)}
        initialValues={recursoFormInitial(modalRecurso.item ?? undefined)}
        onClose={() => setModalRecurso({ open: false, item: null })}
        onSuccess={() => {
          pushToast(modalRecurso.item ? "Recurso actualizado." : "Recurso publicado.", "success");
          recursos.refetch();
        }}
      />

      <FormModal
        open={modalRecordatorio.open}
        item={modalRecordatorio.item ?? undefined}
        spec={recordatorioSpec(materiaId)}
        initialValues={recordatorioFormInitial(modalRecordatorio.item ?? undefined)}
        onClose={() => setModalRecordatorio({ open: false, item: null })}
        onSuccess={() => {
          pushToast(modalRecordatorio.item ? "Recordatorio actualizado." : "Recordatorio agregado.", "success");
          recordatorios.refetch();
        }}
      />

      <ConfirmDialog
        open={aBorrarRecurso != null}
        title="Borrar recurso"
        description={aBorrarRecurso ? `¿Eliminar "${aBorrarRecurso.titulo}"? No se puede deshacer.` : ""}
        confirmText="Borrar"
        onConfirm={() => void handleBorrarRecurso()}
        onClose={() => setABorrarRecurso(null)}
      />

      <ConfirmDialog
        open={aBorrarRecordatorio != null}
        title="Borrar recordatorio"
        description={aBorrarRecordatorio ? `¿Eliminar "${aBorrarRecordatorio.titulo}"? No se puede deshacer.` : ""}
        confirmText="Borrar"
        onConfirm={() => void handleBorrarRecordatorio()}
        onClose={() => setABorrarRecordatorio(null)}
      />
    </div>
  );
}
