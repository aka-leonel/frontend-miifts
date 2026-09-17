import { useEffect, useMemo, useState } from "react";
import { useCarreras } from "../catalogo/hooks";
import { useMisMaterias } from "../materias/hooks";
import { useAuthMe } from "./hooks";
import { useAuth } from "../../auth/AuthContext";
import { useApiForm } from "../../hooks/useApiForm";
import { useToast } from "../../hooks/useToast";
import { ApiError } from "../../lib/apiClient";
import { changePasswordRequest } from "../../auth/api";

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
  const { actualizarPerfil } = useAuth();
  const { fieldErrors, applyApiError, clearErrors, setFieldErrors } = useApiForm();
  const { pushToast } = useToast();
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    if (!me.data) return;
    setForm({ nombre: me.data.nombre ?? "", apellido: me.data.apellido ?? "", email: me.data.email ?? "" });
    clearErrors();
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
      form.apellido.trim() !== (me.data.apellido ?? "") ||
      form.email.trim() !== (me.data.email ?? "")
    );
  }, [form, me.data]);

  function handleLogout() {
    for (const key of SESSION_KEYS) window.localStorage.removeItem(key);
    onCerrarSesion();
  }

  function validateClient(): boolean {
    const errors: Record<string, string> = {};
    if (form.nombre.trim().length < 2 || form.nombre.trim().length > 100) errors.nombre = "Nombre debe tener 2-100 caracteres";
    if (form.apellido.trim().length < 2 || form.apellido.trim().length > 100) errors.apellido = "Apellido debe tener 2-100 caracteres";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Email inválido";
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
    if (form.email.trim() !== me.data.email) patch.email = form.email.trim();
    if (Object.keys(patch).length === 0) return;
    setSaving(true);
    try {
      await actualizarPerfil(patch as never);
      pushToast("Perfil actualizado", "success");
      await me.refetch();
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 422 && Object.keys(e.errors).length > 0) {
          applyApiError(e);
          return;
        }
        if (e.status === 409) {
          pushToast(e.detail || "Email ya registrado", "error");
          return;
        }
        applyApiError(e, e.detail || "No se pudo guardar");
        return;
      }
      pushToast("No se pudo guardar", "error");
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
            <button type="button" onClick={() => me.refetch()} className="mt-4 w-full rounded-xl bg-violet px-4 py-2 text-sm font-semibold text-white">
              Reintentar
            </button>
            <button type="button" onClick={handleLogout} className="mt-3 w-full rounded-xl border border-[#FF6B6B]/40 bg-[#FF6B6B]/10 px-4 py-2 text-sm font-semibold text-[#FF6B6B]">
              Cerrar sesión
            </button>
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
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="email@ifts.edu.ar"
              inputMode="email"
              className={`w-full rounded-xl border bg-card px-4 py-3.5 text-[15px] text-text outline-none ${fieldErrors.email ? "border-red-500" : "border-border focus:border-violet"}`}
            />
            {fieldErrors.email && <span className="mt-1 block text-xs text-red-400">{fieldErrors.email}</span>}
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
          onClick={() => {
            setPwdErrors({});
            setPwdForm({ current: "", next: "", confirm: "" });
            setShowPwdModal(true);
          }}
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

      {showPwdModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4" onClick={() => setShowPwdModal(false)}>
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">Cambiar contraseña</h2>
              <button type="button" onClick={() => setShowPwdModal(false)} className="text-xl text-muted hover:text-text">
                ×
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-muted">CONTRASEÑA ACTUAL</label>
                <div className="relative">
                  <input
                    type={showPwd.current ? "text" : "password"}
                    autoComplete="current-password"
                    value={pwdForm.current}
                    onChange={(e) => setPwdForm((p) => ({ ...p, current: e.target.value }))}
                    className={`w-full rounded-xl border bg-card px-4 py-3 pr-11 text-sm text-text outline-none ${pwdErrors.current ? "border-red-500" : "border-border focus:border-violet"}`}
                  />
                  <button type="button" aria-label="ver contraseña" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text" onMouseDown={() => setShowPwd((p) => ({ ...p, current: true }))} onMouseUp={() => setShowPwd((p) => ({ ...p, current: false }))} onMouseLeave={() => setShowPwd((p) => ({ ...p, current: false }))} onTouchStart={() => setShowPwd((p) => ({ ...p, current: true }))} onTouchEnd={() => setShowPwd((p) => ({ ...p, current: false }))}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" /></svg>
                  </button>
                </div>
                {pwdErrors.current && <span className="mt-1 block text-xs text-red-400">{pwdErrors.current}</span>}
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-muted">NUEVA CONTRASEÑA</label>
                <div className="relative">
                  <input
                    type={showPwd.next ? "text" : "password"}
                    autoComplete="new-password"
                    value={pwdForm.next}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPwdForm((p) => ({ ...p, next: v }));
                      if (pwdForm.confirm && v !== pwdForm.confirm) setPwdErrors((prev) => ({ ...prev, confirm: "contraseña no coincide" }));
                      else if (pwdForm.confirm && v === pwdForm.confirm) setPwdErrors((prev) => { const n = { ...prev }; delete n.confirm; return n; });
                    }}
                    className={`w-full rounded-xl border bg-card px-4 py-3 pr-11 text-sm text-text outline-none ${pwdErrors.next ? "border-red-500" : "border-border focus:border-violet"}`}
                  />
                  <button type="button" aria-label="ver contraseña" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text" onMouseDown={() => setShowPwd((p) => ({ ...p, next: true }))} onMouseUp={() => setShowPwd((p) => ({ ...p, next: false }))} onMouseLeave={() => setShowPwd((p) => ({ ...p, next: false }))} onTouchStart={() => setShowPwd((p) => ({ ...p, next: true }))} onTouchEnd={() => setShowPwd((p) => ({ ...p, next: false }))}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" /></svg>
                  </button>
                </div>
                {pwdErrors.next && <span className="mt-1 block text-xs text-red-400">{pwdErrors.next}</span>}
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-muted">CONFIRMAR NUEVA</label>
                <div className="relative">
                  <input
                    type={showPwd.confirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={pwdForm.confirm}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPwdForm((p) => ({ ...p, confirm: v }));
                      if (v && pwdForm.next !== v) setPwdErrors((prev) => ({ ...prev, confirm: "contraseña no coincide" }));
                      else setPwdErrors((prev) => { const n = { ...prev }; delete n.confirm; return n; });
                    }}
                    className={`w-full rounded-xl border bg-card px-4 py-3 pr-11 text-sm text-text outline-none ${pwdErrors.confirm ? "border-red-500" : "border-border focus:border-violet"}`}
                  />
                  <button type="button" aria-label="ver contraseña" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text" onMouseDown={() => setShowPwd((p) => ({ ...p, confirm: true }))} onMouseUp={() => setShowPwd((p) => ({ ...p, confirm: false }))} onMouseLeave={() => setShowPwd((p) => ({ ...p, confirm: false }))} onTouchStart={() => setShowPwd((p) => ({ ...p, confirm: true }))} onTouchEnd={() => setShowPwd((p) => ({ ...p, confirm: false }))}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" /></svg>
                  </button>
                </div>
                {pwdErrors.confirm && <span className="mt-1 block text-xs text-red-400">{pwdErrors.confirm}</span>}
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowPwdModal(false)} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted">
                Cancelar
              </button>
              <button
                type="button"
                disabled={pwdSaving}
                onClick={async () => {
                  const errs: Record<string, string> = {};
                  if (!pwdForm.current) errs.current = "Requerido";
                  if (pwdForm.next.length < 8) errs.next = "Mínimo 8 caracteres";
                  else if (!/[A-Za-z]/.test(pwdForm.next) || !/[0-9]/.test(pwdForm.next)) errs.next = "Debe tener letra y número";
                  if (pwdForm.next !== pwdForm.confirm) errs.confirm = "contraseña no coincide";
                  if (Object.keys(errs).length) {
                    setPwdErrors(errs);
                    return;
                  }
                  setPwdErrors({});
                  setPwdSaving(true);
                  try {
                    await changePasswordRequest({ current_password: pwdForm.current, new_password: pwdForm.next });
                    pushToast("Contraseña actualizada", "success");
                    setShowPwdModal(false);
                    setPwdForm({ current: "", next: "", confirm: "" });
                  } catch (e) {
                    if (e instanceof ApiError) {
                      if (e.status === 422 && Object.keys(e.errors).length) {
                        const mapped: Record<string, string> = {};
                        for (const [k, v] of Object.entries(e.errors)) {
                          const key = k === "new_password" ? "next" : k === "current_password" ? "current" : k;
                          mapped[key] = Array.isArray(v) ? String(v[0]) : String(v);
                        }
                        setPwdErrors(mapped);
                        return;
                      }
                      if (e.status === 401) {
                        setPwdErrors({ current: e.detail || "Contraseña actual incorrecta" });
                        return;
                      }
                      if (e.status === 400) {
                        setPwdErrors({ next: e.detail || "La nueva debe ser distinta" });
                        return;
                      }
                      pushToast(e.detail || "No se pudo cambiar la contraseña", "error");
                      return;
                    }
                    pushToast("No se pudo cambiar la contraseña", "error");
                  } finally {
                    setPwdSaving(false);
                  }
                }}
                className="flex-1 rounded-xl bg-violet px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {pwdSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
