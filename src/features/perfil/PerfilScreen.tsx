import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useCarreras } from "../catalogo/hooks";
import { useMisMaterias } from "../materias/hooks";
import CambiarPasswordModal from "./CambiarPasswordModal";
import { useAuthMe } from "./hooks";
import { useApiForm } from "../../hooks/useApiForm";
import { useToast } from "../../hooks/useToast";
import { ApiError } from "../../lib/apiClient";

function iniciales(nombre: string, apellido?: string): string {
  const inicialNombre = nombre.trim()[0];
  const inicialApellido = apellido?.trim()[0];
  if (!inicialNombre) return "?";
  return (inicialNombre + (inicialApellido ?? "")).toUpperCase();
}

export default function PerfilScreen({ onCerrarSesion }: { onCerrarSesion: () => void }) {
  const auth = useAuth();
  const me = useAuthMe();
  const carreras = useCarreras({ page: 1 });
  const misMaterias = useMisMaterias(1);
  const { fieldErrors, applyApiError, clearErrors, setFieldErrors } = useApiForm();
  const { pushToast } = useToast();
  // Solo nombre/apellido: `PerfilUpdate` (backend auth/schema.py) dice
  // textual "el email identifica la cuenta... cualquier otro campo del body
  // se ignora" — mandar email acá no lo cambia, solo finge éxito.
  const [form, setForm] = useState({ nombre: "", apellido: "" });
  const [saving, setSaving] = useState(false);
  const [cambiarPasswordOpen, setCambiarPasswordOpen] = useState(false);

  useEffect(() => {
    if (!me.data) return;
    setForm({ nombre: me.data.nombre ?? "", apellido: me.data.apellido ?? "" });
    clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.data]);

  const aprobadas = (misMaterias.data?.items ?? []).filter((c) => c.estado === "aprobada").length;
  const total = misMaterias.data?.total ?? 0;
  const pct = total > 0 ? Math.round((aprobadas / total) * 100) : 0;
  const carreraNombre =
    (carreras.data?.items ?? []).find((c) => c.id === me.data?.carrera_id)?.nombre ??
    (me.data ? `Carrera #${me.data.carrera_id}` : "");

  const hasChanges = useMemo(() => {
    if (!me.data) return false;
    return (
      form.nombre.trim() !== (me.data.nombre ?? "") ||
      form.apellido.trim() !== (me.data.apellido ?? "")
    );
  }, [form, me.data]);

  function handleLogout() {
    // AuthContext es la única fuente de verdad de la sesión (ver
    // src/auth/AuthContext.tsx) — antes esto borraba localStorage a mano acá
    // y dejaba el estado en memoria de useAuth() (usuario/token, timers de
    // expiración) sin limpiar.
    auth.logout();
    onCerrarSesion();
  }

  function validateClient(): boolean {
    const errors: Record<string, string> = {};
    if (form.nombre.trim().length < 2 || form.nombre.trim().length > 100) errors.nombre = "Nombre debe tener 2-100 caracteres";
    if (form.apellido.trim().length < 2 || form.apellido.trim().length > 100) errors.apellido = "Apellido debe tener 2-100 caracteres";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }
    return true;
  }

  async function handleSave() {
    if (!me.data) return;
    if (!hasChanges) return;
    if (!validateClient()) return;
    clearErrors();
    const patch: Record<string, string> = {};
    if (form.nombre.trim() !== me.data.nombre) patch.nombre = form.nombre.trim();
    if (form.apellido.trim() !== (me.data.apellido ?? "")) patch.apellido = form.apellido.trim();
    if (Object.keys(patch).length === 0) return;
    setSaving(true);
    try {
      await auth.actualizarPerfil(patch as never);
      pushToast("Perfil actualizado", "success");
      await me.refetch();
    } catch (e) {
      applyApiError(e, e instanceof ApiError ? e.detail : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
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
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => me.refetch()}
                className="rounded-xl bg-violet px-4 py-2 text-sm font-semibold text-white"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-[#FF6B6B]/40 bg-[#FF6B6B]/10 px-4 py-2 text-sm font-semibold text-[#FF6B6B]"
              >
                Cerrar sesión
              </button>
            </div>
            <div className="mt-3 text-xs text-muted">Si el error persiste, cerrá sesión y volvé a ingresar.</div>
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
              {iniciales(form.nombre || me.data?.nombre || "?", form.apellido || me.data?.apellido)}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3.5">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-muted">NOMBRE</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre"
              className={`w-full rounded-xl border bg-card px-4 py-3.5 text-[15px] text-text outline-none ${fieldErrors.nombre ? "border-red-500" : "border-border focus:border-violet"}`}
            />
            {fieldErrors.nombre && <span className="mt-1 block text-xs text-red-400">{fieldErrors.nombre}</span>}
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-muted">APELLIDO</label>
            <input
              value={form.apellido}
              onChange={(e) => setForm((p) => ({ ...p, apellido: e.target.value }))}
              placeholder="Apellido"
              className={`w-full rounded-xl border bg-card px-4 py-3.5 text-[15px] text-text outline-none ${fieldErrors.apellido ? "border-red-500" : "border-border focus:border-violet"}`}
            />
            {fieldErrors.apellido && <span className="mt-1 block text-xs text-red-400">{fieldErrors.apellido}</span>}
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-muted">EMAIL</label>
            <input
              value={me.data?.email ?? ""}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-border bg-card px-4 py-3.5 text-[15px] text-muted opacity-60 outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-muted">CARRERA</label>
            <input
              value={carreras.loading ? "Cargando..." : carreraNombre}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-border bg-card px-4 py-3.5 text-[15px] text-muted opacity-60 outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="mb-3 w-full rounded-xl bg-violet px-6 py-[14px] text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>

        <button
          type="button"
          onClick={() => setCambiarPasswordOpen(true)}
          className="mb-7 w-full rounded-xl border border-border bg-card px-6 py-[14px] text-[15px] font-semibold text-text"
        >
          Cambiar contraseña
        </button>

        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="mb-1 text-sm font-semibold text-text">
            Tu progreso con <span className="text-lime">Byte</span>
          </div>
          <div className="mb-2.5 text-xs text-muted">
            {aprobadas} de {total} materias aprobadas
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#2A2B36]">
            <div className="h-full rounded-full bg-gradient-to-r from-violet to-lime" style={{ width: `${pct}%` }} />
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

      <CambiarPasswordModal open={cambiarPasswordOpen} onClose={() => setCambiarPasswordOpen(false)} />
    </div>
  );
}
