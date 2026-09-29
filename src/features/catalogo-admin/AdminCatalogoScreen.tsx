// src/features/catalogo-admin/AdminCatalogoScreen.tsx
//
// S4-10 (Integrante 2, opcional) — ABM real de carreras y materias, sin
// mocks. Acceso restringido a `usuario.rol === "admin"` (el guard vive en
// App.tsx, no acá: esta pantalla asume que ya se verificó el rol).
import { useEffect, useState } from "react";
import { ApiError } from "../../api/client";
import { ConfirmDialog, FormModal, ListState } from "../../components";
import { useToast } from "../../hooks/useToast";
import type { Carrera, Materia } from "../../api/types";
import { useCarreras, useMateriasDeCarrera } from "../catalogo/hooks";
import { carreraFormInitial, carreraSpec, type CarreraForm } from "./carreraSpec";
import { useBorrarCarrera, useBorrarCorrelativa, useCorrelativas, useCrearCorrelativa, useBorrarMateria } from "./hooks";
import { materiaFormInitial, materiaSpec, type MateriaForm } from "./materiaSpec";

const selectClassName =
  "w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none transition focus:border-violet";

const searchInputClassName =
  "w-full max-w-md rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition focus:border-violet placeholder:text-muted";

const nuevoButtonClassName = "flex-shrink-0 rounded-full bg-green px-3 py-1.5 text-xs font-semibold text-white";

function MateriaCard({
  materia,
  mostrarAnio,
  onEditar,
  onBorrar,
}: {
  materia: Materia;
  mostrarAnio: boolean;
  onEditar: () => void;
  onBorrar: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-text">{materia.nombre}</div>
        <div className="mt-1 text-xs text-muted">
          {materia.codigo}
          {mostrarAnio ? ` · ${materia.anio}º año` : ""} · {materia.cuatrimestre}º cuatrimestre
        </div>
      </div>
      <div className="mt-3 flex gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={onEditar}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:text-text"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onBorrar}
          className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300"
        >
          Borrar
        </button>
      </div>
    </div>
  );
}

function CorrelativasPanel({ materias }: { materias: Materia[] }) {
  const { pushToast } = useToast();
  const [estaMateriaId, setEstaMateriaId] = useState<number | null>(null);
  const [requiereId, setRequiereId] = useState<number | "">("");

  const correlativasQuery = useCorrelativas(estaMateriaId);
  const crear = useCrearCorrelativa(() => {
    pushToast("Correlatividad creada.", "success");
    setRequiereId("");
    correlativasQuery.refetch();
  });
  const borrar = useBorrarCorrelativa(() => {
    pushToast("Correlatividad eliminada.", "success");
    correlativasQuery.refetch();
  });

  const opcionesRequiere = materias.filter((m) => m.id !== estaMateriaId);

  async function handleCrear() {
    if (estaMateriaId == null || requiereId === "") return;
    try {
      await crear.run({ materia_id: estaMateriaId, requiere_id: requiereId });
    } catch (error) {
      pushToast(error instanceof ApiError ? error.detail : "No se pudo crear la correlatividad.", "error");
    }
  }

  async function handleBorrar(id: number) {
    try {
      await borrar.run(id);
    } catch (error) {
      pushToast(error instanceof ApiError ? error.detail : "No se pudo eliminar.", "error");
    }
  }

  return (
    <div>
      <div className="mb-3 text-sm font-bold text-text">Correlatividades</div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-muted">Esta materia</label>
          <select
            value={estaMateriaId ?? ""}
            onChange={(e) => {
              setEstaMateriaId(e.target.value ? Number(e.target.value) : null);
              setRequiereId("");
            }}
            className={selectClassName}
          >
            <option value="">Seleccionar</option>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Requiere aprobada/cursada
          </label>
          <select
            value={requiereId}
            disabled={estaMateriaId == null}
            onChange={(e) => setRequiereId(e.target.value ? Number(e.target.value) : "")}
            className={[selectClassName, "disabled:cursor-not-allowed disabled:opacity-50"].join(" ")}
          >
            <option value="">Seleccionar</option>
            {opcionesRequiere.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void handleCrear()}
        disabled={estaMateriaId == null || requiereId === "" || crear.loading}
        className="mb-4 rounded-lg border border-violet/60 bg-violet/10 px-3 py-1.5 text-xs font-semibold text-violet disabled:cursor-not-allowed disabled:opacity-40"
      >
        {crear.loading ? "Agregando…" : "+ Agregar correlatividad"}
      </button>

      {estaMateriaId == null ? (
        <div className="text-xs text-muted">Elegí una materia para ver sus correlatividades.</div>
      ) : (
        <ListState
          loading={correlativasQuery.loading}
          error={correlativasQuery.error}
          items={correlativasQuery.data?.items ?? []}
          emptyTitle="Sin correlatividades"
          emptyDescription="Esta materia no requiere ninguna otra todavía."
          onRetry={() => correlativasQuery.refetch()}
        >
          <div className="space-y-2">
            {(correlativasQuery.data?.items ?? []).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="truncate text-sm text-text">{c.requiere?.nombre ?? `Materia #${c.requiere_id}`}</span>
                <button
                  type="button"
                  onClick={() => void handleBorrar(c.id)}
                  className="flex-shrink-0 rounded-lg border border-red-500/40 px-3 py-1 text-xs font-medium text-red-300"
                >
                  Borrar
                </button>
              </div>
            ))}
          </div>
        </ListState>
      )}
    </div>
  );
}

