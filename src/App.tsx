import { useId, useState, useEffect } from "react";
import { Toaster } from "./components";
import { BadgeNotificaciones } from "./components/BadgeNotificaciones";
import { usePush } from "./hooks/usePush";
import { ConveniosScreen as ConveniosFeatureScreen } from "./features/convenios";
import { getCarreras } from "./features/catalogo/service";
import InicioReal from "./features/materias/InicioScreen";
import MisMateriasReal from "./features/materias/MisMateriasScreen";
import { MateriaDetalleScreen as MateriaDetalleFeatureScreen } from "./features/materia-detalle/MateriaDetalleScreen";
import { RecordatoriosScreen as RecordatoriosFeatureScreen } from "./features/recordatorios";
import PerfilFeatureScreen from "./features/perfil/PerfilScreen";
import { useLogin } from "./features/auth/hooks";
import { getUsuarioGuardado } from "./auth/storage";
import AdminScreen from "./features/admin/AdminScreen";
import { haySesion } from "./features/auth/service";
import { forgotPasswordRequest, resetPasswordRequest } from "./auth/api";
import { ApiError } from "./lib/apiClient";
import { useToast } from "./hooks/useToast";
import { useAuth } from "./auth/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | "login"
  | "registro"
  | "olvide-password"
  | "reset-password"
  | "carrera"
  | "inicio"
  | "materias"
  | "detalle"
  | "recordatorios"
  | "convenios"
  | "perfil"
  | "admin";

type NavTab = "inicio" | "materias" | "recordatorios" | "convenios" | "perfil" | "admin";

// ─── Design tokens ─────────────────────────────────────────────────────────────
// Colores como variables CSS del tema (src/index.css): cambian solas con el tema
// elegido en Perfil → Accesibilidad. No poner hex acá.
const CARD = "var(--c-card)";
const BORDER = "var(--c-border)";
const VIOLET = "var(--c-violet)"; // acento para texto/bordes
const PRIMARY = "var(--c-primary)"; // fondo de botones principales
const ON_PRIMARY = "var(--c-on-primary)";
const TEXT = "var(--c-text)";
const MUTED = "var(--c-muted)";
const DANGER = "var(--c-danger)";

