// PATCH /auth/password (INTEGRACION_FRONT.md §2.4ter): cambiar contraseña
// estando logueado, reautenticando con la actual. Modal propio en vez de
// `FormModal` (dueño Int.1): FormModal está armado para create/update de un
// recurso con id, esto es una única acción sin id ni invalidación de cache.
import { useState } from "react";
import { cambiarPasswordRequest } from "../../auth/api";
import { ApiError } from "../../lib/apiClient";
import { useToast } from "../../hooks/useToast";

function EyeIcon({ off }: { off?: boolean }) {
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10.6 5.08A11 11 0 0112 5c7 0 11 7 11 7a13.2 13.2 0 01-3.24 3.94M6.6 6.6A13.2 13.2 0 001 12s4 7 11 7a10.9 10.9 0 004.4-.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 9.9a3 3 0 104.2 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold text-muted">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3.5 pr-11 text-[15px] text-text outline-none focus:border-violet"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-muted"
        >
          <EyeIcon off={visible} />
        </button>
      </div>
    </div>
  );
}

export default function CambiarPasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToast();

  if (!open) return null;

  // Mismo criterio que Registro/Reset: ≥8 caracteres, letra y número.
  const passwordDebil = nueva.length > 0 && !(/[A-Za-z]/.test(nueva) && /[0-9]/.test(nueva));
  const noCoinciden = nueva.length > 0 && confirmar.length > 0 && nueva !== confirmar;

  function resetForm() {
    setActual("");
    setNueva("");
    setConfirmar("");
  }

  function handleClose() {
    if (loading) return;
    resetForm();
    onClose();
  }

  async function handleSubmit() {
    if (!actual) {
      pushToast("Ingresá tu contraseña actual.", "error");
      return;
    }
    if (nueva.length < 8) {
      pushToast("La contraseña nueva tiene que tener al menos 8 caracteres.", "error");
      return;
    }
    if (passwordDebil) {
      pushToast("La contraseña nueva tiene que tener al menos una letra y un número.", "error");
      return;
    }
    if (nueva !== confirmar) {
      pushToast("Las contraseñas no coinciden.", "error");
      return;
    }
    setLoading(true);
    try {
      await cambiarPasswordRequest({ password_actual: actual, password_nueva: nueva });
      pushToast("Contraseña actualizada correctamente.", "success");
      resetForm();
      onClose();
    } catch (err) {
      // 401 acá es "la actual no coincide" (ver suppressUnauthorizedRedirect
      // en auth/api.ts) — NO desloguea, el usuario puede reintentar.
      if (err instanceof ApiError && err.status === 401) {
        pushToast("La contraseña actual no coincide.", "error");
      } else if (err instanceof ApiError) {
        // 400 "debe ser distinta a la actual" / 422 regla de validación.
        pushToast(err.detail, "error");
      } else {
        pushToast("No se pudo cambiar la contraseña.", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4" onClick={handleClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-text">Cambiar contraseña</h3>

        <div className="mt-4 flex flex-col gap-3.5">
          <PasswordField label="CONTRASEÑA ACTUAL" value={actual} onChange={setActual} />
          <div>
            <PasswordField label="CONTRASEÑA NUEVA" value={nueva} onChange={setNueva} />
            <div className={`mt-1.5 text-xs ${passwordDebil ? "text-[#F87171]" : "text-muted"}`}>
              Mínimo 8 caracteres, con al menos una letra y un número.
            </div>
          </div>
          <div>
            <PasswordField label="REPETIR CONTRASEÑA NUEVA" value={confirmar} onChange={setConfirmar} />
            {noCoinciden ? <div className="mt-1.5 text-xs text-[#F87171]">Las contraseñas no coinciden.</div> : null}
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-border bg-transparent px-3 py-2 text-sm font-medium text-muted disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-xl bg-violet px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
