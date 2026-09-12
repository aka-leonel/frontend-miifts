// src/features/catalogo-admin/AdminCatalogoScreen.tsx
//
// S4-10 (Integrante 2, opcional) — ABM real de carreras y materias, sin
// mocks. Acceso restringido a `usuario.rol === "admin"` (el guard vive en
// App.tsx, no acá: esta pantalla asume que ya se verificó el rol).
import { useState } from "react";
import { ApiError } from "../../api/client";
import { ConfirmDialog, FormModal, ListState } from "../../components";
import { useToast } from "../../hooks/useToast";
import type { Carrera, Materia } from "../../api/types";
import { useCarreras, useMateriasDeCarrera } from "../catalogo/hooks";
import { carreraFormInitial, carreraSpec, type CarreraForm } from "./carreraSpec";
import { useBorrarCarrera, useBorrarMateria } from "./hooks";
import { materiaFormInitial, materiaSpec, type MateriaForm } from "./materiaSpec";

export default function AdminCatalogoScreen({ onVolver }: { onVolver: () => void }) {
  const { pushToast } = useToast();

  const carrerasQuery = useCarreras({ per_page: 100 });
  const carrerasList = carrerasQuery.data?.items ?? [];

  const [carreraSeleccionada, setCarreraSeleccionada] = useState<number | null>(null);
  const carreraId = carreraSeleccionada ?? carrerasList[0]?.id ?? 0;
  const materiasQuery = useMateriasDeCarrera(carreraId);

  const [modalCarrera, setModalCarrera] = useState<{ open: boolean; item: Carrera | null }>({ open: false, item: null });
  const [aBorrarCarrera, setABorrarCarrera] = useState<Carrera | null>(null);
  const [modalMateria, setModalMateria] = useState<{ open: boolean; item: Materia | null }>({ open: false, item: null });
  const [aBorrarMateria, setABorrarMateria] = useState<Materia | null>(null);

  const borrarCarrera = useBorrarCarrera(() => {
    pushToast("Carrera eliminada.", "success");
    carrerasQuery.refetch();
  });
  const borrarMateria = useBorrarMateria(() => {
    pushToast("Materia eliminada.", "success");
    materiasQuery.refetch();
  });

  async function handleBorrarCarrera() {
    if (!aBorrarCarrera) return;
    try {
      await borrarCarrera.run(aBorrarCarrera.id);
    } catch (error) {
      pushToast(error instanceof ApiError ? error.detail : "No se pudo eliminar.", "error");
    } finally {
      setABorrarCarrera(null);
    }
  }

  async function handleBorrarMateria() {
    if (!aBorrarMateria) return;
    try {
      await borrarMateria.run(aBorrarMateria.id);
    } catch (error) {
      pushToast(error instanceof ApiError ? error.detail : "No se pudo eliminar.", "error");
    } finally {
      setABorrarMateria(null);
    }
  }

  const carreraActiva = carrerasList.find((c) => c.id === carreraId);

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-6 pt-14">
        <button type="button" onClick={onVolver} className="mb-4 text-sm text-muted transition hover:text-text">
          ← Materias
        </button>

        <div className="mb-6">
          <div className="text-2xl font-black tracking-[-0.04em] text-text">Catálogo (Admin)</div>
          <div className="mt-1 text-sm text-muted">ABM de carreras y materias contra la API real.</div>
        </div>

        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-text">Carreras</span>
            <button
              type="button"
              onClick={() => setModalCarrera({ open: true, item: null })}
              className="text-xs font-semibold text-violet"
            >
              + Nueva
            </button>
          </div>
          <ListState
            loading={carrerasQuery.loading}
            error={carrerasQuery.error}
            items={carrerasList}
            emptyTitle="Sin carreras"
            emptyDescription="Tocá + Nueva para cargar la primera."
            onRetry={() => carrerasQuery.refetch()}
          >
            <div className="space-y-2">
              {carrerasList.map((c) => {
                const activa = c.id === carreraId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setCarreraSeleccionada(c.id)}
                    className={[
                      "cursor-pointer rounded-2xl border p-4 transition",
                      activa ? "border-violet bg-violet/10" : "border-border bg-card hover:border-violet/40",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-text">{c.nombre}</div>
                        <div className="mt-1 text-xs text-muted">
                          {c.duracion_cuatrimestres} cuatrimestres · instituto #{c.ifts_id}
                        </div>
                      </div>
                      <span
                        className={[
                          "flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                          activa ? "bg-violet text-white" : "bg-surface2 text-muted",
                        ].join(" ")}
                      >
                        {activa ? "Viendo" : "Ver materias"}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2 border-t border-border pt-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalCarrera({ open: true, item: c });
                        }}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:text-text"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setABorrarCarrera(c);
                        }}
                        className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300"
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ListState>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-text">
              Materias{carreraActiva ? ` · ${carreraActiva.nombre}` : ""}
            </span>
            <button
              type="button"
              disabled={!carreraId}
              onClick={() => setModalMateria({ open: true, item: null })}
              className="text-xs font-semibold text-violet disabled:opacity-40"
            >
              + Nueva
            </button>
          </div>
          <ListState
            loading={materiasQuery.loading}
            error={materiasQuery.error}
            items={materiasQuery.data?.items ?? []}
            emptyTitle="Sin materias"
            emptyDescription="Esta carrera todavía no tiene materias cargadas."
            onRetry={() => materiasQuery.refetch()}
          >
            <div className="space-y-2">
              {(materiasQuery.data?.items ?? []).map((m) => (
                <div key={m.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-text">{m.nombre}</div>
                    <div className="mt-1 text-xs text-muted">
                      {m.codigo} · {m.anio}º año · {m.cuatrimestre}º cuatrimestre
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={() => setModalMateria({ open: true, item: m })}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:text-text"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setABorrarMateria(m)}
                      className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ListState>
        </div>
      </div>

      <FormModal
        open={modalCarrera.open}
        // FormModal solo lee `item.id`; el resto de los valores salen de
        // `initialValues` (`Carrera` y `CarreraForm` no coinciden 1:1 —
        // duracion_cuatrimestres/ifts_id son string en el form mientras se
        // edita).
        item={modalCarrera.item ? (modalCarrera.item as unknown as Partial<CarreraForm>) : undefined}
        spec={carreraSpec}
        initialValues={carreraFormInitial(modalCarrera.item ?? undefined)}
        onClose={() => setModalCarrera({ open: false, item: null })}
        onSuccess={() => {
          pushToast(modalCarrera.item ? "Carrera actualizada." : "Carrera creada.", "success");
          carrerasQuery.refetch();
        }}
      />

      <FormModal
        open={modalMateria.open}
        item={modalMateria.item ? (modalMateria.item as unknown as Partial<MateriaForm>) : undefined}
        spec={materiaSpec(carreraId)}
        initialValues={materiaFormInitial(modalMateria.item ?? undefined)}
        onClose={() => setModalMateria({ open: false, item: null })}
        onSuccess={() => {
          pushToast(modalMateria.item ? "Materia actualizada." : "Materia creada.", "success");
          materiasQuery.refetch();
        }}
      />

      <ConfirmDialog
        open={aBorrarCarrera != null}
        title="Borrar carrera"
        description={
          aBorrarCarrera
            ? `¿Eliminar "${aBorrarCarrera.nombre}"? Falla (409) si todavía tiene materias cargadas.`
            : ""
        }
        confirmText="Borrar"
        onConfirm={() => void handleBorrarCarrera()}
        onClose={() => setABorrarCarrera(null)}
      />

      <ConfirmDialog
        open={aBorrarMateria != null}
        title="Borrar materia"
        description={
          aBorrarMateria
            ? `¿Eliminar "${aBorrarMateria.nombre}"? Falla (409) si tiene cursadas cargadas.`
            : ""
        }
        confirmText="Borrar"
        onConfirm={() => void handleBorrarMateria()}
        onClose={() => setABorrarMateria(null)}
      />
    </div>
  );
}
