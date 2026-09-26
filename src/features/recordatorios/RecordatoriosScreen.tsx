// src/features/recordatorios/RecordatoriosScreen.tsx

//

// Integrante 4 (INTEGRACION_FRONT.md §2.14) — Agenda global de recordatorios.

// Reemplaza al mock `RecordatoriosScreen` de App.tsx (queda como código

// muerto, mismo criterio que se usó con Convenios): mismo layout / colores,

// datos y alta/borrado reales. Usa el <RecordatorioCard> compartido (mismo

// que importa Integrante 3 en el detalle de materia) en vez de duplicar una

// tarjeta local.

import { useMemo, useState, useEffect } from "react"

import { FormModal, ListState } from "../../components"

import { useToast } from "../../hooks/useToast"

import { usePush } from "../../hooks/usePush"

import { RecordatorioCard } from "./RecordatorioCard"

import { useBorrarRecordatorio, useRecordatorios } from "./hooks"

import {
  recordatorioFormInitial,
  recordatorioInitial,
  recordatorioSpec,
} from "./recordatorioSpec"

import type { Recordatorio } from "../../api/types"

export default function RecordatoriosScreen() {
  const { pushToast } = useToast()

  const {
    isSupported,
    permission,
    subscription,
    loading: pushLoading,
    error: pushError,
    activar,
    desactivar,
    actualizarContador,
  } = usePush()

  const [modalOpen, setModalOpen] = useState(false)

  const [editItem, setEditItem] = useState<Recordatorio | null>(null)

  const [showPushRationale, setShowPushRationale] = useState(false)

  const [showPushDeniedBanner, setShowPushDeniedBanner] = useState(false)

  const lista = useRecordatorios({ per_page: 100 })

  const borrar = useBorrarRecordatorio(() => {
    pushToast("Recordatorio eliminado.", "success")

    lista.refetch()

    actualizarContador()
  })

  // Actualizar contador tras crear/editar

  const handleSuccess = () => {
    pushToast(
      editItem ? "Recordatorio actualizado." : "Recordatorio agregado.",
      "success",
    )

    setEditItem(null)

    lista.refetch()

    actualizarContador()
  }

  // Mostrar rationale si el permiso es 'default' y no hay suscripción

  useEffect(() => {
    if (isSupported && permission === "default" && !subscription) {
      setShowPushRationale(true)
    }
  }, [isSupported, permission, subscription])

  // Mostrar banner si el permiso fue denegado

  useEffect(() => {
    if (isSupported && permission === "denied" && !subscription) {
      setShowPushDeniedBanner(true)
    }
  }, [isSupported, permission, subscription])

  const handleActivarNotificaciones = async () => {
    setShowPushRationale(false)

    try {
      await activar()

      pushToast("Notificaciones activadas.", "success")
    } catch (err) {
      // El error ya se muestra en el hook, pero podemos agregar toast adicional

      if (err instanceof Error && err.message.includes("denegado")) {
        setShowPushDeniedBanner(true)
      }
    }
  }

  const handleDesactivarNotificaciones = async () => {
    try {
      await desactivar()

      pushToast("Notificaciones desactivadas.", "success")
    } catch (err) {
      pushToast("Error desactivando notificaciones.", "error")
    }
  }

  const items = useMemo(() => lista.data?.items ?? [], [lista.data])

  // Capturado una sola vez al montar: separar en "esta semana" / "más

  // adelante" no necesita actualizarse mientras la pantalla sigue abierta.

  const [ahora] = useState(() => Date.now())

  const { estaSemana, masAdelante } = useMemo(() => {
    const limite = ahora + 7 * 24 * 60 * 60 * 1000

    const estaSemana: Recordatorio[] = []

    const masAdelante: Recordatorio[] = []

    for (const r of items) {
      const t = new Date(r.fecha).getTime()
      ;(Number.isFinite(t) && t <= limite ? estaSemana : masAdelante).push(r)
    }

    return { estaSemana, masAdelante }
  }, [items, ahora])

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* S5-10: mismo contenedor fluido que Inicio/Materias/Convenios/Perfil
          — esta pantalla era la única que se quedaba en una columna angosta
          sin importar el ancho de la ventana. */}
      <div className="mx-auto w-full max-w-lg px-4 pt-14 sm:max-w-2xl sm:px-6 lg:max-w-6xl xl:max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-2xl font-black tracking-[-0.04em] text-text">
              Recordatorios
            </div>
            <div className="mt-1 text-sm text-muted">
              {items.length} recordatorio{items.length !== 1 ? "s" : ""} activo
              {items.length !== 1 ? "s" : ""}
            </div>
          </div>
          {/* Push Notification UI */}
          {isSupported && !subscription && permission !== "denied" && (
            <button
              type="button"
              onClick={() => setShowPushRationale(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet rounded-xl hover:opacity-90 transition-opacity"
              disabled={pushLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21a2 2 0 01-3.46 0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Activar notificaciones
            </button>
          )}
          {isSupported && subscription && (
            <button
              type="button"
              onClick={handleDesactivarNotificaciones}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-surface2 border border-border rounded-xl hover:bg-surface2/80 transition-colors"
              disabled={pushLoading}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21a2 2 0 01-3.46 0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="1"
                  y1="1"
                  x2="23"
                  y2="23"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Notificaciones activas
            </button>
          )}
          {!isSupported && (
            <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted bg-surface2 border border-border rounded-xl">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21a2 2 0 01-3.46 0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="1"
                  y1="1"
                  x2="23"
                  y2="23"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Push no soportado
            </div>
          )}
        </div>

        {/* Rationale Modal */}
        {showPushRationale && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={() => setShowPushRationale(false)}
          >
            <div
              className="w-full max-w-md bg-card rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet/10">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-violet"
                  >
                    <path
                      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.73 21a2 2 0 01-3.46 0"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text">
                  Activar notificaciones
                </h3>
              </div>
              <p className="text-muted mb-6">
                Recibí avisos cuando tengas recordatorios por vencer, incluso
                con la app cerrada. Solo te notificamos lo importante, sin spam.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPushRationale(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-text bg-surface2 border border-border rounded-xl hover:bg-surface2/80 transition-colors"
                >
                  Ahora no
                </button>
                <button
                  type="button"
                  onClick={handleActivarNotificaciones}
                  disabled={pushLoading}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-violet rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {pushLoading ? "Activando…" : "Activar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Push Denied Banner */}
        {showPushDeniedBanner && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-amber-500 mt-0.5 flex-shrink-0"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="16"
                r="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <div className="flex-1 text-sm text-amber-500">
              <p className="font-medium">Notificaciones bloqueadas</p>
              <p className="mt-1">
                Para activarlas, habilitá las notificaciones en la configuración
                del navegador.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPushDeniedBanner(false)}
              className="text-amber-500 hover:text-amber-400"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Push Error */}
        {pushError && !pushLoading && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-red-500 mt-0.5 flex-shrink-0"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="16"
                r="1"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <div className="flex-1 text-sm text-red-500">{pushError}</div>
            <button
              type="button"
              onClick={() => {
                /* error se limpia solo al reintentar */
              }}
              className="text-red-500 hover:text-red-400"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}

        <ListState
          loading={lista.loading}
          error={lista.error}
          items={items}
          emptyTitle="Sin recordatorios"
          emptyDescription="Tocá + para agregar el primero."
          onRetry={() => lista.refetch()}
        >
          <div className="space-y-6">
{estaSemana.length > 0 && (
                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                    Esta semana
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {estaSemana.map((r) => (
                    <RecordatorioCard
                      key={r.id}
                      recordatorio={r}
                      disabled={borrar.loading}
                      onEdit={() => {
                        setEditItem(r)

                        setModalOpen(true)
                      }}
                      onDelete={() => borrar.run(r.id)}
                    />
                  ))}
                </div>
              </div>
            )}
{masAdelante.length > 0 && (
                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                    Más adelante
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {masAdelante.map((r) => (
                    <RecordatorioCard
                      key={r.id}
                      recordatorio={r}
                      disabled={borrar.loading}
                      onEdit={() => {
                        setEditItem(r)

                        setModalOpen(true)
                      }}
                      onDelete={() => borrar.run(r.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ListState>
      </div>

      <button
        type="button"
        onClick={() => {
          setEditItem(null)

          setModalOpen(true)
        }}
        className="fixed bottom-[90px] right-6 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-violet text-2xl text-white shadow-[0_4px_20px_rgba(140,125,255,0.4)]"
        aria-label="Agregar recordatorio"
      >
        +
      </button>

      <FormModal
        open={modalOpen}
        item={editItem ?? undefined}
        spec={recordatorioSpec()}
        initialValues={
          editItem ? recordatorioFormInitial(editItem) : recordatorioInitial
        }
        onClose={() => {
          setModalOpen(false)

          setEditItem(null)
        }}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