// ─── Bottom Navbar ────────────────────────────────────────────────────────────
// Función de `recordatoriosCount`: el ícono de "Recordat." lleva el badge de
// notificaciones pendientes (ver src/hooks/usePush.ts) encima.
const navItems = (recordatoriosCount: number): { key: NavTab; label: string; icon: React.ReactNode }[] => [
  {
    key: "inicio", label: "Inicio",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
  },
  {
    key: "materias", label: "Materias",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M9 7h7M9 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    key: "recordatorios", label: "Recordat.",
    icon: (
      <BadgeNotificaciones count={recordatoriosCount}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </BadgeNotificaciones>
    ),
  },
  {
    key: "convenios", label: "Convenios",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    key: "perfil", label: "Perfil",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
];

// Panel Admin (ver decisions D015): item de nav aparte, se agrega al array de
// navegación solo cuando `usuario.rol==="admin"` (ver `visibleNavItems` en
// App()) — reemplaza al botón "Admin catálogo" que vivía dentro de
// MisMateriasScreen.
const adminNavItem: { key: NavTab; label: string; icon: React.ReactNode } = {
  key: "admin",
  label: "Admin",
  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2l7 3.5v6c0 5-3.4 8.7-7 10.5-3.6-1.8-7-5.5-7-10.5v-6L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M9.5 12l2 2 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

type NavItem = { key: NavTab; label: string; icon: React.ReactNode };

// `items` ya viene resuelto desde App() (con el badge de recordatorios
// metido adentro por `navItems(recordatoriosCount)`, o reemplazado entero
// por el nav de admin) — acá solo se renderiza.
function BottomNav({ items, active, onNav }: { items: NavItem[]; active: NavTab; onNav: (t: NavTab) => void }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMobile) return null;

  return (
    <nav
      aria-label="Navegación principal"
      className="w-full"
      style={{ 
        position: "fixed", 
        bottom: 0, 
        left: 0, 
        background: CARD, 
        borderTop: `0.5px solid ${BORDER}`, 
        display: "flex", 
        justifyContent: "space-around", 
        padding: "10px 0 20px", 
        zIndex: 100 
      }}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <button key={item.key} type="button" onClick={() => onNav(item.key)} aria-current={isActive ? "page" : undefined} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", color: isActive ? VIOLET : MUTED, cursor: "pointer", padding: "4px 8px", minWidth: 44, minHeight: 44, transition: "color 0.2s" }}>
            <span aria-hidden="true" style={{ display: "flex" }}>{item.icon}</span>
            <span style={{ fontSize: "0.75rem", fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Sidebar Nav (desktop, md+) ────────────────────────────────────────────────
// S4-06: reemplaza al BottomNav desde `md:` para que el shell deje de forzar
// el frame fijo de 430px también en pantallas grandes.
function SidebarNav({ items, active, onNav }: { items: NavItem[]; active: NavTab; onNav: (t: NavTab) => void }) {
  return (
    <aside
      className="hidden md:flex md:w-64 md:flex-shrink-0 md:flex-col md:border-r md:py-8"
      style={{ borderColor: BORDER, background: CARD }}
    >
      <div className="mb-8 px-6 text-xl font-black" aria-hidden="true" style={{ color: TEXT, letterSpacing: -0.4 }}>
        mi<span style={{ color: VIOLET }}>IFTS</span>
      </div>
      <nav aria-label="Navegación principal" className="flex flex-col gap-1 px-3">
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNav(item.key)}
              aria-current={isActive ? "page" : undefined}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
              style={{
                background: isActive ? "color-mix(in srgb, var(--c-violet) 14%, transparent)" : "transparent",
                color: isActive ? VIOLET : MUTED,
              }}
            >
              <span aria-hidden="true" className="flex">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
// Los campos type="password" muestran un ícono de ojo para alternar entre
// texto oculto/visible mientras se escribe.
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

function Input({ placeholder, type = "text", value, onChange, autoComplete, label, invalid, describedBy }: { placeholder: string; type?: string; value: string; onChange: (v: string) => void; autoComplete?: string; label?: string; invalid?: boolean; describedBy?: string }) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const isPassword = type === "password";
  const resolvedType = isPassword && visible ? "text" : type;
  return (
    <div style={{ position: "relative" }}>
      <label htmlFor={id} className="sr-only">{label ?? placeholder}</label>
      <input id={id} type={resolvedType} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete} aria-invalid={invalid || undefined} aria-describedby={describedBy}
        style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: isPassword ? "14px 48px 14px 16px" : "14px 16px", color: TEXT, fontSize: "1rem" }}
        onFocus={(e) => (e.target.style.borderColor = VIOLET)}
        onBlur={(e) => (e.target.style.borderColor = BORDER)}
      />
      {isPassword ? (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", width: 40, height: 40, cursor: "pointer", color: MUTED, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <span aria-hidden="true" style={{ display: "flex" }}><EyeIcon off={visible} /></span>
        </button>
      ) : null}
    </div>
  );
}

function PrimaryButton({ children, onClick, fullWidth = true, disabled = false }: { children: React.ReactNode; onClick: () => void; fullWidth?: boolean; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{ width: fullWidth ? "100%" : "auto", background: PRIMARY, border: "none", borderRadius: 10, padding: "15px 24px", color: ON_PRIMARY, fontSize: "1rem", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1 }}>
      {children}
    </button>
  );
}

function ScreenWrap({ children, padBottom = false }: { children: React.ReactNode; padBottom?: boolean }) {
  return <div style={{ flex: 1, overflowY: "auto", paddingBottom: padBottom ? 90 : 24 }}>{children}</div>;
}

// ─── Screen 1: Login ──────────────────────────────────────────────────────────
function LoginScreen({ onGo }: { onGo: (s: Screen) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const { pushToast } = useToast();
  const login = useLogin();

  const handleIngresar = async () => {
    try {
      await login.run({ email, password: pass });
      // `login.run()` puede devolver `usuario` desactualizado (closure vieja
      // de `useAuth()` dentro de `useLogin`, ver features/auth/hooks.ts) —
      // `getUsuarioGuardado()` lee el localStorage recién escrito por
      // `auth.login()`, así que siempre refleja la sesión que acaba de entrar.
      const usuarioLogueado = getUsuarioGuardado();
      onGo(usuarioLogueado?.rol === "admin" ? "admin" : "inicio");
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "No se pudo iniciar sesión.";
      pushToast(msg, "error");
    }
  };

  return (
    <ScreenWrap>
      <div style={{ padding: "60px 28px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: `${PRIMARY}`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg aria-hidden="true" width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M8 28V14l10-8 10 8v14H22v-8h-8v8H8z" fill="var(--c-on-primary)" /></svg>
          </div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: TEXT, letterSpacing: -0.5 }}>mi<span style={{ color: VIOLET }}>IFTS</span></h1>
          <div style={{ color: MUTED, fontSize: "0.8125rem", marginTop: 4 }}>Tu organizador académico</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input autoComplete="email" placeholder="Email institucional" type="email" value={email} onChange={setEmail} />
          <Input autoComplete="current-password" placeholder="Contraseña" type="password" value={pass} onChange={setPass} />
        </div>
        <div style={{ marginTop: 24 }}>
          <PrimaryButton onClick={handleIngresar}>{login.loading ? "Ingresando…" : "Ingresar"}</PrimaryButton>
        </div>
        <p style={{ textAlign: "center", marginTop: 16 }}>
          <button type="button" onClick={() => onGo("olvide-password")} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "0.875rem", padding: "6px 8px", minHeight: 32 }}>¿Olvidaste tu contraseña?</button>
        </p>
        <p style={{ textAlign: "center", marginTop: 8, color: MUTED, fontSize: "0.875rem" }}>
          ¿No tenés cuenta?{" "}
          <button type="button" onClick={() => onGo("registro")} style={{ background: "none", border: "none", color: VIOLET, fontWeight: 600, cursor: "pointer", fontSize: "0.875rem", padding: "6px 4px", minHeight: 32, textDecoration: "underline" }}>Registrate</button>
        </p>
      </div>
    </ScreenWrap>
  );
}

