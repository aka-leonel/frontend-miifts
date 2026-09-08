import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | "login"
  | "registro"
  | "carrera"
  | "inicio"
  | "materias"
  | "detalle"
  | "recordatorios"
  | "recursos"
  | "convenios";

type NavTab = "inicio" | "materias" | "recordatorios" |"Mi perfil";

type BadgeStatus = "Pendiente" | "En curso" | "Regular" | "Aprobada";

interface Materia {
  id: number;
  nombre: string;
  estado: BadgeStatus;
  nota?: number;
  requisito?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const materias: Materia[] = [
  { id: 1, nombre: "Análisis Matemático I", estado: "Regular", nota: 7, requisito: "Álgebra" },
  { id: 2, nombre: "Programación I", estado: "Aprobada", nota: 9 },
  { id: 3, nombre: "Sistemas Operativos", estado: "En curso" },
  { id: 4, nombre: "Inglés Técnico", estado: "Pendiente" },
  { id: 5, nombre: "Base de Datos I", estado: "Aprobada", nota: 8 },
];

const recordatorios = [
  { id: 1, titulo: "Parcial Análisis Matemático I", fecha: "Lun 9 Sep", hora: "10:00", tipo: "parcial" },
  { id: 2, titulo: "Entrega TP Programación I", fecha: "Mié 11 Sep", hora: "23:59", tipo: "entrega" },
  { id: 3, titulo: "Clase Sistemas Operativos", fecha: "Vie 13 Sep", hora: "18:00", tipo: "clase" },
  { id: 4, titulo: "Examen Base de Datos I", fecha: "Lun 16 Sep", hora: "09:00", tipo: "parcial" },
];

const carreras = [
  "Desarrollo de Software",
  "Análisis de Sistemas",
  "Redes y Comunicaciones",
  "Ciberseguridad",
  "Ciencia de Datos",
];

const conveniosUniversidades = [
  { nombre: "UBA — Cs. Exactas", requisitos: "Regular en 5 materias", logo: "U" },
  { nombre: "UTN — FRBA", requisitos: "Aprobación de 1er año", logo: "U" },
  { nombre: "UNSAM", requisitos: "Promedio ≥ 6", logo: "U" },
];

const conveniosTalento = [
  { nombre: "Talento Tech — IA", requisitos: "Alumno activo IFTS", logo: "T" },
  { nombre: "Talento Tech — UX", requisitos: "Alumno activo IFTS", logo: "T" },
  { nombre: "Talento Tech — Ciberseg.", requisitos: "Alumno activo IFTS", logo: "T" },
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

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ status }: { status: BadgeStatus }) {
  const map: Record<BadgeStatus, { bg: string; color: string; label: string }> = {
    Pendiente: { bg: "rgba(154,154,176,0.15)", color: MUTED, label: "Pendiente" },
    "En curso": { bg: "rgba(140,125,255,0.18)", color: VIOLET, label: "En curso" },
    Regular: { bg: "rgba(207,255,94,0.15)", color: LIME, label: "Regular" },
    Aprobada: { bg: "rgba(63,185,80,0.18)", color: GREEN, label: "Aprobada" },
  };
  const { bg, color, label } = map[status];
  return (
    <span
      style={{
        background: bg,
        color,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.2,
        display: "inline-block",
      }}
    >
      {label}
    </span>
  );
}

