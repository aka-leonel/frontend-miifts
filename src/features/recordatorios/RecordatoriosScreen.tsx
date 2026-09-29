// src/features/recordatorios/RecordatoriosScreen.tsx
//
// Integrante 4 (INTEGRACION_FRONT.md §2.14) — Agenda global de recordatorios.
// Reemplaza al mock `RecordatoriosScreen` de App.tsx (queda como código
// muerto, mismo criterio que se usó con Convenios): mismo layout / colores,
// datos y alta/borrado reales. Usa el <RecordatorioCard> compartido (mismo
// que importa Integrante 3 en el detalle de materia) en vez de duplicar una
// tarjeta local.
//
// El bloque de notificaciones push (rationale, banners, botón del header) se
// rescató de feature/recordatorios-front — ver la nota en src/lib/push.ts
// sobre por qué esa rama no se pudo mergear tal cual.
import { useMemo, useState } from "react";
import { FormModal, ListState, Modal } from "../../components";
import { useToast } from "../../hooks/useToast";
import { usePush } from "../../hooks/usePush";
import { RecordatorioCard } from "./RecordatorioCard";
import { useBorrarRecordatorio, useRecordatorios } from "./hooks";
import { recordatorioFormInitial, recordatorioInitial, recordatorioSpec } from "./recordatorioSpec";
import type { Recordatorio } from "../../api/types";

function CampanaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Botón del header: activar / ya activadas (toca desactivar) / no soportado. */
function BotonPush({
  isSupported,
  subscription,
  loading,
  onActivar,
  onDesactivar,
}: {
  isSupported: boolean;
  subscription: PushSubscription | null;
  loading: boolean;
  onActivar: () => void;
  onDesactivar: () => void;
}) {
  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface2 px-4 py-2 text-sm text-muted">
        <CampanaIcon />
        Push no soportado en este navegador
      </div>
    );
  }
  if (subscription) {
    return (
      <button
        type="button"
        aria-pressed="true"
        onClick={onDesactivar}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl border border-border bg-surface2 px-4 py-2 text-sm font-medium text-text transition hover:bg-surface2/80 disabled:opacity-60"
      >
        <CampanaIcon />
        Notificaciones activas
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-pressed="false"
      onClick={onActivar}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:opacity-90 disabled:opacity-60"
    >
      <CampanaIcon />
      Activar notificaciones
    </button>
  );
}

export default function RecordatoriosScreen() {
  const { pushToast } = useToast();
  const push = usePush();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Recordatorio | null>(null);
  const [rationaleAbierto, setRationaleAbierto] = useState(false);
  const [bannerDenegado, setBannerDenegado] = useState(false);
  const lista = useRecordatorios({ per_page: 100 });

  const borrar = useBorrarRecordatorio(() => {
    pushToast("Recordatorio eliminado.", "success");
    lista.refetch();
    void push.actualizarContador();
  });

  const activarNotificaciones = async () => {
    setRationaleAbierto(false);
    try {
      await push.activar();
      pushToast("Notificaciones activadas.", "success");
    } catch {
      if (push.permission === "denied") setBannerDenegado(true);
      // otros errores ya quedan en push.error, mostrado abajo
    }
  };

  const desactivarNotificaciones = async () => {
    try {
      await push.desactivar();
      pushToast("Notificaciones desactivadas.", "success");
    } catch {
      pushToast("No se pudieron desactivar las notificaciones.", "error");
    }
  };

  const items = useMemo(() => lista.data?.items ?? [], [lista.data]);
  // Capturado una sola vez al montar: separar en "esta semana" / "más
  // adelante" no necesita actualizarse mientras la pantalla sigue abierta.
  const [ahora] = useState(() => Date.now());

  const { estaSemana, masAdelante } = useMemo(() => {
    const limite = ahora + 7 * 24 * 60 * 60 * 1000;
    const estaSemana: Recordatorio[] = [];
    const masAdelante: Recordatorio[] = [];
    for (const r of items) {
      const t = new Date(r.fecha).getTime();
      (Number.isFinite(t) && t <= limite ? estaSemana : masAdelante).push(r);
    }
    return { estaSemana, masAdelante };
  }, [items, ahora]);

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* S5-10: mismo contenedor fluido que Inicio/Materias/Convenios/Perfil
          — esta pantalla era la única que se quedaba en una columna angosta
          sin importar el ancho de la ventana. */}
      <div className="mx-auto w-full max-w-lg px-4 pt-14 sm:max-w-2xl sm:px-6 lg:max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-[-0.04em] text-text">Recordatorios</h1>
            <div className="mt-1 text-sm text-muted">
              {items.length} recordatorio{items.length !== 1 ? "s" : ""} activo{items.length !== 1 ? "s" : ""}
            </div>
          </div>
          <BotonPush
            isSupported={push.isSupported}
            subscription={push.subscription}
            loading={push.loading}
            onActivar={() => setRationaleAbierto(true)}
            onDesactivar={() => void desactivarNotificaciones()}
          />
        </div>

        {bannerDenegado ? (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
            <div className="flex-1 text-sm text-warning">
              <p className="font-semibold">Notificaciones bloqueadas</p>
              <p className="mt-1">Para activarlas, habilitá las notificaciones de este sitio en la configuración del navegador.</p>
            </div>
            <button
              type="button"
              onClick={() => setBannerDenegado(false)}
              aria-label="Cerrar aviso"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-warning transition hover:opacity-80"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ) : null}

        {push.error ? (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
            <div className="flex-1">{push.error}</div>
          </div>
        ) : null}

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
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted">Esta semana</h2>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {estaSemana.map((r) => (
                    <RecordatorioCard
                      key={r.id}
                      recordatorio={r}
                      disabled={borrar.loading}
                      onEdit={() => {
                        setEditItem(r);
                        setModalOpen(true);
                      }}
                      onDelete={() => borrar.run(r.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            {masAdelante.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted">Más adelante</h2>
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {masAdelante.map((r) => (
                    <RecordatorioCard
                      key={r.id}
                      recordatorio={r}
                      disabled={borrar.loading}
                      onEdit={() => {
                        setEditItem(r);
                        setModalOpen(true);
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
          setEditItem(null);
          setModalOpen(true);
        }}
        className="fixed bottom-[90px] right-6 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-primary text-2xl text-on-primary shadow-[0_4px_20px_rgba(140,125,255,0.4)]"
        aria-label="Agregar recordatorio"
      >
        +
      </button>

      <FormModal
        open={modalOpen}
        item={editItem ?? undefined}
        spec={recordatorioSpec()}
        initialValues={editItem ? recordatorioFormInitial(editItem) : recordatorioInitial}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        onSuccess={() => {
          pushToast(editItem ? "Recordatorio actualizado." : "Recordatorio agregado.", "success");
          setEditItem(null);
          lista.refetch();
          void push.actualizarContador();
        }}
      />

      {rationaleAbierto ? (
        <Modal title="Activar notificaciones" onClose={() => setRationaleAbierto(false)} className="w-full max-w-md p-6">
          <p className="text-sm text-muted">
            Recibí avisos cuando tengas recordatorios por vencer, incluso con la app cerrada. Solo te notificamos lo
            importante, sin spam.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setRationaleAbierto(false)}
              className="flex-1 rounded-xl border border-border bg-surface2 px-4 py-2.5 text-sm font-medium text-text transition hover:bg-surface2/80"
            >
              Ahora no
            </button>
            <button
              type="button"
              onClick={() => void activarNotificaciones()}
              disabled={push.loading}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition hover:opacity-90 disabled:opacity-60"
            >
              {push.loading ? "Activando…" : "Activar"}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