// ─── Screen 2: Registro ───────────────────────────────────────────────────────
function RegistroScreen({ onGo }: { onGo: (s: Screen) => void }) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const { pushToast } = useToast();

  // El backend (UsuarioCreate) exige mínimo 8 caracteres Y al menos una
  // letra y un número — replicamos la misma regla acá para no dejar pasar
  // a la pantalla de carrera una contraseña que el server va a rechazar
  // igual (antes eso volvía como un 422 genérico recién al tocar
  // "Empezar" en CarreraScreen, sin decir que el problema era la
  // contraseña — el usuario terminaba clickeando "Empezar" en loop).
  const passwordDebil = pass.length > 0 && !(/[A-Za-z]/.test(pass) && /[0-9]/.test(pass));
  const passwordsNoCoinciden = pass.length > 0 && pass2.length > 0 && pass !== pass2;
  // OJO: acá solo se chequea que los campos tengan ALGO cargado, a propósito.
  // Si además se exige acá `!passwordDebil` / `pass === pass2`, el botón
  // queda disabled y el click nunca llega a handleContinuar — los toasts de
  // ahí abajo ("tiene que tener una letra y un número", "no coinciden")
  // quedan como código muerto y el único aviso es el textito gris bajo el
  // campo, fácil de no ver. Dejamos que sea el click el que valide y avise.
  const puedeContinuar =
    nombre.trim().length > 0 &&
    apellido.trim().length > 0 &&
    email.trim().length > 0 &&
    pass.length > 0 &&
    pass2.length > 0;

  const handleContinuar = () => {
    if (pass.length < 8) {
      pushToast("La contraseña tiene que tener al menos 8 caracteres.", "error");
      return;
    }
    if (passwordDebil) {
      pushToast("La contraseña tiene que tener al menos una letra y un número.", "error");
      return;
    }
    if (pass !== pass2) {
      pushToast("Las contraseñas no coinciden.", "error");
      return;
    }
    // Guardar temporalmente los datos del formulario para que la
    // pantalla de carrera pueda completar el flujo y llamar al
    // endpoint real de registro (ver S4-03).
    sessionStorage.setItem("registro_temp", JSON.stringify({ nombre, apellido, email, password: pass }));
    onGo("carrera");
  };

  return (
    <ScreenWrap>
      <div style={{ padding: "56px 28px 0" }}>
        <button type="button" onClick={() => onGo("login")} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", marginBottom: 16, padding: "6px 0", minHeight: 32, display: "flex", alignItems: "center", gap: 6 }}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Volver
        </button>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: TEXT, letterSpacing: -0.4, marginBottom: 4 }}>Crear cuenta</h1>
          <div style={{ color: MUTED, fontSize: "0.875rem" }}>Completá tus datos para empezar</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input autoComplete="given-name" placeholder="Nombre" value={nombre} onChange={setNombre} />
          <Input autoComplete="family-name" placeholder="Apellido" value={apellido} onChange={setApellido} />
          <Input autoComplete="email" placeholder="Email institucional" type="email" value={email} onChange={setEmail} />
          <div>
            <Input autoComplete="new-password" placeholder="Contraseña" type="password" value={pass} onChange={setPass} />
            <div style={{ color: passwordDebil ? DANGER : MUTED, fontSize: "0.75rem", marginTop: 6 }}>
              Mínimo 8 caracteres, con al menos una letra y un número.
            </div>
          </div>
          <div>
            <Input autoComplete="new-password" placeholder="Repetí tu contraseña" type="password" value={pass2} onChange={setPass2} />
            {passwordsNoCoinciden ? (
              <div role="alert" style={{ color: DANGER, fontSize: "0.75rem", marginTop: 6 }}>Las contraseñas no coinciden.</div>
            ) : null}
          </div>
        </div>
        <div style={{ marginTop: 28 }}>
          <PrimaryButton onClick={handleContinuar} disabled={!puedeContinuar}>
            Continuar
          </PrimaryButton>
        </div>
        <p style={{ color: MUTED, fontSize: "0.75rem", textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
          Al registrarte aceptás los <span style={{ color: TEXT, fontWeight: 600 }}>términos y condiciones</span>
        </p>
      </div>
    </ScreenWrap>
  );
}