export default function AdminCatalogoScreen({ onVolver }: { onVolver?: () => void }) {
  const { pushToast } = useToast();

  const carrerasQuery = useCarreras({ per_page: 100 });
  const carrerasList = carrerasQuery.data?.items ?? [];
  const [busquedaCarrera, setBusquedaCarrera] = useState("");
  const qCarrera = busquedaCarrera.trim().toLowerCase();
  const carrerasFiltradas = qCarrera
    ? carrerasList.filter((c) => c.nombre.toLowerCase().includes(qCarrera))
    : carrerasList;

  const [carreraSeleccionada, setCarreraSeleccionada] = useState<number | null>(null);
  const carreraId = carreraSeleccionada ?? carrerasList[0]?.id ?? 0;
  const materiasQuery = useMateriasDeCarrera(carreraId);
  const materiasCarrera = materiasQuery.data?.items ?? [];

  const [modalCarrera, setModalCarrera] = useState<{ open: boolean; item: Carrera | null }>({ open: false, item: null });
  const [aBorrarCarrera, setABorrarCarrera] = useState<Carrera | null>(null);
  const [modalMateria, setModalMateria] = useState<{ open: boolean; item: Materia | null }>({ open: false, item: null });
  const [aBorrarMateria, setABorrarMateria] = useState<Materia | null>(null);
  const [filtroAnio, setFiltroAnio] = useState<number | "todas">(1);
  const [busquedaMateria, setBusquedaMateria] = useState("");

  // Al cambiar de carrera, el año elegido puede no existir ahí (carreras con
  // distinta duración) — volver siempre al arranque ("1º año") evita quedar
  // en un filtro que no tiene sentido para la carrera nueva.
  useEffect(() => {
    setFiltroAnio(1);
    setBusquedaMateria("");
  }, [carreraId]);

  const aniosDisponibles = [...new Set(materiasCarrera.map((m) => m.anio))].sort((a, b) => a - b);

  const qMateria = busquedaMateria.trim().toLowerCase();
  const buscandoMateria = qMateria.length > 0;

  const materiasFiltradas = materiasCarrera.filter((m) => {
    if (buscandoMateria) {
      return m.nombre.toLowerCase().includes(qMateria) || m.codigo.toLowerCase().includes(qMateria);
    }
    return filtroAnio === "todas" || m.anio === filtroAnio;
  });

  // La búsqueda cruza todos los años (para encontrar una materia puntual sin
  // depender del filtro activo) y el filtro "Todas" también junta varios años
  // — en ambos casos conviene agrupar por año para no perder de vista dónde
  // está cada una. Con un año puntual elegido (y sin búsqueda), alcanza con
  // una lista simple.
  const mostrarAgrupado = filtroAnio === "todas" || buscandoMateria;
  const gruposPorAnio: [number, Materia[]][] = mostrarAgrupado
    ? Object.entries(
        materiasFiltradas.reduce<Record<number, Materia[]>>((acc, m) => {
          (acc[m.anio] ??= []).push(m);
          return acc;
        }, {}),
      )
        .map(([anio, lista]): [number, Materia[]] => [
          Number(anio),
          [...lista].sort((a, b) => a.cuatrimestre - b.cuatrimestre || a.nombre.localeCompare(b.nombre)),
        ])
        .sort(([a], [b]) => a - b)
    : [];
  const listaPlana = mostrarAgrupado
    ? []
    : [...materiasFiltradas].sort((a, b) => a.cuatrimestre - b.cuatrimestre || a.nombre.localeCompare(b.nombre));

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
        {onVolver ? (
          <button type="button" onClick={onVolver} className="mb-4 text-sm text-muted transition hover:text-text">
            ← Materias
          </button>
        ) : null}

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
              className={nuevoButtonClassName}
            >
              + Nueva
            </button>
          </div>

          <input
            type="text"
            value={busquedaCarrera}
            onChange={(e) => setBusquedaCarrera(e.target.value)}
            placeholder="Buscar carrera por nombre…"
            className={[searchInputClassName, "mb-3"].join(" ")}
          />

          <ListState
            loading={carrerasQuery.loading}
            error={carrerasQuery.error}
            items={carrerasFiltradas}
            emptyTitle={qCarrera ? "Sin resultados" : "Sin carreras"}
            emptyDescription={qCarrera ? "Ninguna carrera coincide con la búsqueda." : "Tocá + Nueva para cargar la primera."}
            onRetry={() => carrerasQuery.refetch()}
          >
            <div className="space-y-2">
              {carrerasFiltradas.map((c) => {
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
              className={[nuevoButtonClassName, "disabled:cursor-not-allowed disabled:opacity-40"].join(" ")}
            >
              + Nueva
            </button>
          </div>

          <input
            type="text"
            value={busquedaMateria}
            onChange={(e) => setBusquedaMateria(e.target.value)}
            placeholder="Buscar materia por nombre o código…"
            className={[searchInputClassName, "mb-3"].join(" ")}
          />

          {/* Con muchas materias cargadas, la lista plana se hace difícil de
              seguir — el año más chico va primero y activo por defecto; el
              resto queda oculto hasta elegir "Todas". Buscando texto, el
              filtro de año se ignora (para encontrar una materia puntual sin
              importar en qué año esté). */}
          {!buscandoMateria ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {aniosDisponibles.map((anio) => (
                <button
                  key={anio}
                  type="button"
                  onClick={() => setFiltroAnio(anio)}
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    filtroAnio === anio ? "border-violet bg-violet text-white" : "border-border bg-card text-muted",
                  ].join(" ")}
                >
                  {anio}º año
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFiltroAnio("todas")}
                className={[
                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                  filtroAnio === "todas" ? "border-violet bg-violet text-white" : "border-border bg-card text-muted",
                ].join(" ")}
              >
                Todas
              </button>
            </div>
          ) : null}

          <ListState
            loading={materiasQuery.loading}
            error={materiasQuery.error}
            items={materiasFiltradas}
            emptyTitle="Sin materias"
            emptyDescription={
              buscandoMateria
                ? "Ninguna materia coincide con la búsqueda."
                : filtroAnio === "todas"
                  ? "Esta carrera todavía no tiene materias cargadas."
                  : "No hay materias de ese año."
            }
            onRetry={() => materiasQuery.refetch()}
          >
            {mostrarAgrupado ? (
              <div className="space-y-5">
                {gruposPorAnio.map(([anio, materiasDelAnio]) => (
                  <div key={anio}>
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-muted">{anio}º año</div>
                    <div className="space-y-2">
                      {materiasDelAnio.map((m) => (
                        <MateriaCard
                          key={m.id}
                          materia={m}
                          mostrarAnio={false}
                          onEditar={() => setModalMateria({ open: true, item: m })}
                          onBorrar={() => setABorrarMateria(m)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {listaPlana.map((m) => (
                  <MateriaCard
                    key={m.id}
                    materia={m}
                    mostrarAnio={false}
                    onEditar={() => setModalMateria({ open: true, item: m })}
                    onBorrar={() => setABorrarMateria(m)}
                  />
                ))}
              </div>
            )}
          </ListState>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <CorrelativasPanel materias={materiasQuery.data?.items ?? []} />
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
