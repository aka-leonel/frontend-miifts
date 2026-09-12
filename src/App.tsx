import { useState } from "react";
import { Toaster } from "./components";
import { ConveniosScreen as ConveniosFeatureScreen } from "./features/convenios";
import InicioReal from "./features/materias/InicioScreen";
import MisMateriasReal from "./features/materias/MisMateriasScreen";
import { MateriaDetalleScreen as MateriaDetalleFeatureScreen } from "./features/materia-detalle/MateriaDetalleScreen";
import { RecordatoriosScreen as RecordatoriosFeatureScreen } from "./features/recordatorios";
import PerfilFeatureScreen from "./features/perfil/PerfilScreen";

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

type BadgeStatus = "Pendiente" | "En curso" | "Regular" | "Aprobada";

interface Materia {
  id: number;
  nombre: string;
  estado: BadgeStatus;
  nota?: number;
  requisito?: string;
}

interface Recurso {
  id: number;
  nombre: string;
  link: string;
  tipo: "meet" | "drive" | "whatsapp" | "pdf";
}

interface Recordatorio {
  id: number;
  titulo: string;
  fecha: string;
  hora: string;
  tipo: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const materiasInit: Materia[] = [
  { id: 1, nombre: "Análisis Matemático I", estado: "Regular", nota: 7, requisito: "Álgebra" },
  { id: 2, nombre: "Programación I", estado: "Aprobada", nota: 9 },
  { id: 3, nombre: "Sistemas Operativos", estado: "En curso" },
  { id: 4, nombre: "Inglés Técnico", estado: "Pendiente" },
  { id: 5, nombre: "Base de Datos I", estado: "Aprobada", nota: 8 },
];

const recursosInit: Recurso[] = [
  { id: 1, nombre: "Meet — Clase semanal", link: "meet.google.com/abc-def", tipo: "meet" },
  { id: 2, nombre: "Drive — Carpeta TP", link: "drive.google.com/drive/xyz", tipo: "drive" },
  { id: 3, nombre: "WhatsApp — Grupo 2024", link: "chat.whatsapp.com/group", tipo: "whatsapp" },
  { id: 4, nombre: "Apunte Unidad 2.pdf", link: "drive.google.com/file/abc", tipo: "pdf" },
];

const recordatoriosInit: Recordatorio[] = [
  { id: 1, titulo: "Parcial Análisis Matemático I", fecha: "Lun 9 Sep", hora: "10:00", tipo: "parcial" },
  { id: 2, titulo: "Entrega TP Programación I", fecha: "Mié 11 Sep", hora: "23:59", tipo: "tp" },
  { id: 3, titulo: "Clase Sistemas Operativos", fecha: "Vie 13 Sep", hora: "18:00", tipo: "otro" },
  { id: 4, titulo: "Examen Base de Datos I", fecha: "Lun 16 Sep", hora: "09:00", tipo: "final" },
];

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

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ status }: { status: BadgeStatus }) {
  const map: Record<BadgeStatus, { bg: string; color: string }> = {
    Pendiente: { bg: "rgba(154,154,176,0.15)", color: MUTED },
    "En curso": { bg: "rgba(140,125,255,0.18)", color: VIOLET },
    Regular: { bg: "rgba(207,255,94,0.15)", color: LIME },
    Aprobada: { bg: "rgba(63,185,80,0.18)", color: GREEN },
  };
  const { bg, color } = map[status];
  return (
    <span style={{ background: bg, color, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600, letterSpacing: 0.2, display: "inline-block" }}>
      {status}
    </span>
  );
}

// ─── Resource icon ────────────────────────────────────────────────────────────
function RecursoIcon({ tipo, size = 32 }: { tipo: string; size?: number }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    meet: { bg: "rgba(0,167,122,0.15)", color: "#00A77A", label: "Meet" },
    drive: { bg: "rgba(26,115,232,0.15)", color: "#1A73E8", label: "Drive" },
    whatsapp: { bg: "rgba(37,211,102,0.15)", color: "#25D366", label: "WA" },
    pdf: { bg: "rgba(234,67,53,0.15)", color: "#EA4335", label: "PDF" },
  };
  const { bg, color, label } = map[tipo] ?? map.pdf;
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.25, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ color, fontSize: size * 0.28, fontWeight: 700 }}>{label}</span>
    </div>
  );
}