// ─── Screen 2bis: Olvidé mi contraseña ────────────────────────────────────────
// S5-13 (INTEGRACION §2.4bis): el backend responde SIEMPRE 200 con el mismo
// mensaje genérico, exista o no el email — no hay nada que distinguir acá,
// mostramos el estado de éxito directo tras el 200.
function OlvidePasswordScreen({ onGo }: { onGo: (s: Screen) => void }) {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToast();

  const handleEnviar = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await forgotPasswordRequest({ email: email.trim() });
      setEnviado(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "No se pudo procesar la solicitud.";
      pushToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrap>
      <div style={{ padding: "56px 28px 0" }}>
        <button type="button" onClick={() => onGo("login")} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", marginBottom: 16, padding: "6px 0", minHeight: 32, display: "flex", alignItems: "center", gap: 6 }}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Volver
        </button>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: TEXT, letterSpacing: -0.4, marginBottom: 4 }}>¿Olvidaste tu contraseña?</h1>
          <div style={{ color: MUTED, fontSize: "0.875rem" }}>Ingresá tu email y te mandamos instrucciones para restablecerla.</div>
        </div>
        {enviado ? (
          <div style={{ background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 12, padding: 20, color: TEXT, fontSize: "0.875rem", lineHeight: 1.5 }}>
            Si el email está registrado, vas a recibir un correo con instrucciones para restablecer tu contraseña. Revisá tu bandeja de entrada (y spam).
          </div>
        ) : (
          <>
            <Input autoComplete="email" placeholder="Email institucional" type="email" value={email} onChange={setEmail} />
            <div style={{ marginTop: 24 }}>
              <PrimaryButton onClick={handleEnviar} disabled={loading || !email.trim()}>
                {loading ? "Enviando…" : "Enviar instrucciones"}
              </PrimaryButton>
            </div>
          </>
        )}
      </div>
    </ScreenWrap>
  );
}

