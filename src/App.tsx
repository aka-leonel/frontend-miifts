import { useState } from "react";
import { Toaster } from "./components";
import { ConveniosScreen as ConveniosFeatureScreen } from "./features/convenios";
import InicioReal from "./features/materias/InicioScreen";
import MisMateriasReal from "./features/materias/MisMateriasScreen";
import { MateriaDetalleScreen as MateriaDetalleFeatureScreen } from "./features/materia-detalle/MateriaDetalleScreen";
import { RecordatoriosScreen as RecordatoriosFeatureScreen } from "./features/recordatorios";
import PerfilFeatureScreen from "./features/perfil/PerfilScreen";
import { useLogin } from "./features/auth/hooks";
import { haySesion } from "./features/auth/service";
import { ApiError } from "./lib/apiClient";
import { useToast } from "./hooks/useToast";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | "login"
  | "registro"
  | "carrera"
  | "inicio"
  | "materias"
  | "detalle"
  | "recordatorios"
  | "convenios"
  | "perfil";

type NavTab = "inicio" | "materias" | "recordatorios" | "convenios" | "perfil";

// ─── Data ─────────────────────────────────────────────────────────────────────
const carreras = [
  "Desarrollo de Software",
  "Análisis de Sistemas",
  "Redes y Comunicaciones",
  "Ciberseguridad",
  "Ciencia de Datos",
];

// ─── Design tokens ─────────────────────────────────────────────────────────────
const BG = "#111218";
const CARD = "#1A1B23";
const BORDER = "#2A2B36";
const VIOLET = "#8C7DFF";
const LIME = "#CFFF5E";
const GREEN = "#3FB950";
const TEXT = "#E8E8F0";
const MUTED = "#9A9AB0";

