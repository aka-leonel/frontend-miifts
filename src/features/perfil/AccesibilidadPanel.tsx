import { useId } from "react";
import {
  guardarPreferencias,
  restablecerPreferencias,
  usePreferencias,
  type Fuente,
  type Tema,
} from "../../lib/preferencias";

const TEMAS: { value: Tema; label: string }[] = [
  { value: "sistema", label: "Sistema" },
  { value: "claro", label: "Claro" },
  { value: "oscuro", label: "Oscuro" },
];

const FUENTES: { value: Fuente; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "grande", label: "Grande" },
  { value: "muy-grande", label: "Muy grande" },
];

/** Selector de una opción (radios nativos: se navega con las flechas del teclado). */
function Opciones<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-semibold text-text">{legend}</legend>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => (
          <label key={o.value} className="relative block">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-border bg-bg px-2 py-2 text-center text-sm font-medium text-muted transition peer-checked:border-primary peer-checked:bg-primary peer-checked:font-semibold peer-checked:text-on-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Interruptor({
  titulo,
  descripcion,
  activo,
  onChange,
}: {
  titulo: string;
  descripcion: string;
  activo: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div id={`${id}-t`} className="text-sm font-semibold text-text">
          {titulo}
        </div>
        <div id={`${id}-d`} className="mt-0.5 text-xs text-muted">
          {descripcion}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        aria-labelledby={`${id}-t`}
        aria-describedby={`${id}-d`}
        onClick={() => onChange(!activo)}
        className={[
          "relative h-7 w-12 flex-shrink-0 rounded-full border transition",
          activo ? "border-primary bg-primary" : "border-border bg-surface2",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full transition-all",
            activo ? "left-6 bg-on-primary" : "left-1 bg-muted",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

/** Perfil → Accesibilidad: tema, tamaño de texto, contraste, daltonismo y animaciones. */
export default function AccesibilidadPanel() {
  const prefs = usePreferencias();

  return (
    <section aria-labelledby="accesibilidad-titulo" className="mb-6 rounded-2xl border border-border bg-card p-4">
      <h2 id="accesibilidad-titulo" className="text-base font-bold text-text">
        Accesibilidad
      </h2>
      <p className="mb-4 mt-1 text-xs text-muted">Se guarda en este dispositivo y se aplica al instante.</p>

      <div className="flex flex-col gap-5">
        <Opciones legend="Tema" name="pref-tema" options={TEMAS} value={prefs.tema} onChange={(tema) => guardarPreferencias({ tema })} />
        <Opciones
          legend="Tamaño del texto"
          name="pref-fuente"
          options={FUENTES}
          value={prefs.fuente}
          onChange={(fuente) => guardarPreferencias({ fuente })}
        />
        <Interruptor
          titulo="Alto contraste"
          descripcion="Texto y bordes más marcados."
          activo={prefs.contraste}
          onChange={(contraste) => guardarPreferencias({ contraste })}
        />
        <Interruptor
          titulo="Modo daltonismo"
          descripcion="Reemplaza rojo y verde por azul, naranja y amarillo."
          activo={prefs.daltonismo}
          onChange={(daltonismo) => guardarPreferencias({ daltonismo })}
        />
        <Interruptor
          titulo="Reducir animaciones"
          descripcion="Quita transiciones y movimientos."
          activo={prefs.reducirAnimaciones}
          onChange={(reducirAnimaciones) => guardarPreferencias({ reducirAnimaciones })}
        />
        <button
          type="button"
          onClick={restablecerPreferencias}
          className="min-h-11 rounded-xl border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted transition hover:text-text"
        >
          Restablecer valores por defecto
        </button>
      </div>
    </section>
  );
}