// ─── Screen 2ter: Nueva contraseña ─────────────────────────────────────────────
// S5-14/15 (INTEGRACION §2.4bis): token viaja por query param (`?token=...`) en
// el link del mail; sin router en esta app (App.tsx App(), D014 en
// docs/context/decisions.md), el token se lee una vez en App() y se pasa por prop.
function ResetPasswordScreen({ token, onGo }: { token: string; onGo: (s: Screen) => void }) {
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [loading, setLoading] = useState(false);
  const { pushToast } = useToast();

  // Mismo criterio que RegistroScreen: ≥8 caracteres, letra y número.
  const passwordDebil = pass.length > 0 && !(/[A-Za-z]/.test(pass) && /[0-9]/.test(pass));
  const passwordsNoCoinciden = pass.length > 0 && pass2.length > 0 && pass !== pass2;
  const puedeContinuar = pass.length > 0 && pass2.length > 0 && !loading;

  const handleRestablecer = async () => {
    if (pass.length < 8) {
      pushToast("La contraseña tiene que tener al menos 8 caracteres.", "error");
      return;
    }
    if (passwordDebil) {
      pushToast("La contraseña tiene que tener al menos una letra y un número.", "error");
      return;
    }
    if (pass !== pass2) {
      pushToast("Las contraseñas no coinciden.", "error");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordRequest({ token, password: pass });
      pushToast("Contraseña actualizada. Ya podés iniciar sesión.", "success");
      onGo("login");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        // Token vencido/inexistente/ya usado: volver a "olvidé mi contraseña"
        // en vez de mostrar un error genérico acá (S5-15).
        pushToast(err.detail, "error");
        onGo("olvide-password");
        return;
      }
      const msg = err instanceof ApiError ? err.detail : "No se pudo restablecer la contraseña.";
      pushToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrap>
      <div style={{ padding: "56px 28px 0" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: TEXT, letterSpacing: -0.4, marginBottom: 4 }}>Elegí tu nueva contraseña</h1>
          <div style={{ color: MUTED, fontSize: "0.875rem" }}>Completá y confirmá tu nueva contraseña.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <Input autoComplete="new-password" placeholder="Contraseña nueva" type="password" value={pass} onChange={setPass} />
            <div style={{ color: passwordDebil ? DANGER : MUTED, fontSize: "0.75rem", marginTop: 6 }}>
              Mínimo 8 caracteres, con al menos una letra y un número.
            </div>
          </div>
          <div>
            <Input autoComplete="new-password" placeholder="Repetí tu contraseña" type="password" value={pass2} onChange={setPass2} />
            {passwordsNoCoinciden ? (
              <div role="alert" style={{ color: DANGER, fontSize: "0.75rem", marginTop: 6 }}>Las contraseñas no coinciden.</div>
            ) : null}
          </div>
        </div>
        <div style={{ marginTop: 28 }}>
          <PrimaryButton onClick={handleRestablecer} disabled={!puedeContinuar}>
            {loading ? "Restableciendo…" : "Restablecer contraseña"}
          </PrimaryButton>
        </div>
      </div>
    </ScreenWrap>
  );
}

