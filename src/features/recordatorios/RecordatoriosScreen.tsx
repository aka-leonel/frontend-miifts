// src/features/recordatorios/RecordatoriosScreen.tsx
//
// Integrante 4 (INTEGRACION_FRONT.md §2.14) — Agenda global de recordatorios.
// Reemplaza al mock `RecordatoriosScreen` de App.tsx (queda como código
// muerto, mismo criterio que se usó con Convenios): mismo layout / colores,
// datos y alta/borrado reales. Usa el <RecordatorioCard> compartido (mismo
// que importa Integrante 3 en el detalle de materia) en vez de duplicar una
// tarjeta local.
import { useMemo, useState } from "react";
import { FormModal, ListState } from "../../components";
import { useToast } from "../../hooks/useToast";
import { RecordatorioCard } from "./RecordatorioCard";
import { useBorrarRecordatorio, useRecordatorios } from "./hooks";
import { recordatorioInitial, recordatorioSpec } from "./recordatorioSpec";
import type { Recordatorio } from "../../api/types";

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
                    <RecordatorioCard
                      key={r.id}
                      recordatorio={r}
                      disabled={borrar.loading}
                      onDelete={() => borrar.run(r.id)}
                    />
                  ))}
                </div>
              </div>
            )}
            {masAdelante.length > 0 && (
              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted">Más adelante</div>
                <div className="space-y-2.5">
                  {masAdelante.map((r) => (
                    <RecordatorioCard
                      key={r.id}
                      recordatorio={r}
                      disabled={borrar.loading}
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
        onClick={() => setModalOpen(true)}
        className="fixed bottom-[90px] right-[calc(50%-190px)] flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-violet text-2xl text-white shadow-[0_4px_20px_rgba(140,125,255,0.4)]"
        aria-label="Agregar recordatorio"
      >
        +
      </button>

      <FormModal
        open={modalOpen}
        spec={recordatorioSpec()}
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
