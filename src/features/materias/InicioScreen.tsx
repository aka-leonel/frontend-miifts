import { getMiUsuario } from "../../api/scope";
import { useRecordatorios } from "../recordatorios/hooks";
import { estadoLabel } from "./estado";
import { useMisMaterias, usePromedio } from "./hooks";
import ByteWidget from "./ByteWidget";
import PromedioCard from "./PromedioCard";

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const dotByTipo: Record<string, string> = {
  parcial: "bg-violet",
  tp: "bg-lime",
  final: "bg-green",
  otro: "bg-fuchsia-400",
};

export default function InicioScreen({ onOpenMateria }: { onOpenMateria?: (id: number) => void }) {
  const usuario = getMiUsuario();
  const lista = useMisMaterias(1);
  const promedio = usePromedio();
  const recordatorios = useRecordatorios({ desde: hoyISO(), per_page: 3 });

  const items = lista.data?.items ?? [];
  // S4-08: `c.estado==="aprobada"` es el campo crudo del backend (sin
  // umbral) — usar `estadoLabel` para que coincida con la badge "Reprobada".
  const aprobadas = items.filter((c) => estadoLabel(c) === "Aprobada").length;
  const total = lista.data?.total ?? 0;

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-6 pt-14">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-muted">Bienvenida de vuelta</div>
            <div className="text-2xl font-black tracking-[-0.04em] text-text">Hola, {usuario.nombre.split(" ")[0]} 👋</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-[#6B5CE7] text-sm font-bold text-white">
            {usuario.nombre.slice(0, 2).toUpperCase()}
          </div>
        </div>

        <div className="mb-6">
          <ByteWidget aprobadas={aprobadas} total={total} />
        </div>

        <PromedioCard promedio={promedio.data} loading={promedio.loading} />

        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-bold text-text">Próximos</div>
            <span className="text-xs text-muted">{recordatorios.data?.total ?? 0} recordatorios</span>
          </div>
          {recordatorios.loading && !recordatorios.data ? (
            <div className="space-y-2">
              <div className="h-16 animate-pulse rounded-2xl border border-border bg-card" />
              <div className="h-16 animate-pulse rounded-2xl border border-border bg-card" />
            </div>
          ) : (recordatorios.data?.items.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="text-sm font-semibold text-text">Sin próximos recordatorios</div>
              <div className="mt-1 text-xs text-muted">Cuando agregues uno, aparecerá acá.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {recordatorios.data?.items.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => r.materia_id && onOpenMateria?.(r.materia_id)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left"
                >
                  <span className={["h-2 w-2 flex-shrink-0 rounded-full", dotByTipo[r.tipo] ?? "bg-muted"].join(" ")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-text">{r.titulo}</span>
                    <span className="text-xs text-muted">{new Date(r.fecha).toLocaleDateString("es-AR")} · {r.tipo}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 text-sm font-bold text-text">Mis materias</div>
          {lista.loading && !lista.data ? (
            <div className="h-20 animate-pulse rounded-2xl border border-border bg-card" />
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted">Todavía no cargaste materias.</div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {items.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onOpenMateria?.(c.materia_id)}
                  className="min-w-[150px] max-w-[150px] flex-shrink-0 rounded-2xl border border-border bg-card p-4 text-left"
                >
                  <div className="truncate text-sm font-semibold text-text">{c.materia?.nombre ?? `Materia #${c.materia_id}`}</div>
                  <div className="mt-1 text-xs capitalize text-muted">{c.estado}</div>
                  {c.nota_final != null ? <div className="mt-2 text-xs font-bold text-violet">Nota {c.nota_final}</div> : null}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