// ─── Overlay Modal ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 200, padding: "0 20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: CARD, borderRadius: 14, width: "100%", maxWidth: 390, padding: "24px 20px", border: `0.5px solid ${BORDER}` }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ color: TEXT, fontWeight: 700, fontSize: 16 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Floating label input inside modals
function ModalInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div style={{ position: "relative", marginBottom: 14 }}>
      <label style={{
        position: "absolute", left: 14,
        top: active ? 6 : "50%",
        transform: active ? "none" : "translateY(-50%)",
        fontSize: active ? 10 : 14, color: active ? VIOLET : MUTED,
        transition: "all 0.15s", pointerEvents: "none", fontWeight: active ? 600 : 400,
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", background: BG, border: `0.5px solid ${focused ? VIOLET : BORDER}`,
          borderRadius: 10, padding: active ? "22px 14px 8px" : "14px", color: TEXT,
          fontSize: 14, outline: "none", transition: "border-color 0.2s",
        }}
      />
    </div>
  );
}

function ModalSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ color: MUTED, fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", background: BG, border: `0.5px solid ${BORDER}`, borderRadius: 10, padding: "13px 14px", color: TEXT, fontSize: 14, outline: "none", cursor: "pointer" }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ModalActions({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
      <button onClick={onClose} style={{ flex: 1, background: "none", border: `0.5px solid ${BORDER}`, borderRadius: 10, padding: "13px 0", color: MUTED, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        Cancelar
      </button>
      <button onClick={onSave} style={{ flex: 2, background: VIOLET, border: "none", borderRadius: 10, padding: "13px 0", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        Guardar
      </button>
    </div>
  );
}

// ─── Modal Materia ─────────────────────────────────────────────────────────────
function ModalMateria({ initial, onClose, onSave }: {
  initial?: Partial<Materia>;
  onClose: () => void;
  onSave: (data: Partial<Materia>) => void;
}) {
  const [matNombre, setMatNombre] = useState(initial?.nombre ?? materiasInit[0].nombre);
  const [cursando, setCursando] = useState(initial?.estado !== "Pendiente");
  const [p1, setP1] = useState(initial?.nota?.toString() ?? "");
  const [p2, setP2] = useState("");
  const [final, setFinal] = useState("");

  return (
    <Modal title={initial ? "Editar materia" : "Agregar materia"} onClose={onClose}>
      <ModalSelect
        label="Materia"
        value={matNombre}
        onChange={setMatNombre}
        options={materiasInit.map((m) => ({ value: m.nombre, label: m.nombre }))}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: BG, border: `0.5px solid ${BORDER}`, borderRadius: 10, padding: "13px 14px", marginBottom: 14 }}>
        <span style={{ color: TEXT, fontSize: 14 }}>¿La cursás actualmente?</span>
        <button
          onClick={() => setCursando((v) => !v)}
          style={{
            width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
            background: cursando ? VIOLET : BORDER, transition: "background 0.2s", position: "relative",
          }}
        >
          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: cursando ? 23 : 3, transition: "left 0.2s" }} />
        </button>
      </div>
      <ModalInput label="1er parcial (1–10)" value={p1} onChange={setP1} type="number" />
      <ModalInput label="2do parcial (1–10)" value={p2} onChange={setP2} type="number" />
      <ModalInput label="Final (1–10)" value={final} onChange={setFinal} type="number" />
      <ModalActions onClose={onClose} onSave={() => {
        const nota = parseInt(final || p2 || p1) || undefined;
        const estado: BadgeStatus = cursando ? (nota && nota >= 4 ? "Regular" : "En curso") : "Pendiente";
        onSave({ nombre: matNombre, estado, nota });
        onClose();
      }} />
    </Modal>
  );
}

