import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useCarreras } from "../catalogo/hooks";
import { useProgresoCarrera } from "../materias/hooks";
import AccesibilidadPanel from "./AccesibilidadPanel";
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
  const esAdmin = me.data?.rol === "admin";
  const carreras = useCarreras({ page: 1 });
  // Progreso sobre el TOTAL de materias de la carrera (mismo criterio que Inicio/Materias).
  const { aprobadas, total } = useProgresoCarrera(auth.usuario?.carrera_id ?? 0);
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

  const pct = total > 0 ? Math.round((aprobadas / total) * 100) : 0;
  const carreraNombre =
    (carreras.data?.items ?? []).find((c) => c.id === me.data?.carrera_id)?.nombre ??
    (me.data ? `Carrera #${me.data.carrera_id}` : "");

  const hasChanges = useMemo(() => {
    if (!me.data) return false;
    return form.nombre.trim() !== (me.data.nombre ?? "") || form.apellido.trim() !== (me.data.apellido ?? "");
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
          <div role="status" aria-label="Cargando perfil" className="h-8 w-32 animate-pulse rounded-lg bg-surface2" />
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
            <h1 className="text-2xl font-black tracking-[-0.04em] text-text">Mi Perfil</h1>
            <div className="mt-1 text-sm text-muted">Configurá tu cuenta</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div role="alert" className="text-sm font-semibold text-text">No se pudo cargar tu perfil</div>
            <div className="mt-1 text-xs text-muted">{String((me.error as Error)?.message ?? me.error)}</div>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => me.refetch()}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2 text-sm font-semibold text-danger"
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
          <h1 className="text-2xl font-black tracking-[-0.04em] text-text">Mi Perfil</h1>
          <div className="mt-1 text-sm text-muted">Configurá tu cuenta</div>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div aria-hidden="true" className="flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-primary text-3xl font-extrabold text-on-primary">
              {esAdmin
                ? iniciales(me.data?.nombre || "?", me.data?.apellido)
                : iniciales(form.nombre || me.data?.nombre || "?", form.apellido || me.data?.apellido)}
            </div>
          </div>
        </div>

        {esAdmin ? (
          // Cuenta de admin: nada de identidad editable acá — ni nombre,
          // ni apellido, ni carrera (un admin no está anotado a una carrera
          // puntual). Solo email de referencia + cambiar contraseña.
          <div className="mb-6 flex flex-col gap-3.5">
            <div>
              <label htmlFor="perfil-email" className="mb-1.5 block text-xs font-semibold text-muted">EMAIL</label>
              <input
                id="perfil-email"
                value={me.data?.email ?? ""}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-border bg-card px-4 py-3.5 text-[0.9375rem] text-muted opacity-70"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3.5">
              <div>
                <label htmlFor="perfil-nombre" className="mb-1.5 block text-xs font-semibold text-muted">NOMBRE</label>
                <input
                  id="perfil-nombre"
                  autoComplete="given-name"
                  aria-invalid={fieldErrors.nombre ? true : undefined}
                  aria-describedby={fieldErrors.nombre ? "perfil-nombre-error" : undefined}
                  value={form.nombre}
                  onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Nombre"
                  className={`w-full rounded-xl border bg-card px-4 py-3.5 text-[0.9375rem] text-text ${fieldErrors.nombre ? "border-danger" : "border-border focus:border-violet"}`}
                />
                {fieldErrors.nombre && <span id="perfil-nombre-error" role="alert" className="mt-1 block text-xs text-danger">{fieldErrors.nombre}</span>}
              </div>
              <div>
                <label htmlFor="perfil-apellido" className="mb-1.5 block text-xs font-semibold text-muted">APELLIDO</label>
                <input
                  id="perfil-apellido"
                  autoComplete="family-name"
                  aria-invalid={fieldErrors.apellido ? true : undefined}
                  aria-describedby={fieldErrors.apellido ? "perfil-apellido-error" : undefined}
                  value={form.apellido}
                  onChange={(e) => setForm((p) => ({ ...p, apellido: e.target.value }))}
                  placeholder="Apellido"
                  className={`w-full rounded-xl border bg-card px-4 py-3.5 text-[0.9375rem] text-text ${fieldErrors.apellido ? "border-danger" : "border-border focus:border-violet"}`}
                />
                {fieldErrors.apellido && <span id="perfil-apellido-error" role="alert" className="mt-1 block text-xs text-danger">{fieldErrors.apellido}</span>}
              </div>
              <div>
                <label htmlFor="perfil-email" className="mb-1.5 block text-xs font-semibold text-muted">EMAIL</label>
                <input
                  id="perfil-email"
                  value={me.data?.email ?? ""}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-border bg-card px-4 py-3.5 text-[0.9375rem] text-muted opacity-70"
                />
              </div>
              <div>
                <label htmlFor="perfil-carrera" className="mb-1.5 block text-xs font-semibold text-muted">CARRERA</label>
                <input
                  id="perfil-carrera"
                  value={carreras.loading ? "Cargando..." : carreraNombre}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-border bg-card px-4 py-3.5 text-[0.9375rem] text-muted opacity-70"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="mb-3 w-full rounded-xl bg-primary px-6 py-[14px] text-[0.9375rem] font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setCambiarPasswordOpen(true)}
          className="mb-7 w-full rounded-xl border border-border bg-card px-6 py-[14px] text-[0.9375rem] font-semibold text-text"
        >
          Cambiar contraseña
        </button>

        {!esAdmin ? (
          <div className="mb-6 rounded-2xl border border-border bg-card p-4">
            <h2 className="mb-1 text-sm font-semibold text-text">
              Tu progreso con <span className="text-lime">Byte</span>
            </h2>
            <div className="mb-2.5 text-xs text-muted">
              {aprobadas} de {total} materias aprobadas
            </div>
            <div role="progressbar" aria-label="Progreso de la carrera" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-2 overflow-hidden rounded-full bg-surface2">
              <div className="h-full rounded-full bg-gradient-to-r from-violet to-lime" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 text-xs text-muted">{pct}% del plan completado</div>
          </div>
        ) : null}

        <AccesibilidadPanel />

        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl border border-danger/40 bg-danger/10 px-6 py-[15px] text-[0.9375rem] font-semibold text-danger"
        >
          Cerrar sesión
        </button>
      </div>

      <CambiarPasswordModal open={cambiarPasswordOpen} onClose={() => setCambiarPasswordOpen(false)} />
    </div>
  );
}
