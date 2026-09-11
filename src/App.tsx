import { useState } from "react";
import { FormModal, ListState, Toaster, type FormSpec } from "./components";
import { ConveniosScreen as ConveniosFeatureScreen } from "./features/convenios";
import { RecordatoriosScreen as RecordatoriosFeatureScreen } from "./features/recordatorios";
import { PerfilScreen as PerfilFeatureScreen } from "./features/perfil";
import { useRecordatorios } from "./features/recordatorios";
import { useMisMaterias } from "./features/materias";
import { useAuthMe } from "./features/perfil";
import type { EstadoCursada } from "./api/types";

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

interface DemoItem {
  id: number;
  title: string;
  category: string;
  active: boolean;
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
  const [tipo, setTipo] = useState(initial?.tipo ?? "meet");

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

// ─── FAB ──────────────────────────────────────────────────────────────────────
function FAB({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ position: "fixed", bottom: 90, right: "calc(50% - 210px + 20px)", width: 52, height: 52, borderRadius: 16, background: VIOLET, border: "none", color: "#fff", fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(140,125,255,0.4)", zIndex: 99 }}>
      +
    </button>
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

const demoSpec: FormSpec<DemoItem> = {
  title: (item) => (item?.id ? "Editar elemento" : "Agregar elemento"),
  fields: [
    { name: "title", label: "Título", type: "text", placeholder: "Ej: Reunión de práctica" },
    {
      name: "category",
      label: "Categoría",
      type: "select",
      options: [
        { value: "infra", label: "Infra" },
        { value: "ux", label: "UX" },
        { value: "convenios", label: "Convenios" },
      ],
    },
    { name: "active", label: "Activo", type: "switch" },
  ],
  submit: {
    create: async (values) => values,
    update: async (_id, values) => values,
  },
};

function SharedInfraDemo() {
  const [items, setItems] = useState<DemoItem[]>([
    { id: 1, title: "Modal reutilizable", category: "infra", active: true },
    { id: 2, title: "Toaster global", category: "ux", active: false },
  ]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<DemoItem | undefined>();

  const handleCreate = (values: DemoItem) => {
    setItems((current) => [{ ...values, id: Date.now() }, ...current]);
  };

  const handleUpdate = (id: string | number, values: DemoItem) => {
    setItems((current) => current.map((item) => (item.id === Number(id) ? { ...item, ...values } : item)));
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.1em] text-violet">Infra compartida</div>
          <div className="mt-1 text-lg font-bold text-text">FormModal + ListState + Toaster</div>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelected(undefined);
            setOpen(true);
          }}
          className="rounded-xl bg-violet px-3 py-2 text-sm font-semibold text-white"
        >
          Nuevo
        </button>
      </div>

      <ListState loading={false} error={null} items={items} emptyTitle="No hay elementos" emptyDescription="Agregá un registro para ver el estado vacío.">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-[#111218] p-3">
              <div>
                <div className="text-sm font-semibold text-text">{item.title}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.08em] text-muted">{item.category}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={item.active ? "text-xs font-semibold text-lime" : "text-xs font-semibold text-muted"}>
                  {item.active ? "Activo" : "Inactivo"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(item);
                    setOpen(true);
                  }}
                  className="rounded-lg border border-border bg-transparent px-2 py-1 text-xs text-muted"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </ListState>

      <FormModal
        open={open}
        item={selected}
        spec={{
          ...demoSpec,
          submit: {
            create: async (values) => {
              handleCreate(values);
            },
            update: async (id, values) => {
              handleUpdate(id, values);
            },
          },
        }}
        initialValues={
          selected ?? {
            id: 0,
            title: "",
            category: "infra",
            active: true,
          }
        }
        onClose={() => {
          setOpen(false);
          setSelected(undefined);
        }}
      />
    </div>
  );
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
function ByteCard({ aprobadas, total }: { aprobadas: number; total: number }) {
  const pct = total > 0 ? Math.round((aprobadas / total) * 100) : 0;
  return (
    <div style={{ background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ flexShrink: 0 }}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <ellipse cx="28" cy="16" rx="14" ry="4" fill={LIME} />
          <rect x="14" y="12" width="28" height="6" rx="2" fill={LIME} />
          <rect x="22" y="16" width="18" height="4" rx="2" fill="#A8D420" />
          <rect x="16" y="18" width="24" height="20" rx="6" fill="#2A2B36" stroke={BORDER} strokeWidth="0.5" />
          <circle cx="23" cy="27" r="3.5" fill={VIOLET} />
          <circle cx="33" cy="27" r="3.5" fill={VIOLET} />
          <circle cx="24" cy="26" r="1.2" fill="white" />
          <circle cx="34" cy="26" r="1.2" fill="white" />
          <path d="M23 33 Q28 36 33 33" stroke={LIME} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <rect x="20" y="40" width="16" height="10" rx="4" fill="#2A2B36" stroke={BORDER} strokeWidth="0.5" />
          <line x1="28" y1="18" x2="28" y2="12" stroke={LIME} strokeWidth="1.5" />
          <circle cx="28" cy="11" r="2" fill={LIME} />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: TEXT, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>¡Hola! Soy <span style={{ color: LIME }}>Byte</span> 👾</div>
        <div style={{ color: MUTED, fontSize: 12, marginBottom: 10 }}>{aprobadas} de {total} materias aprobadas</div>
        <div style={{ background: "#2A2B36", borderRadius: 20, height: 6, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${VIOLET} 0%, ${LIME} 100%)`, borderRadius: 20 }} />
        </div>
        <div style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>{pct}% del plan completado</div>
      </div>
    </div>
  );
}

// ─── Screen 4: Inicio ─────────────────────────────────────────────────────────
const ESTADO_A_BADGE: Record<EstadoCursada, BadgeStatus> = {
  cursando: "En curso",
  aprobada: "Aprobada",
  pendiente: "Pendiente",
};

function InicioScreen({ onGo }: { onGo: (s: Screen) => void }) {
  const [query, setQuery] = useState("");
  const dotColor: Record<string, string> = { parcial: VIOLET, tp: LIME, final: GREEN, otro: "#C084FC" };

  const me = useAuthMe();
  const misMaterias = useMisMaterias(1);
  const proximos = useRecordatorios({ per_page: 3 });

  const cursadas = misMaterias.data?.items ?? [];
  const aprobadas = cursadas.filter((c) => c.estado === "aprobada").length;
  const totalPlan = misMaterias.data?.total ?? 0;

  return (
    <ScreenWrap padBottom>
      <div style={{ padding: "52px 24px 0" }}>
        <div style={{ marginBottom: 20 }}>
          <SharedInfraDemo />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ color: MUTED, fontSize: 13 }}>Bienvenida de vuelta</div>
            <div style={{ color: TEXT, fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>
              Hola, {me.data?.nombre?.split(" ")[0] ?? "…"} 👋
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${VIOLET} 0%, #6B5CE7 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 15 }}>MR</div>
        </div>

        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke={MUTED} strokeWidth="1.5" />
            <path d="M21 21l-4.35-4.35" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input placeholder="Buscar materia o recurso..." value={query} onChange={(e) => setQuery(e.target.value)}
            style={{ width: "100%", background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 10, padding: "12px 16px 12px 40px", color: TEXT, fontSize: 14, outline: "none" }} />
        </div>

        <div style={{ marginBottom: 28 }}><ByteCard aprobadas={aprobadas} total={totalPlan} /></div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ color: TEXT, fontWeight: 700, fontSize: 15 }}>Próximos</div>
            <button onClick={() => onGo("recordatorios")} style={{ background: "none", border: "none", color: VIOLET, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Ver todos</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(proximos.data?.items ?? []).length === 0 && !proximos.loading && (
              <div style={{ color: MUTED, fontSize: 13 }}>Sin recordatorios próximos.</div>
            )}
            {(proximos.data?.items ?? []).map((r) => (
              <div key={r.id} style={{ background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 14, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor[r.tipo] ?? MUTED, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: TEXT, fontSize: 13, fontWeight: 500 }}>{r.titulo}</div>
                  <div style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>
                    {new Date(r.fecha).toLocaleString("es-AR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ color: TEXT, fontWeight: 700, fontSize: 15 }}>Mis materias</div>
            <button onClick={() => onGo("materias")} style={{ background: "none", border: "none", color: VIOLET, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Ver todas</button>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
            {cursadas.length === 0 && !misMaterias.loading && (
              <div style={{ color: MUTED, fontSize: 13 }}>Todavía no cargaste materias.</div>
            )}
            {cursadas.map((c) => (
              <div key={c.id} onClick={() => onGo("materias")} style={{ background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 14, padding: "14px 16px", minWidth: 150, maxWidth: 150, cursor: "pointer", flexShrink: 0 }}>
                <Badge status={ESTADO_A_BADGE[c.estado]} />
                <div style={{ color: TEXT, fontSize: 13, fontWeight: 600, marginTop: 10, lineHeight: 1.3 }}>
                  {c.materia?.nombre ?? `Materia #${c.materia_id}`}
                </div>
                {c.nota_final != null && <div style={{ color: MUTED, fontSize: 12, marginTop: 6 }}>Nota: {c.nota_final}</div>}
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
  const [showModal, setShowModal] = useState(false);

  const filtered = active === "Todas" ? materiasInit : materiasInit.filter((m) => m.estado === active);

  return (
    <>
      <ScreenWrap padBottom>
        <div style={{ padding: "52px 24px 0" }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ color: TEXT, fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>Mis Materias</div>
            <div style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>Desarrollo de Software</div>
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 22, paddingBottom: 2 }}>
            {chips.map((c) => (
              <button key={c} onClick={() => setActive(c)} style={{ flexShrink: 0, background: active === c ? VIOLET : CARD, border: `0.5px solid ${active === c ? VIOLET : BORDER}`, borderRadius: 20, padding: "7px 16px", color: active === c ? "#fff" : MUTED, fontSize: 13, fontWeight: active === c ? 600 : 400, cursor: "pointer", transition: "all 0.2s" }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((m) => (
              <div key={m.id} onClick={() => onGo("detalle")} style={{ background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: TEXT, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{m.nombre}</div>
                  <Badge status={m.estado} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {m.nota && <div style={{ background: "rgba(140,125,255,0.12)", borderRadius: 10, padding: "4px 10px", color: VIOLET, fontSize: 13, fontWeight: 700 }}>{m.nota}</div>}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScreenWrap>
      <FAB onClick={() => setShowModal(true)} />
      {showModal && <ModalMateria onClose={() => setShowModal(false)} onSave={() => {}} />}
    </>
  );
}

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

// ─── Screens 7–9: Recordatorios / Convenios / Mi Perfil ───────────────────────
// Reemplazados por las pantallas reales (Integrante 4, ver imports arriba):
// RecordatoriosFeatureScreen, ConveniosFeatureScreen, PerfilFeatureScreen.

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

  const handleNav = (tab: NavTab) => setScreen(navToScreen[tab]);
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