// ─── Modal Recurso ─────────────────────────────────────────────────────────────
function ModalRecurso({ initial, onClose, onSave }: {
  initial?: Partial<Recurso>;
  onClose: () => void;
  onSave: (data: Partial<Recurso>) => void;
}) {
  const [titulo, setTitulo] = useState(initial?.nombre ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [tipo, setTipo] = useState<string>(initial?.tipo ?? "meet");

  return (
    <Modal title={initial ? "Editar recurso" : "Agregar recurso"} onClose={onClose}>
      <ModalInput label="Título" value={titulo} onChange={setTitulo} />
      <ModalInput label="Link (URL)" value={link} onChange={setLink} />
      <ModalSelect
        label="Tipo"
        value={tipo}
        onChange={setTipo}
        options={[
          { value: "meet", label: "Google Meet" },
          { value: "drive", label: "Google Drive" },
          { value: "whatsapp", label: "WhatsApp" },
          { value: "pdf", label: "PDF / Documento" },
        ]}
      />
      <ModalActions onClose={onClose} onSave={() => {
        onSave({ nombre: titulo, link, tipo: tipo as Recurso["tipo"] });
        onClose();
      }} />
    </Modal>
  );
}

// ─── Modal Recordatorio ────────────────────────────────────────────────────────
function ModalRecordatorio({ initial, onClose, onSave }: {
  initial?: Partial<Recordatorio>;
  onClose: () => void;
  onSave: (data: Partial<Recordatorio>) => void;
}) {
  const [titulo, setTitulo] = useState(initial?.titulo ?? "");
  const [fecha, setFecha] = useState(initial?.fecha ?? "");
  const [hora, setHora] = useState(initial?.hora ?? "");
  const [tipo, setTipo] = useState(initial?.tipo ?? "parcial");

  return (
    <Modal title={initial ? "Editar recordatorio" : "Agregar recordatorio"} onClose={onClose}>
      <ModalInput label="Título" value={titulo} onChange={setTitulo} />
      <ModalInput label="Fecha (ej: Lun 9 Sep)" value={fecha} onChange={setFecha} />
      <ModalInput label="Hora (ej: 10:00)" value={hora} onChange={setHora} />
      <ModalSelect
        label="Tipo"
        value={tipo}
        onChange={setTipo}
        options={[
          { value: "parcial", label: "Parcial" },
          { value: "tp", label: "Entrega TP" },
          { value: "final", label: "Final" },
          { value: "otro", label: "Otro" },
        ]}
      />
      <ModalActions onClose={onClose} onSave={() => {
        onSave({ titulo, fecha, hora, tipo });
        onClose();
      }} />
    </Modal>
  );
}

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
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: CARD, borderTop: `0.5px solid ${BORDER}`, display: "flex", justifyContent: "space-around", padding: "10px 0 20px", zIndex: 100 }}>
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
        <div style={{ marginTop: 24 }}><PrimaryButton onClick={() => onGo("registro")}>Ingresar</PrimaryButton></div>
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
function DetalleScreen({ onGo }: { onGo: (s: Screen) => void }) {
  const materia = materiasInit[0];
  const [recursos, setRecursos] = useState<Recurso[]>(recursosInit);
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>(recordatoriosInit.slice(0, 2));

  const [modalEditNota, setModalEditNota] = useState(false);
  const [modalNewRecurso, setModalNewRecurso] = useState(false);
  const [modalEditRecurso, setModalEditRecurso] = useState<Recurso | null>(null);
  const [modalNewRec, setModalNewRec] = useState(false);
  const [modalEditRec, setModalEditRec] = useState<Recordatorio | null>(null);

  const dotColor: Record<string, string> = { parcial: VIOLET, tp: LIME, final: GREEN, otro: "#C084FC" };
  const tipoLabel: Record<string, string> = { parcial: "Parcial", tp: "TP", final: "Final", otro: "Otro" };

  return (
    <>
      <ScreenWrap padBottom>
        <div style={{ padding: "52px 24px 0" }}>
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <button onClick={() => onGo("materias")} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Materias
            </button>
            <button onClick={() => setModalEditNota(true)} style={{ background: "rgba(140,125,255,0.12)", border: `0.5px solid ${VIOLET}`, borderRadius: 10, padding: "7px 14px", color: VIOLET, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Editar notas
            </button>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ color: TEXT, fontSize: 20, fontWeight: 800, letterSpacing: -0.3, marginBottom: 10 }}>{materia.nombre}</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Badge status={materia.estado} />
              <span style={{ background: "rgba(140,125,255,0.12)", borderRadius: 10, padding: "3px 10px", color: VIOLET, fontSize: 13, fontWeight: 700 }}>Nota: {materia.nota}</span>
            </div>
          </div>

          {/* Info */}
          <div style={{ background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 14, padding: "16px 18px", marginBottom: 24, display: "flex", flexDirection: "column", gap: 12 }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ color: TEXT, fontWeight: 700, fontSize: 15 }}>Recursos</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recursos.map((r) => (
                <div key={r.id} style={{ background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <RecursoIcon tipo={r.tipo} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>{r.nombre}</div>
                    <div style={{ color: MUTED, fontSize: 11, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.link}</div>
                  </div>
                  <button onClick={() => setModalEditRecurso(r)} style={{ background: "none", border: `0.5px solid ${BORDER}`, borderRadius: 8, padding: "5px 10px", color: MUTED, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
                    Editar
                  </button>
                </div>
              ))}
              <button onClick={() => setModalNewRecurso(true)} style={{ background: "none", border: `0.5px dashed ${BORDER}`, borderRadius: 12, padding: "12px", color: VIOLET, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Agregar recurso
              </button>
            </div>
          </div>

          {/* Recordatorios de esta materia */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ color: TEXT, fontWeight: 700, fontSize: 15 }}>Recordatorios</div>
              <button onClick={() => setModalNewRec(true)} style={{ background: "none", border: "none", color: VIOLET, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Agregar</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recordatorios.map((r) => (
                <div key={r.id} style={{ background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor[r.tipo] ?? MUTED, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>{r.titulo}</div>
                    <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>
                      <span style={{ background: `${dotColor[r.tipo] ?? MUTED}20`, color: dotColor[r.tipo] ?? MUTED, borderRadius: 20, padding: "1px 7px", fontSize: 10, marginRight: 5 }}>{tipoLabel[r.tipo] ?? r.tipo}</span>
                      {r.fecha} · {r.hora}
                    </div>
                  </div>
                  <button onClick={() => setModalEditRec(r)} style={{ background: "none", border: `0.5px solid ${BORDER}`, borderRadius: 8, padding: "5px 10px", color: MUTED, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
                    Editar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScreenWrap>

      {modalEditNota && <ModalMateria initial={materia} onClose={() => setModalEditNota(false)} onSave={() => {}} />}
      {modalNewRecurso && <ModalRecurso onClose={() => setModalNewRecurso(false)} onSave={(d) => { setRecursos((prev) => [...prev, { id: Date.now(), nombre: d.nombre ?? "", link: d.link ?? "", tipo: d.tipo ?? "meet" }]); }} />}
      {modalEditRecurso && <ModalRecurso initial={modalEditRecurso} onClose={() => setModalEditRecurso(null)} onSave={(d) => { setRecursos((prev) => prev.map((r) => r.id === modalEditRecurso.id ? { ...r, ...d } : r)); }} />}
      {modalNewRec && <ModalRecordatorio onClose={() => setModalNewRec(false)} onSave={(d) => { setRecordatorios((prev) => [...prev, { id: Date.now(), titulo: d.titulo ?? "", fecha: d.fecha ?? "", hora: d.hora ?? "", tipo: d.tipo ?? "otro" }]); }} />}
      {modalEditRec && <ModalRecordatorio initial={modalEditRec} onClose={() => setModalEditRec(null)} onSave={(d) => { setRecordatorios((prev) => prev.map((r) => r.id === modalEditRec.id ? { ...r, ...d } : r)); }} />}
    </>
  );
}

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
  const [screen, setScreen] = useState<Screen>("login");
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
        return materiaIdSeleccionada != null ? (
          <MateriaDetalleFeatureScreen materiaId={materiaIdSeleccionada} onVolver={() => setScreen("materias")} />
        ) : (
          <DetalleScreen onGo={setScreen} />
        );
      case "recordatorios": return <RecordatoriosFeatureScreen />;
      case "convenios": return <ConveniosFeatureScreen />;
      case "perfil": return <PerfilFeatureScreen onCerrarSesion={() => setScreen("login")} />;
    }
  };

  return (
    <div style={{ background: BG, minHeight: "100%", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 430, minHeight: "100vh", background: BG, position: "relative", display: "flex", flexDirection: "column", color: TEXT }}>
        {renderScreen()}
        {showNav && activeTab && <BottomNav active={activeTab} onNav={handleNav} />}
        <Toaster />
      </div>
    </div>
  );
}