// ─── Screen 3: Elegí tu carrera ───────────────────────────────────────────────
function CarreraScreen({ onGo }: { onGo: (s: Screen) => void }) {
  const [carrerasList, setCarrerasList] = useState<{ id: number; nombre: string }[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingCarreras, setLoadingCarreras] = useState(true);
  const { pushToast } = useToast();
  const auth = useAuth();

  useEffect(() => {
    let active = true;
    setLoadingCarreras(true);
    getCarreras()
      .then((res) => {
        if (!active) return;
        const items = Array.isArray(res?.items) ? res.items : [];
        const mapped = items.map((c) => ({ id: c.id, nombre: c.nombre }));
        setCarrerasList(mapped);
        setSelectedId(mapped[0]?.id ?? null);
      })
      .catch(() => {
        if (active) {
          pushToast("No se pudieron cargar las carreras", "error");
        }
      })
      .finally(() => {
        if (active) setLoadingCarreras(false);
      });

    return () => {
      active = false;
    };
    // Solo al montar. `pushToast` NO es estable entre renders (useToast crea
    // una función nueva en cada llamada, ver hooks/useToast.ts) — incluirla acá
    // como antes hacía que el efecto se re-disparara en cada render y quedara
    // reintentando en loop. El `active` de arriba ya cubre el doble mount de
    // StrictMode en dev (antes había también un `loadedRef` para "evitar" ese
    // doble mount, pero bloqueaba TAMBIÉN al montaje real: la única corrida que
    // llegaba a pegarle a la API terminaba con `active = false` en su cleanup
    // antes de que el fetch resolviera, así que `loadingCarreras` nunca bajaba
    // y la pantalla quedaba en "Cargando carreras..." para siempre).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmpezar = async () => {
    const raw = sessionStorage.getItem("registro_temp");
    if (!raw) {
      pushToast("Faltan datos de registro. Volvé atrás e intentá de nuevo.", "error");
      return;
    }
    if (!selectedId) {
      pushToast("Seleccioná una carrera", "error");
      return;
    }
    if (auth.cargando) return; // evita disparar varios registros si clickean repetido
    try {
      const temp = JSON.parse(raw);
      await auth.registro({
        nombre: temp.nombre,
        apellido: temp.apellido,
        email: temp.email,
        password: temp.password,
        carrera_id: selectedId,
      });
      sessionStorage.removeItem("registro_temp");
      onGo("inicio");
    } catch (err) {
      // Mostrar el detail real (ej. "La contraseña debe incluir al menos una
      // letra y un número") en vez de un genérico: antes esto quedaba mudo y
      // el único síntoma era que "Empezar" no llevaba a ningún lado.
      const msg = err instanceof ApiError ? err.detail : "No se pudo completar el registro.";
      pushToast(msg, "error");
    }
  };

  return (
    <ScreenWrap>
      <div style={{ padding: "56px 24px 0" }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: TEXT, letterSpacing: -0.3 }}>¿Qué estudiás?</h1>
          <div style={{ color: MUTED, fontSize: "0.875rem", marginTop: 6 }}>Seleccioná tu carrera en el IFTS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {loadingCarreras ? (
            <div role="status" style={{ color: MUTED, textAlign: "center", padding: "12px 0" }}>Cargando carreras…</div>
          ) : carrerasList.length === 0 ? (
            <div style={{ color: MUTED, textAlign: "center", padding: "12px 0" }}>No hay carreras disponibles.</div>
          ) : (
            carrerasList.map((c) => (
              <button key={c.id} type="button" aria-pressed={selectedId === c.id} onClick={() => setSelectedId(c.id)} style={{ background: selectedId === c.id ? "color-mix(in srgb, var(--c-violet) 14%, transparent)" : CARD, border: `0.5px solid ${selectedId === c.id ? VIOLET : BORDER}`, borderRadius: 14, padding: "16px 18px", textAlign: "left", cursor: "pointer", transition: "all 0.2s" }}>
                <div style={{ color: TEXT, fontWeight: 600, fontSize: "0.875rem", marginBottom: 4 }}>{c.nombre}</div>
                <div style={{ color: MUTED, fontSize: "0.75rem" }}>Seleccione esta carrera</div>
              </button>
            ))
          )}
        </div>
        <PrimaryButton onClick={handleEmpezar} disabled={loadingCarreras || auth.cargando}>
          {auth.cargando ? "Creando cuenta…" : loadingCarreras ? "Cargando…" : "Empezar"}
        </PrimaryButton>
      </div>
    </ScreenWrap>
  );
}

// ─── ByteCard ─────────────────────────────────────────────────────────────────
// ─── Screens 4–5: Inicio / Materias ────────────────────────────────────────────
// Reemplazadas por las pantallas reales (Integrante 2, ver imports arriba):
// InicioReal, MisMateriasReal.