// ─── Bottom Navbar ────────────────────────────────────────────────────────────
const navItems: { key: NavTab; label: string; icon: JSX.Element }[] = [
  {
    key: "inicio",
    label: "Inicio",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "materias",
    label: "Materias",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 7h7M9 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "recordatorios",
    label: "Recordat.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "recursos",
    label: "Recursos",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M13 2v7h7M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "convenios",
    label: "Convenios",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

function BottomNav({
  active,
  onNav,
}: {
  active: NavTab;
  onNav: (t: NavTab) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 430,
        background: CARD,
        borderTop: `0.5px solid ${BORDER}`,
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0 20px",
        zIndex: 100,
      }}
    >
      {navItems.map((item) => {
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onNav(item.key)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              background: "none",
              border: "none",
              color: isActive ? VIOLET : MUTED,
              cursor: "pointer",
              padding: "4px 8px",
              transition: "color 0.2s",
            }}
          >
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── FAB ──────────────────────────────────────────────────────────────────────
function FAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: 90,
        right: "calc(50% - 210px + 20px)",
        width: 52,
        height: 52,
        borderRadius: 16,
        background: VIOLET,
        border: "none",
        color: "#fff",
        fontSize: 24,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(140,125,255,0.4)",
        zIndex: 99,
      }}
    >
      +
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Input({
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        background: CARD,
        border: `0.5px solid ${BORDER}`,
        borderRadius: 10,
        padding: "14px 16px",
        color: TEXT,
        fontSize: 15,
        outline: "none",
      }}
      onFocus={(e) => (e.target.style.borderColor = VIOLET)}
      onBlur={(e) => (e.target.style.borderColor = BORDER)}
    />
  );
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────
function PrimaryButton({
  children,
  onClick,
  fullWidth = true,
}: {
  children: React.ReactNode;
  onClick: () => void;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: fullWidth ? "100%" : "auto",
        background: VIOLET,
        border: "none",
        borderRadius: 10,
        padding: "15px 24px",
        color: "#fff",
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        transition: "opacity 0.2s",
      }}
      onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "0.88")}
      onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "1")}
    >
      {children}
    </button>
  );
}

