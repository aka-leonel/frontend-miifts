import { useEffect, useId, useRef, type ReactNode } from "react";

// Pila de modales abiertos: cuando hay uno encima de otro (ej. Recursar sobre
// el formulario de cursada) solo el de arriba reacciona a Escape / Tab.
const pila: symbol[] = [];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Clases del panel (ancho, padding…). */
  className?: string;
  /** Clases del overlay (alineación). */
  overlayClassName?: string;
  /** Nivel del heading del título. */
  headingLevel?: "h2" | "h3";
  /** Contenido a la derecha del título (ej. botón de cerrar). */
  headerExtra?: ReactNode;
};

/**
 * Diálogo accesible: role=dialog + aria-modal, nombre desde el título,
 * Escape cierra, Tab queda atrapado dentro, el foco entra al abrir y vuelve
 * al elemento que lo abrió al cerrar.
 */
export default function Modal({
  title,
  onClose,
  children,
  className = "",
  overlayClassName = "items-center justify-center",
  headingLevel = "h2",
  headerExtra,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const Heading = headingLevel;

  useEffect(() => {
    const token = Symbol("modal");
    pila.push(token);
    const previo = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    // Foco inicial: primer campo del formulario; si no hay, el panel mismo.
    const primero = panel?.querySelector<HTMLElement>("input, select, textarea") ?? panel;
    primero?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (pila[pila.length - 1] !== token) return;
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const activo = document.activeElement;
      if (event.shiftKey && (activo === first || activo === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activo === last) {
        event.preventDefault();
        first.focus();
      } else if (!panel.contains(activo)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const i = pila.indexOf(token);
      if (i >= 0) pila.splice(i, 1);
      if (previo && document.contains(previo)) previo.focus();
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-[200] flex overflow-y-auto bg-black/70 p-4 pb-8 ${overlayClassName}`} onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`rounded-2xl border border-border bg-card shadow-2xl outline-none ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <Heading id={titleId} className="text-lg font-bold text-text">
            {title}
          </Heading>
          {headerExtra}
        </div>
        {children}
      </div>
    </div>
  );
}