// ─── Screen 6: Detalle de materia ─────────────────────────────────────────────
// Reemplazada por MateriaDetalleFeatureScreen (ver imports arriba). La mock
// original quedaba referenciando componentes (Badge, RecursoIcon, ModalMateria,
// ModalRecurso, ModalRecordatorio) borrados en el merge y nunca se llamaba —
// se eliminó por completo en vez de dejar código muerto que no compila.

// ─── Screen 7: Recordatorios ──────────────────────────────────────────────────
// Reemplazada por RecordatoriosFeatureScreen (Integrante 4, ver imports arriba).

// ─── Screen 8: Convenios ──────────────────────────────────────────────────────
// Reemplazada por ConveniosFeatureScreen (Integrante 1, ver imports arriba).

// ─── Screen 9: Mi Perfil ──────────────────────────────────────────────────────
// Reemplazada por PerfilFeatureScreen (Integrante 4, ver imports arriba).

// Primer elemento enfocable de la página: permite saltear la navegación con el teclado.
function SkipLink() {
  return (
    <a
      href="#contenido"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById("contenido")?.focus();
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[400] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-primary"
    >
      Saltar al contenido
    </a>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
const navToScreen: Record<NavTab, Screen> = {
  inicio: "inicio",
  materias: "materias",
  recordatorios: "recordatorios",
  convenios: "convenios",
  perfil: "perfil",
  admin: "admin",
};

const screenToNav: Partial<Record<Screen, NavTab>> = {
  inicio: "inicio",
  materias: "materias",
  detalle: "materias",
  recordatorios: "recordatorios",
  convenios: "convenios",
  perfil: "perfil",
  admin: "admin",
};

// Pantallas que no requieren sesión (no deben forzar redirect a login).
const PUBLIC_SCREENS: Screen[] = ["login", "registro", "olvide-password", "reset-password", "carrera"];

export default function App() {
  const auth = useAuth();
  // Registra el Service Worker y, si ya hay sesión, trae el contador de
  // recordatorios próximos para el badge del nav — ver src/hooks/usePush.ts.
  const push = usePush();
  // S5-14 (INTEGRACION §2.4bis, D014): el link del mail llega como
  // `?token=...`. Sin react-router, se lee una única vez al montar — si hay
  // token, arranca directo en "reset-password" (tiene prioridad sobre la
  // sesión guardada: un link de reset no debería mandar al usuario a "inicio").
  const [resetToken] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get("token")
  );
  // Admin aterriza directo en el panel, nunca en el dashboard de estudiante
  // (ver decisions D019) — `auth.usuario` ya está disponible acá de forma
  // síncrona (AuthProvider lo inicializa leyendo localStorage), así que esto
  // también decide bien la pantalla inicial al recargar la página logueado.
  const [screen, setScreen] = useState<Screen>(() => {
    if (resetToken) return "reset-password";
    if (!haySesion()) return "login";
    return auth.usuario?.rol === "admin" ? "admin" : "inicio";
  });
  // No hay react-router en esta app todavía (el resto navega con este mismo
  // switch, no con URLs) — mientras tanto, la materia que se está viendo en
  // "detalle" se guarda acá y se pasa por prop.
  const [materiaIdSeleccionada, setMateriaIdSeleccionada] = useState<number | null>(null);

  // Bug reportado: si el token guardado queda inválido (vencido, o 401 de
  // cualquier request) AuthContext limpia `usuario`/`token` (ver
  // `setUnauthorizedHandler` en AuthContext.tsx), pero nada movía `screen` de
  // vuelta a "login" — el usuario quedaba atrapado en una pantalla protegida
  // (ej. Perfil mostrando "No se pudo cargar tu perfil / Not authenticated"
  // sin ningún botón para salir de ahí). Este efecto es el único lugar que
  // reacciona a esa transición, sea por logout explícito, 401, o expiración.
  useEffect(() => {
    if (auth.verificandoSesion) return;
    if (!auth.usuario && !PUBLIC_SCREENS.includes(screen)) {
      setScreen("login");
    }
  }, [auth.usuario, auth.verificandoSesion, screen]);

  const handleNav = (tab: NavTab) => setScreen(navToScreen[tab]);
  const showNav = !PUBLIC_SCREENS.includes(screen);
  const activeTab = screenToNav[screen];
  // Panel Admin (D015-REV1): el admin NO ve el menú de estudiante (Materias
  // con notas/promedio, Recordatorios, Convenios de consulta no le sirven de
  // nada) — se reemplaza el nav entero por uno propio. Se deja "Perfil"
  // porque es el único lugar con "Cerrar sesión". Es solo UX — el backend
  // hace cumplir 401/403 igual si alguien fuerza el estado.
  // navItems(...) ya trae el badge de notificaciones metido en el ícono de
  // "Recordat." (ver src/hooks/usePush.ts) — se resuelve acá, antes de decidir
  // si el admin ve este set completo o el propio.
  const navItemsConBadge = navItems(push.contadorPendientes);
  const perfilNavItem = navItemsConBadge.find((item) => item.key === "perfil")!;
  const visibleNavItems = auth.usuario?.rol === "admin" ? [adminNavItem, perfilNavItem] : navItemsConBadge;

  function abrirDetalle(materiaId: number) {
    setMateriaIdSeleccionada(materiaId);
    setScreen("detalle");
  }

  const renderScreen = () => {
    switch (screen) {
      case "login": return <LoginScreen onGo={setScreen} />;
      case "registro": return <RegistroScreen onGo={setScreen} />;
      case "olvide-password": return <OlvidePasswordScreen onGo={setScreen} />;
      case "reset-password": return <ResetPasswordScreen token={resetToken ?? ""} onGo={setScreen} />;
      case "carrera": return <CarreraScreen onGo={setScreen} />;
      case "inicio": return <InicioReal onOpenMateria={abrirDetalle} />;
      case "materias":
        return <MisMateriasReal onOpenMateria={abrirDetalle} />;
      case "detalle":
        if (materiaIdSeleccionada == null) {
          return <MisMateriasReal onOpenMateria={abrirDetalle} />;
        }
        return (
          <MateriaDetalleFeatureScreen materiaId={materiaIdSeleccionada} onVolver={() => setScreen("materias")} />
        );
      case "recordatorios": return <RecordatoriosFeatureScreen />;
      case "convenios": return <ConveniosFeatureScreen />;
      case "perfil": return <PerfilFeatureScreen onCerrarSesion={() => setScreen("login")} />;
      case "admin":
        // D019: guard de rol acá además del nav gateado — nadie que no sea
        // admin llega a esta pantalla aunque fuerce el estado.
        return auth.usuario?.rol === "admin" ? <AdminScreen /> : <MisMateriasReal onOpenMateria={abrirDetalle} />;
    }
  };

  // S4-06: el shell ya no fuerza un frame de 430px en toda resolución — solo
  // el flujo de auth (sin nav, pensado como una tarjeta angosta) mantiene ese
  // ancho; el resto de la app crece hasta un contenido fluido con sidebar
  // desde `md:` en vez de BottomNav.
  //
  // Los dos casos necesitan una forma de contenedor distinta (tarjeta angosta
  // centrada vs. fluido a todo el ancho), no solo un className distinto:
  // el fondo oscuro tiene que cubrir TODA la pantalla y centrar la tarjeta
  // en el medio, si no queda como acá (la tarjeta pegada a la izquierda y
  // el resto en blanco, el fondo del <body> sin pintar).
  if (!showNav) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-bg text-text">
        <SkipLink />
        <main id="contenido" tabIndex={-1} className="flex w-full max-w-[430px] flex-col outline-none">{renderScreen()}</main>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-bg text-text md:flex-row">
      <SkipLink />
      {activeTab ? <SidebarNav items={visibleNavItems} active={activeTab} onNav={handleNav} /> : null}
      <main id="contenido" tabIndex={-1} className="flex flex-1 flex-col overflow-hidden outline-none">{renderScreen()}</main>
      {activeTab ? <BottomNav items={visibleNavItems} active={activeTab} onNav={handleNav} /> : null}
      <Toaster />
    </div>
  );
}
