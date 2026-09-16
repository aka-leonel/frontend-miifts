import { useEffect, useState } from "react";
import { useCarreras } from "../catalogo/hooks";
import { useMisMaterias } from "../materias/hooks";
import { useAuthMe } from "./hooks";

const SESSION_KEYS = ["miifts_token", "miifts_usuario"] as const;

function iniciales(nombre: string, apellido?: string): string {
  const inicialNombre = nombre.trim()[0];
  const inicialApellido = apellido?.trim()[0];
  if (!inicialNombre) return "?";
  return (inicialNombre + (inicialApellido ?? "")).toUpperCase();
}

export default function PerfilScreen({ onCerrarSesion }: { onCerrarSesion: () => void }) {
  const me = useAuthMe();
  const carreras = useCarreras({ page: 1 });
  const misMaterias = useMisMaterias(1);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (!me.data) return;
    const usuario = me.data;
    queueMicrotask(() => setNombre(usuario.nombre));
  }, [me.data]);

  const aprobadas = (misMaterias.data?.items ?? []).filter((c) => c.estado === "aprobada").length;
  const total = misMaterias.data?.total ?? 0;
  const pct = total > 0 ? Math.round((aprobadas / total) * 100) : 0;
  const carreraNombre =
    (carreras.data?.items ?? []).find((c) => c.id === me.data?.carrera_id)?.nombre ??
    (me.data ? `Carrera #${me.data.carrera_id}` : "");

  function handleLogout() {
    for (const key of SESSION_KEYS) window.localStorage.removeItem(key);
    onCerrarSesion();
  }

  if (me.loading && !me.data) {
    return (
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="mx-auto w-full max-w-lg px-4 pt-14 sm:px-6 md:max-w-2xl">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-surface2" />
          <div className="mt-8 flex justify-center">
            <div className="h-[88px] w-[88px] animate-pulse rounded-[28px] bg-surface2" />
          </div>
          <div className="mt-6 space-y-3.5">
            <div className="h-14 animate-pulse rounded-xl bg-surface2" />
            <div className="h-14 animate-pulse rounded-xl bg-surface2" />
            <div className="h-14 animate-pulse rounded-xl bg-surface2" />
          </div>
        </div>
      </div>
    );
  }

  if (me.error) {
    return (
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="mx-auto w-full max-w-lg px-4 pt-14 sm:px-6 md:max-w-2xl">
          <div className="mb-7">
            <div className="text-2xl font-black tracking-[-0.04em] text-text">Mi Perfil</div>
            <div className="mt-1 text-sm text-muted">Configurá tu cuenta</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="text-sm font-semibold text-text">No se pudo cargar tu perfil</div>
            <div className="mt-1 text-xs text-muted">{String((me.error as Error)?.message ?? me.error)}</div>
            <button
              type="button"
              onClick={() => me.refetch()}
              className="mt-4 rounded-xl bg-violet px-4 py-2 text-sm font-semibold text-white"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="mx-auto w-full max-w-lg px-4 pt-14 sm:px-6 md:max-w-2xl">
        <div className="mb-7">
          <div className="text-2xl font-black tracking-[-0.04em] text-text">Mi Perfil</div>
          <div className="mt-1 text-sm text-muted">Configurá tu cuenta</div>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-gradient-to-br from-violet to-[#6B5CE7] text-3xl font-extrabold text-white">
              {iniciales(nombre || me.data?.nombre || "?", me.data?.apellido)}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-muted">NOMBRE</label>
            <input
              value={nombre}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-border bg-card px-4 py-3.5 text-[15px] text-muted opacity-80 outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-muted">APELLIDO</label>
            <input
              value={me.data?.apellido ?? ""}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-border bg-card px-4 py-3.5 text-[15px] text-muted opacity-80 outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-muted">EMAIL</label>
            <input
              value={me.data?.email ?? ""}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-border bg-card px-4 py-3.5 text-[15px] text-muted opacity-80 outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-muted">CARRERA</label>
            <input
              value={carreras.loading ? "Cargando..." : carreraNombre}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-border bg-card px-4 py-3.5 text-[15px] text-muted opacity-80 outline-none"
            />
          </div>
        </div>

        <div className="mb-7 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <p className="text-xs leading-relaxed text-amber-200/90">
            La edición de nombre y carrera está deshabilitada hasta que esté disponible{" "}
            <span className="font-semibold">PATCH /auth/me</span> (INTEGRACION_FRONT.md §1.7).
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="mb-1 text-sm font-semibold text-text">
            Tu progreso con <span className="text-lime">Byte</span>
          </div>
          <div className="mb-2.5 text-xs text-muted">
            {aprobadas} de {total} materias aprobadas
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#2A2B36]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet to-lime"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-muted">{pct}% del plan completado</div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl border border-[#FF6B6B]/40 bg-[#FF6B6B]/10 px-6 py-[15px] text-[15px] font-semibold text-[#FF6B6B]"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
