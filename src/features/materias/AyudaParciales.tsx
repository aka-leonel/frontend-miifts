import { useState } from "react";

/**
 * Signo de pregunta clickeable que abre una card: explica qué cargar cuando
 * la materia tiene un solo parcial.
 */
export default function AyudaParciales() {
  const [abierta, setAbierta] = useState(false);

  return (
    <span className="inline-block">
      <button
        type="button"
        aria-label="¿Tu materia tiene un solo parcial?"
        aria-expanded={abierta}
        onClick={() => setAbierta((v) => !v)}
        className={[
          "flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold transition",
          abierta ? "border-violet bg-violet text-white" : "border-border text-muted hover:text-text",
        ].join(" ")}
      >
        ?
      </button>
      {abierta ? (
        <div
          role="note"
          className="mt-2 rounded-xl border border-violet/40 bg-violet/10 p-3 text-xs leading-relaxed text-text"
        >
          <div className="mb-1 font-semibold">¿Tu materia tiene un solo parcial?</div>
          Cargá una sola nota (Nota 1) y dejá la Nota 2 vacía. La nota se computa cuando pasás la
          materia a <span className="font-semibold">“no estoy cursando”</span>.
        </div>
      ) : null}
    </span>
  );
}
