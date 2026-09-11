// src/features/perfil/PerfilScreen.tsx
//
// Integrante 4 — Mi perfil. Reemplaza al mock `PerfilScreen` de App.tsx
// (mismo layout / colores; ese queda como código muerto, igual criterio que
// Convenios). Nombre/email vienen de `GET /auth/me` real; "guardar cambios"
// es solo visual hasta que exista `PATCH /auth/me` (gap §1.7 de
// INTEGRACION_FRONT.md); "cerrar sesión" sí es real: limpia la sesión del
// localStorage (mismas claves que usará el AuthProvider de Integrante 1).

import { useEffect, useState } from "react";
import { useCarreras } from "../catalogo/hooks";
import { useMisMaterias } from "../materias/hooks";
import { useAuthMe } from "./hooks";

const SESSION_KEYS = ["miifts_token", "miifts_usuario"] as const;

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  return (partes[0][0] + (partes[1]?.[0] ?? "")).toUpperCase();
}

export default function PerfilScreen({ onCerrarSesion }: { onCerrarSesion: () => void }) {
  const me = useAuthMe();
  const carreras = useCarreras({ page: 1 });
  const misMaterias = useMisMaterias(1);

  const [nombre, setNombre] = useState("");
  const [carreraId, setCarreraId] = useState<number | "">("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!me.data) return;
    // Semilla los campos editables con lo que llegó de /auth/me. Diferido a
    // un microtask (en vez de setState suelto en el cuerpo del efecto) para
    // no disparar un re-render síncrono en cascada.
    const usuario = me.data;
    queueMicrotask(() => {
      setNombre(usuario.nombre);
      setCarreraId(usuario.carrera_id);
    });
  }, [me.data]);

  const aprobadas = (misMaterias.data?.items ?? []).filter((c) => c.estado === "aprobada").length;
  const total = misMaterias.data?.total ?? 0;
  const pct = total > 0 ? Math.round((aprobadas / total) * 100) : 0;

  function handleSave() {
    // Solo visual: no hay PATCH /auth/me todavía (INTEGRACION_FRONT.md §1.7).
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleLogout() {
    for (const key of SESSION_KEYS) window.localStorage.removeItem(key);
    onCerrarSesion();
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="px-6 pt-14">
        <div className="mb-7">
          <div className="text-2xl font-black tracking-[-0.04em] text-text">Mi Perfil</div>
          <div className="mt-1 text-sm text-muted">Configurá tu cuenta</div>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-gradient-to-br from-violet to-[#6B5CE7] text-3xl font-extrabold text-white">
              {iniciales(nombre || me.data?.nombre || "?")}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-muted">NOMBRE</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-[15px] text-text outline-none transition focus:border-violet"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-muted">EMAIL</label>
            <input
              value={me.data?.email ?? ""}
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-border bg-card px-4 py-3.5 text-[15px] text-muted outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-muted">CARRERA</label>
            <select
              value={carreraId}
              onChange={(e) => setCarreraId(Number(e.target.value))}
              className="w-full cursor-pointer rounded-xl border border-border bg-card px-4 py-3.5 text-[15px] text-text outline-none"
            >
              {(carreras.data?.items ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className={[
            "mb-7 w-full rounded-xl px-6 py-[15px] text-[15px] font-semibold text-white transition-colors",
            saved ? "bg-green" : "bg-violet",
          ].join(" ")}
        >
          {saved ? "✓ Guardado" : "Guardar cambios"}
        </button>

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