// ─── Bottom Navbar ────────────────────────────────────────────────────────────
const navItems: { key: NavTab; label: string; icon: React.ReactNode }[] = [
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
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
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

function BottomNav({ active, onNav }: { active: NavTab; onNav: (t: NavTab) => void }) {
  return (
    <div
      className="w-full"
      style={{ position: "fixed", bottom: 0, left: 0, background: CARD, borderTop: `0.5px solid ${BORDER}`, display: "flex", justifyContent: "space-around", padding: "10px 0 20px", zIndex: 100 }}
    >
      {navItems.map((item) => {
        const isActive = active === item.key;
        return (
          <button key={item.key} onClick={() => onNav(item.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", color: isActive ? VIOLET : MUTED, cursor: "pointer", padding: "4px 8px", transition: "color 0.2s" }}>
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Input({ placeholder, type = "text", value, onChange }: { placeholder: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px", color: TEXT, fontSize: 15, outline: "none" }}
      onFocus={(e) => (e.target.style.borderColor = VIOLET)}
      onBlur={(e) => (e.target.style.borderColor = BORDER)}
    />
  );
}

function PrimaryButton({ children, onClick, fullWidth = true }: { children: React.ReactNode; onClick: () => void; fullWidth?: boolean }) {
  return (
    <button onClick={onClick} style={{ width: fullWidth ? "100%" : "auto", background: VIOLET, border: "none", borderRadius: 10, padding: "15px 24px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
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
      onGo("inicio");
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : "No se pudo iniciar sesión.";
      pushToast(msg, "error");
    }
  };

  return (
    <ScreenWrap>
      <div style={{ padding: "60px 28px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${VIOLET} 0%, #6B5CE7 100%)`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M8 28V14l10-8 10 8v14H22v-8h-8v8H8z" fill="white" /></svg>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: TEXT, letterSpacing: -0.5 }}>mi<span style={{ color: VIOLET }}>IFTS</span></div>
          <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>Tu organizador académico</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input placeholder="Email institucional" type="email" value={email} onChange={setEmail} />
          <Input placeholder="Contraseña" type="password" value={pass} onChange={setPass} />
        </div>
        <div style={{ marginTop: 24 }}>
          <PrimaryButton onClick={handleIngresar}>{login.loading ? "Ingresando…" : "Ingresar"}</PrimaryButton>
        </div>
        <p style={{ textAlign: "center", marginTop: 24, color: MUTED, fontSize: 14 }}>
          ¿No tenés cuenta?{" "}
          <button onClick={() => onGo("registro")} style={{ background: "none", border: "none", color: VIOLET, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Registrate</button>
        </p>
      </div>
    </ScreenWrap>
  );
}

// ─── Screen 2: Registro ───────────────────────────────────────────────────────
function RegistroScreen({ onGo }: { onGo: (s: Screen) => void }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  return (
    <ScreenWrap>
      <div style={{ padding: "56px 28px 0" }}>
        <button onClick={() => onGo("login")} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", marginBottom: 24, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Volver
        </button>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: TEXT, letterSpacing: -0.4, marginBottom: 4 }}>Crear cuenta</div>
          <div style={{ color: MUTED, fontSize: 14 }}>Completá tus datos para empezar</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input placeholder="Nombre y apellido" value={nombre} onChange={setNombre} />
          <Input placeholder="Email institucional" type="email" value={email} onChange={setEmail} />
          <Input placeholder="Contraseña" type="password" value={pass} onChange={setPass} />
        </div>
        <div style={{ marginTop: 28 }}><PrimaryButton onClick={() => onGo("carrera")}>Continuar</PrimaryButton></div>
        <p style={{ color: MUTED, fontSize: 12, textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
          Al registrarte aceptás los <span style={{ color: VIOLET }}>términos y condiciones</span>
        </p>
      </div>
    </ScreenWrap>
  );
}

// ─── Screen 3: Elegí tu carrera ───────────────────────────────────────────────
function CarreraScreen({ onGo }: { onGo: (s: Screen) => void }) {
  const [selected, setSelected] = useState("Desarrollo de Software");
  return (
    <ScreenWrap>
      <div style={{ padding: "56px 24px 0" }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.3 }}>¿Qué estudiás?</div>
          <div style={{ color: MUTED, fontSize: 14, marginTop: 6 }}>Seleccioná tu carrera en el IFTS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {carreras.map((c) => (
            <button key={c} onClick={() => setSelected(c)} style={{ background: selected === c ? "rgba(140,125,255,0.12)" : CARD, border: `0.5px solid ${selected === c ? VIOLET : BORDER}`, borderRadius: 14, padding: "16px 18px", textAlign: "left", cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ color: TEXT, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{c}</div>
              <div style={{ color: MUTED, fontSize: 12 }}>6 cuatrimestres · 32 materias</div>
            </button>
          ))}
        </div>
        <PrimaryButton onClick={() => onGo("inicio")}>Empezar</PrimaryButton>
      </div>
    </ScreenWrap>
  );
}

// ─── ByteCard ─────────────────────────────────────────────────────────────────
// ─── Screens 4–5: Inicio / Materias ────────────────────────────────────────────
// Reemplazadas por las pantallas reales (Integrante 2, ver imports arriba):
// InicioReal, MisMateriasReal.

// ─── Screen 6: Detalle de materia ─────────────────────────────────────────────
// Eliminada: reemplazada por MateriaDetalleFeatureScreen (ver imports arriba).

// ─── Screen 7: Recordatorios ──────────────────────────────────────────────────
// Reemplazada por RecordatoriosFeatureScreen (Integrante 4, ver imports arriba).

// ─── Screen 8: Convenios ──────────────────────────────────────────────────────
// Reemplazada por ConveniosFeatureScreen (Integrante 1, ver imports arriba).

// ─── Screen 9: Mi Perfil ──────────────────────────────────────────────────────
// Reemplazada por PerfilFeatureScreen (Integrante 4, ver imports arriba).

// ─── App root ─────────────────────────────────────────────────────────────────
const navToScreen: Record<NavTab, Screen> = {
  inicio: "inicio",
  materias: "materias",
  recordatorios: "recordatorios",
  convenios: "convenios",
  perfil: "perfil",
};

const screenToNav: Partial<Record<Screen, NavTab>> = {
  inicio: "inicio",
  materias: "materias",
  detalle: "materias",
  recordatorios: "recordatorios",
  convenios: "convenios",
  perfil: "perfil",
};

export default function App() {
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  const [screen, setScreen] = useState<Screen>(() => (haySesion() ? "inicio" : "login"));
  // No hay react-router en esta app todavía (el resto navega con este mismo
  // switch, no con URLs) — mientras tanto, la materia que se está viendo en
  // "detalle" se guarda acá y se pasa por prop.
  const [materiaIdSeleccionada, setMateriaIdSeleccionada] = useState<number | null>(null);

  const handleNav = (tab: NavTab) => setScreen(navToScreen[tab]);
  const showNav = !["login", "registro", "carrera"].includes(screen);
  const activeTab = screenToNav[screen];

  function abrirDetalle(materiaId: number) {
    setMateriaIdSeleccionada(materiaId);
    setScreen("detalle");
  }

  const renderScreen = () => {
    switch (screen) {
      case "login": return <LoginScreen onGo={setScreen} />;
      case "registro": return <RegistroScreen onGo={setScreen} />;
      case "carrera": return <CarreraScreen onGo={setScreen} />;
      case "inicio": return <InicioReal onOpenMateria={abrirDetalle} />;
      case "materias": return <MisMateriasReal onOpenMateria={abrirDetalle} />;
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
    }
  };

  return (
    <div style={{ background: BG, minHeight: "100%" }}>
      <div
        className="w-full"
        style={{ minHeight: "100vh", background: BG, position: "relative", display: "flex", flexDirection: "column", color: TEXT }}
      >
        {renderScreen()}
        {showNav && activeTab && <BottomNav active={activeTab} onNav={handleNav} />}
        <Toaster />
      </div>
    </div>
  );
}