// ─── Screen wrapper ───────────────────────────────────────────────────────────
function ScreenWrap({
  children,
  padBottom = false,
  style,
}: {
  children: React.ReactNode;
  padBottom?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        paddingBottom: padBottom ? 90 : 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Screen 1: Login ──────────────────────────────────────────────────────────
function LoginScreen({ onGo }: { onGo: (s: Screen) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <ScreenWrap>
      <div style={{ padding: "60px 28px 0", display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Logo */}
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${VIOLET} 0%, #6B5CE7 100%)`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M8 28V14l10-8 10 8v14H22v-8h-8v8H8z" fill="white" />
            </svg>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: TEXT, letterSpacing: -0.5 }}>
            mi<span style={{ color: VIOLET }}>IFTS</span>
          </div>
          <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>Tu organizador académico</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input placeholder="Email institucional" type="email" value={email} onChange={setEmail} />
          <Input placeholder="Contraseña" type="password" value={pass} onChange={setPass} />
        </div>

        <div style={{ marginTop: 24 }}>
          <PrimaryButton onClick={() => onGo("registro")}>Ingresar</PrimaryButton>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, color: MUTED, fontSize: 14 }}>
          ¿No tenés cuenta?{" "}
          <button
            onClick={() => onGo("registro")}
            style={{ background: "none", border: "none", color: VIOLET, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
          >
            Registrate
          </button>
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
        <button
          onClick={() => onGo("login")}
          style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", marginBottom: 24, padding: 0, display: "flex", alignItems: "center", gap: 6 }}
        >
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

        <div style={{ marginTop: 28 }}>
          <PrimaryButton onClick={() => onGo("carrera")}>Continuar</PrimaryButton>
        </div>

        <p style={{ color: MUTED, fontSize: 12, textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
          Al registrarte aceptás los{" "}
          <span style={{ color: VIOLET }}>términos y condiciones</span>
        </p>
      </div>
    </ScreenWrap>
  );
}

// ─── Screen 3: Elegí tu carrera ───────────────────────────────────────────────
function CarreraScreen({ onGo }: { onGo: (s: Screen) => void }) {
  const [selected, setSelected] = useState<string | null>("Desarrollo de Software");

  return (
    <ScreenWrap>
      <div style={{ padding: "56px 24px 0" }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, letterSpacing: -0.3 }}>¿Qué estudiás?</div>
          <div style={{ color: MUTED, fontSize: 14, marginTop: 6 }}>Seleccioná tu carrera en el IFTS</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {carreras.map((c) => (
            <button
              key={c}
              onClick={() => setSelected(c)}
              style={{
                background: selected === c ? "rgba(140,125,255,0.12)" : CARD,
                border: `0.5px solid ${selected === c ? VIOLET : BORDER}`,
                borderRadius: 14,
                padding: "16px 18px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
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

// ─── Byte Mascot Card ─────────────────────────────────────────────────────────
function ByteCard() {
  const aprobadas = materias.filter((m) => m.estado === "Aprobada").length;
  const total = 10;
  const pct = Math.round((aprobadas / total) * 100);

  return (
    <div
      style={{
        background: CARD,
        border: `0.5px solid ${BORDER}`,
        borderRadius: 14,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Robot mascot */}
      <div style={{ flexShrink: 0 }}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          {/* gorra */}
          <ellipse cx="28" cy="16" rx="14" ry="4" fill={LIME} />
          <rect x="14" y="12" width="28" height="6" rx="2" fill={LIME} />
          {/* visera */}
          <rect x="22" y="16" width="18" height="4" rx="2" fill="#A8D420" />
          {/* cabeza */}
          <rect x="16" y="18" width="24" height="20" rx="6" fill="#2A2B36" stroke={BORDER} strokeWidth="0.5" />
          {/* ojos */}
          <circle cx="23" cy="27" r="3.5" fill={VIOLET} />
          <circle cx="33" cy="27" r="3.5" fill={VIOLET} />
          <circle cx="24" cy="26" r="1.2" fill="white" />
          <circle cx="34" cy="26" r="1.2" fill="white" />
          {/* boca */}
          <path d="M23 33 Q28 36 33 33" stroke={LIME} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* cuerpo */}
          <rect x="20" y="40" width="16" height="10" rx="4" fill="#2A2B36" stroke={BORDER} strokeWidth="0.5" />
          {/* antena */}
          <line x1="28" y1="18" x2="28" y2="12" stroke={LIME} strokeWidth="1.5" />
          <circle cx="28" cy="11" r="2" fill={LIME} />
        </svg>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ color: TEXT, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
          ¡Hola! Soy <span style={{ color: LIME }}>Byte</span> 👾
        </div>
        <div style={{ color: MUTED, fontSize: 12, marginBottom: 10 }}>
          {aprobadas} de {total} materias aprobadas
        </div>
        <div
          style={{
            background: "#2A2B36",
            borderRadius: 20,
            height: 6,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${VIOLET} 0%, ${LIME} 100%)`,
              borderRadius: 20,
              transition: "width 0.8s ease",
            }}
          />
        </div>
        <div style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>{pct}% del plan completado</div>
      </div>
    </div>
  );
}

// ─── Screen 4: Inicio ─────────────────────────────────────────────────────────
function InicioScreen({ onGo }: { onGo: (s: Screen) => void }) {
  const [query, setQuery] = useState("");
  const proximos = recordatorios.slice(0, 3);
  const dotColor: Record<string, string> = {
    parcial: VIOLET,
    entrega: LIME,
    clase: "#C084FC",
  };

  return (
    <ScreenWrap padBottom>
      <div style={{ padding: "52px 24px 0" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ color: MUTED, fontSize: 13 }}>Bienvenida de vuelta</div>
            <div style={{ color: TEXT, fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>Hola, Martina 👋</div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${VIOLET} 0%, #6B5CE7 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            MR
          </div>
        </div>

        {/* Búsqueda */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
            width="16" height="16" viewBox="0 0 24 24" fill="none"
          >
            <circle cx="11" cy="11" r="8" stroke={MUTED} strokeWidth="1.5" />
            <path d="M21 21l-4.35-4.35" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            placeholder="Buscar materia o recurso..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              background: CARD,
              border: `0.5px solid ${BORDER}`,
              borderRadius: 10,
              padding: "12px 16px 12px 40px",
              color: TEXT,
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        {/* Byte */}
        <div style={{ marginBottom: 28 }}>
          <ByteCard />
        </div>

        {/* Próximos recordatorios */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ color: TEXT, fontWeight: 700, fontSize: 15 }}>Próximos</div>
            <button
              onClick={() => onGo("recordatorios")}
              style={{ background: "none", border: "none", color: VIOLET, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            >
              Ver todos
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {proximos.map((r) => (
              <div
                key={r.id}
                style={{
                  background: CARD,
                  border: `0.5px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: "13px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: dotColor[r.tipo],
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>{r.titulo}</div>
                  <div style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>{r.fecha} · {r.hora}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mis materias horizontal scroll */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ color: TEXT, fontWeight: 700, fontSize: 15 }}>Mis materias</div>
            <button
              onClick={() => onGo("materias")}
              style={{ background: "none", border: "none", color: VIOLET, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            >
              Ver todas
            </button>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4, margin: "0 -24px", padding: "0 24px" }}>
            {materias.map((m) => (
              <div
                key={m.id}
                onClick={() => onGo("detalle")}
                style={{
                  background: CARD,
                  border: `0.5px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  minWidth: 150,
                  maxWidth: 150,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <Badge status={m.estado} />
                <div style={{ color: TEXT, fontSize: 13, fontWeight: 600, marginTop: 10, lineHeight: 1.3 }}>
                  {m.nombre}
                </div>
                {m.nota && (
                  <div style={{ color: MUTED, fontSize: 12, marginTop: 6 }}>Nota: {m.nota}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenWrap>
  );
}

// ─── Screen 5: Materias ───────────────────────────────────────────────────────
function MateriasScreen({ onGo }: { onGo: (s: Screen) => void }) {
  const chips: (BadgeStatus | "Todas")[] = ["Todas", "En curso", "Regular", "Aprobada", "Pendiente"];
  const [active, setActive] = useState<BadgeStatus | "Todas">("Todas");

  const filtered = active === "Todas" ? materias : materias.filter((m) => m.estado === active);

  return (
    <>
      <ScreenWrap padBottom>
        <div style={{ padding: "52px 24px 0" }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ color: TEXT, fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>Mis Materias</div>
            <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>Desarrollo de Software</div>
          </div>

          {/* Chips */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 22, paddingBottom: 2 }}>
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                style={{
                  flexShrink: 0,
                  background: active === c ? VIOLET : CARD,
                  border: `0.5px solid ${active === c ? VIOLET : BORDER}`,
                  borderRadius: 20,
                  padding: "7px 16px",
                  color: active === c ? "#fff" : MUTED,
                  fontSize: 13,
                  fontWeight: active === c ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => onGo("detalle")}
                style={{
                  background: CARD,
                  border: `0.5px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ color: TEXT, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{m.nombre}</div>
                  <Badge status={m.estado} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {m.nota && (
                    <div
                      style={{
                        background: "rgba(140,125,255,0.12)",
                        borderRadius: 10,
                        padding: "4px 10px",
                        color: VIOLET,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {m.nota}
                    </div>
                  )}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScreenWrap>
      <FAB onClick={() => {}} />
    </>
  );
}

// ─── Screen 6: Detalle de materia ─────────────────────────────────────────────
function DetalleScreen({ onGo }: { onGo: (s: Screen) => void }) {
  const materia = materias[0]; // Análisis Matemático I

  const recursos = [
    { nombre: "Meet — Clase del 5/9", tipo: "meet" },
    { nombre: "Drive — TP Integrador", tipo: "drive" },
    { nombre: "WhatsApp — Grupo 2024", tipo: "whatsapp" },
    { nombre: "Apunte Unidad 2.pdf", tipo: "pdf" },
  ];

  const iconFor = (tipo: string) => {
    if (tipo === "meet") return (
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,167,122,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="12" height="12" rx="2" fill="#00A77A" /><path d="M14 9l6-3v12l-6-3V9z" fill="#00A77A" /></svg>
      </div>
    );
    if (tipo === "drive") return (
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(26,115,232,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 19h18L12 2z" fill="none" stroke="#1A73E8" strokeWidth="1.5" /><path d="M3 19h18" stroke="#1A73E8" strokeWidth="1.5" /><path d="M12 2L3 19" stroke="#1A73E8" strokeWidth="1.5" /></svg>
      </div>
    );
    if (tipo === "whatsapp") return (
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(37,211,102,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.98L0 24l6.18-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52z" fill="#25D366" /></svg>
      </div>
    );
    return (
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(234,67,53,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#EA4335" /></svg>
      </div>
    );
  };

  return (
    <ScreenWrap padBottom>
      <div style={{ padding: "52px 24px 0" }}>
        <button
          onClick={() => onGo("materias")}
          style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Materias
        </button>

        <div style={{ marginBottom: 24 }}>
          <div style={{ color: TEXT, fontSize: 20, fontWeight: 800, letterSpacing: -0.3, marginBottom: 10 }}>
            {materia.nombre}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Badge status={materia.estado} />
            <span
              style={{
                background: "rgba(140,125,255,0.12)",
                borderRadius: 10,
                padding: "3px 10px",
                color: VIOLET,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Nota: {materia.nota}
            </span>
          </div>
        </div>

        {/* Info card */}
        <div
          style={{
            background: CARD,
            border: `0.5px solid ${BORDER}`,
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke={MUTED} strokeWidth="1.5" strokeLinejoin="round" /></svg>
            <div>
              <div style={{ color: MUTED, fontSize: 11 }}>Correlativa</div>
              <div style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>Requiere: {materia.requisito}</div>
            </div>
          </div>
          <div style={{ borderTop: `0.5px solid ${BORDER}` }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={MUTED} strokeWidth="1.5" /><path d="M12 6v6l4 2" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" /></svg>
            <div>
              <div style={{ color: MUTED, fontSize: 11 }}>Cuatrimestre</div>
              <div style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>1er cuatrimestre 2024</div>
            </div>
          </div>
        </div>

        {/* Recursos */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: TEXT, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Recursos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recursos.map((r, i) => (
              <div
                key={i}
                style={{
                  background: CARD,
                  border: `0.5px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                }}
              >
                {iconFor(r.tipo)}
                <div style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>{r.nombre}</div>
              </div>
            ))}
          </div>
        </div>

        <PrimaryButton onClick={() => onGo("recordatorios")}>Agregar recordatorio</PrimaryButton>
      </div>
    </ScreenWrap>
  );
}

// ─── Screen 7: Recordatorios ──────────────────────────────────────────────────
function RecordatoriosScreen() {
  const [lista, setLista] = useState(recordatorios);
  const dotColor: Record<string, string> = {
    parcial: VIOLET,
    entrega: LIME,
    clase: "#C084FC",
  };
  const tipoLabel: Record<string, string> = {
    parcial: "Parcial",
    entrega: "Entrega",
    clase: "Clase",
  };

  const semana1 = lista.filter((r) => r.id <= 3);
  const semana2 = lista.filter((r) => r.id > 3);

  const [swiping, setSwiping] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setSwiping(id);
    setTimeout(() => {
      setLista((prev) => prev.filter((r) => r.id !== id));
      setSwiping(null);
    }, 300);
  };

  const ReminderCard = ({ r }: { r: (typeof recordatorios)[0] }) => (
    <div
      style={{
        background: CARD,
        border: `0.5px solid ${BORDER}`,
        borderRadius: 14,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transition: "transform 0.3s ease, opacity 0.3s ease",
        transform: swiping === r.id ? "translateX(100%)" : "translateX(0)",
        opacity: swiping === r.id ? 0 : 1,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: dotColor[r.tipo],
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>{r.titulo}</div>
        <div style={{ color: MUTED, fontSize: 12, marginTop: 3 }}>
          <span
            style={{
              background: `${dotColor[r.tipo]}20`,
              color: dotColor[r.tipo],
              borderRadius: 20,
              padding: "2px 8px",
              fontSize: 11,
              marginRight: 6,
            }}
          >
            {tipoLabel[r.tipo]}
          </span>
          {r.fecha} · {r.hora}
        </div>
      </div>
      <button
        onClick={() => handleDelete(r.id)}
        style={{ background: "none", border: "none", color: "#FF6B6B", cursor: "pointer", padding: 4 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );

  return (
    <>
      <ScreenWrap padBottom>
        <div style={{ padding: "52px 24px 0" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: TEXT, fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>Recordatorios</div>
            <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>{lista.length} recordatorio{lista.length !== 1 ? "s" : ""} activo{lista.length !== 1 ? "s" : ""}</div>
          </div>

          {semana1.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: MUTED, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>
                Esta semana
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {semana1.map((r) => (
                  <ReminderCard key={r.id} r={r} />
                ))}
              </div>
            </div>
          )}

          {semana2.length > 0 && (
            <div>
              <div style={{ color: MUTED, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>
                Próxima semana
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {semana2.map((r) => (
                  <ReminderCard key={r.id} r={r} />
                ))}
              </div>
            </div>
          )}

          {lista.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: 60, color: MUTED }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>Sin recordatorios</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Tocá + para agregar uno</div>
            </div>
          )}
        </div>
      </ScreenWrap>
      <FAB onClick={() => {}} />
    </>
  );
}

// ─── Screen 8: Recursos ───────────────────────────────────────────────────────
function RecursosScreen() {
  const [open, setOpen] = useState<number | null>(0);

  const grupos = materias.map((m) => ({
    materia: m,
    items: [
      { nombre: "Meet — Enlace de clase", tipo: "meet" },
      { nombre: "Drive — Carpeta compartida", tipo: "drive" },
      { nombre: "WhatsApp — Grupo", tipo: "whatsapp" },
    ].slice(0, m.estado === "Pendiente" ? 1 : 3),
  }));

  const iconSmall = (tipo: string) => {
    const colors: Record<string, string> = { meet: "#00A77A", drive: "#1A73E8", whatsapp: "#25D366", pdf: "#EA4335" };
    const labels: Record<string, string> = { meet: "Meet", drive: "Drive", whatsapp: "WA", pdf: "PDF" };
    return (
      <div style={{ width: 28, height: 28, borderRadius: 7, background: `${colors[tipo]}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: colors[tipo], fontSize: 9, fontWeight: 700 }}>{labels[tipo]}</span>
      </div>
    );
  };

  return (
    <ScreenWrap padBottom>
      <div style={{ padding: "52px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ color: TEXT, fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>Recursos</div>
            <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>Links y materiales por materia</div>
          </div>
          <button
            style={{
              background: "rgba(140,125,255,0.12)",
              border: `0.5px solid ${VIOLET}`,
              borderRadius: 10,
              padding: "7px 14px",
              color: VIOLET,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Editar
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {grupos.map((g, i) => (
            <div
              key={i}
              style={{
                background: CARD,
                border: `0.5px solid ${BORDER}`,
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "15px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>{g.materia.nombre}</div>
                  <div style={{ marginTop: 4 }}><Badge status={g.materia.estado} /></div>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                >
                  <path d="M6 9l6 6 6-6" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {open === i && (
                <div style={{ borderTop: `0.5px solid ${BORDER}` }}>
                  {g.items.map((item, j) => (
                    <div
                      key={j}
                      style={{
                        padding: "12px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        borderBottom: j < g.items.length - 1 ? `0.5px solid ${BORDER}` : "none",
                        cursor: "pointer",
                      }}
                    >
                      {iconSmall(item.tipo)}
                      <div style={{ color: TEXT, fontSize: 13 }}>{item.nombre}</div>
                      <div style={{ marginLeft: "auto" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ScreenWrap>
  );
}

// ─── Screen 9: Convenios ──────────────────────────────────────────────────────
function ConveniosScreen() {
  const [tab, setTab] = useState<"universidades" | "talento">("universidades");

  const items = tab === "universidades" ? conveniosUniversidades : conveniosTalento;

  return (
    <ScreenWrap padBottom>
      <div style={{ padding: "52px 24px 0" }}>
        <div style={{ marginBottom: 22 }}>
          <div style={{ color: TEXT, fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>Convenios</div>
          <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>Oportunidades para estudiantes IFTS</div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            background: CARD,
            border: `0.5px solid ${BORDER}`,
            borderRadius: 10,
            padding: 4,
            marginBottom: 24,
          }}
        >
          {(["universidades", "talento"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                background: tab === t ? VIOLET : "none",
                border: "none",
                borderRadius: 8,
                padding: "9px 0",
                color: tab === t ? "#fff" : MUTED,
                fontSize: 13,
                fontWeight: tab === t ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {t === "universidades" ? "Universidades" : "Talento Tech"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                background: CARD,
                border: `0.5px solid ${BORDER}`,
                borderRadius: 14,
                padding: "16px 18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: tab === "universidades" ? "rgba(140,125,255,0.15)" : "rgba(207,255,94,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: tab === "universidades" ? VIOLET : LIME,
                    fontWeight: 800,
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {item.logo}
                </div>
                <div>
                  <div style={{ color: TEXT, fontSize: 14, fontWeight: 600 }}>{item.nombre}</div>
                  <div style={{ color: MUTED, fontSize: 12, marginTop: 3 }}>{item.requisitos}</div>
                </div>
              </div>
              <button
                style={{
                  width: "100%",
                  background: "rgba(140,125,255,0.1)",
                  border: `0.5px solid ${VIOLET}`,
                  borderRadius: 10,
                  padding: "10px 0",
                  color: VIOLET,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Más info
              </button>
            </div>
          ))}
        </div>
      </div>
    </ScreenWrap>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
const navToScreen: Record<NavTab, Screen> = {
  inicio: "inicio",
  materias: "materias",
  recordatorios: "recordatorios",
  recursos: "recursos",
  convenios: "convenios",
};

const screenToNav: Partial<Record<Screen, NavTab>> = {
  inicio: "inicio",
  materias: "materias",
  detalle: "materias",
  recordatorios: "recordatorios",
  recursos: "recursos",
  convenios: "convenios",
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");

  const handleNav = (tab: NavTab) => {
    setScreen(navToScreen[tab]);
  };

  const showNav = !["login", "registro", "carrera"].includes(screen);
  const activeTab = screenToNav[screen];

  const renderScreen = () => {
    switch (screen) {
      case "login": return <LoginScreen onGo={setScreen} />;
      case "registro": return <RegistroScreen onGo={setScreen} />;
      case "carrera": return <CarreraScreen onGo={setScreen} />;
      case "inicio": return <InicioScreen onGo={setScreen} />;
      case "materias": return <MateriasScreen onGo={setScreen} />;
      case "detalle": return <DetalleScreen onGo={setScreen} />;
      case "recordatorios": return <RecordatoriosScreen />;
      case "recursos": return <RecursosScreen />;
      case "convenios": return <ConveniosScreen />;
    }
  };

  return (
    <div
      style={{
        background: BG,
        minHeight: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          minHeight: "100vh",
          background: BG,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          color: TEXT,
        }}
      >
        {renderScreen()}
        {showNav && activeTab && (
          <BottomNav active={activeTab} onNav={handleNav} />
        )}
      </div>
    </div>
  );
}
