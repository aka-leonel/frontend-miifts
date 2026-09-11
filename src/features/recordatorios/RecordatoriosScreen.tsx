// src/features/recordatorios/RecordatoriosScreen.tsx
//
// Integrante 4 (INTEGRACION_FRONT.md §2.14) — Agenda global de recordatorios.
// Reemplaza al mock `RecordatoriosScreen` de App.tsx (que quedó como código
// muerto, mismo criterio que se usó con Convenios): mismo layout / colores,
// datos y alta/borrado reales.

import { useMemo, useState } from "react";
import { FormModal, ListState } from "../../components";
import { useToast } from "../../hooks/useToast";
import { useBorrarRecordatorio, useRecordatorios } from "./hooks";
import { recordatorioInitial, recordatorioSpec } from "./recordatorioSpec";
import type { Recordatorio } from "../../api/types";

const DOT_CLASS: Record<string, string> = {
  parcial: "bg-violet",
  tp: "bg-lime",
  final: "bg-green",
  otro: "bg-fuchsia-400",
};

const CHIP_CLASS: Record<string, string> = {
  parcial: "bg-violet/20 text-violet",
  tp: "bg-lime/20 text-lime",
  final: "bg-green/20 text-green",
  otro: "bg-fuchsia-400/20 text-fuchsia-300",
};

const TIPO_LABEL: Record<string, string> = {
  parcial: "Parcial",
  tp: "TP",
  final: "Final",
  otro: "Otro",
};

function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReminderCard({ r, onDelete, borrando }: { r: Recordatorio; onDelete: () => void; borrando: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <div className={["h-2.5 w-2.5 flex-shrink-0 rounded-full", DOT_CLASS[r.tipo] ?? "bg-muted"].join(" ")} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-text">{r.titulo}</div>
        <div className="mt-1 text-xs text-muted">
          <span className={["mr-1.5 rounded-full px-2 py-0.5 text-[11px]", CHIP_CLASS[r.tipo] ?? "bg-muted/20 text-muted"].join(" ")}>
            {TIPO_LABEL[r.tipo] ?? r.tipo}
          </span>
          {formatearFecha(r.fecha)}
        </div>
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={borrando}
        className="rounded-lg p-1 text-[#FF6B6B] transition disabled:opacity-50"
        aria-label={`Eliminar ${r.titulo}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

export default function RecordatoriosScreen() {
  const { pushToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const lista = useRecordatorios({ per_page: 100 });

  const borrar = useBorrarRecordatorio(() => {
    pushToast("Recordatorio eliminado.", "success");
    lista.refetch();
  });

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
      <div className="px-6 pt-14">
        <div className="mb-6">
          <div className="text-2xl font-black tracking-[-0.04em] text-text">Recordatorios</div>
          <div className="mt-1 text-sm text-muted">
            {items.length} recordatorio{items.length !== 1 ? "s" : ""} activo{items.length !== 1 ? "s" : ""}
          </div>
        </div>

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
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted">Esta semana</div>
                <div className="space-y-2.5">
                  {estaSemana.map((r) => (
                    <ReminderCard key={r.id} r={r} borrando={borrar.loading} onDelete={() => borrar.run(r.id)} />
                  ))}
                </div>
              </div>
            )}
            {masAdelante.length > 0 && (
              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted">Más adelante</div>
                <div className="space-y-2.5">
                  {masAdelante.map((r) => (
                    <ReminderCard key={r.id} r={r} borrando={borrar.loading} onDelete={() => borrar.run(r.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ListState>
      </div>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="fixed bottom-[90px] right-[calc(50%-190px)] flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-violet text-2xl text-white shadow-[0_4px_20px_rgba(140,125,255,0.4)]"
        aria-label="Agregar recordatorio"
      >
        +
      </button>

      <FormModal
        open={modalOpen}
        spec={recordatorioSpec}
        initialValues={recordatorioInitial}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          pushToast("Recordatorio agregado.", "success");
          lista.refetch();
        }}
      />
    </div>
  );
}
