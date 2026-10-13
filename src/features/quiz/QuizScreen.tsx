import { useState } from "react";
import { ApiError } from "../../lib/apiClient";
import { useGenerarQuiz } from "./hooks";
import type { Quiz } from "../../api/types";

const MAX_MB = 10;

export default function QuizScreen() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cantidad, setCantidad] = useState(5);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [corregido, setCorregido] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generar = useGenerarQuiz();

  const archivoGrande = archivo != null && archivo.size > MAX_MB * 1024 * 1024;

  const handleGenerar = async () => {
    if (!archivo || archivoGrande) return;
    setError(null);
    try {
      const result = await generar.run(archivo, cantidad);
      setQuiz(result);
      setRespuestas({});
      setCorregido(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "No se pudo generar el quiz.");
    }
  };

  const reiniciar = () => {
    setQuiz(null);
    setArchivo(null);
    setRespuestas({});
    setCorregido(false);
  };

  const aciertos = quiz ? quiz.preguntas.filter((p, i) => respuestas[i] === p.correcta).length : 0;

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="mx-auto w-full max-w-lg px-4 pt-14 sm:max-w-2xl sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-[-0.04em] text-text">Quiz con IA</h1>
          <div className="mt-1 text-sm text-muted">Subí un PDF de tu material y practicá con preguntas multiple choice</div>
        </div>

        {!quiz ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-text">
              PDF (máx. {MAX_MB} MB)
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                className="text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-on-primary"
              />
            </label>
            {archivoGrande ? <div role="alert" className="text-sm text-danger">El archivo supera los {MAX_MB} MB.</div> : null}

            <label className="flex flex-col gap-2 text-sm font-medium text-text">
              Cantidad de preguntas
              <select
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text"
              >
                {[3, 5, 8, 10].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>

            {error ? <div role="alert" className="text-sm text-danger">{error}</div> : null}

            <button
              type="button"
              onClick={handleGenerar}
              disabled={!archivo || archivoGrande || generar.loading}
              className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary disabled:opacity-50"
            >
              {generar.loading ? "Generando… (puede tardar unos segundos)" : "Generar quiz"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {quiz.preguntas.map((p, i) => (
              <div key={i} role="group" aria-labelledby={`pregunta-${i}-titulo`} className="rounded-2xl border border-border bg-card p-4">
                <h2 id={`pregunta-${i}-titulo`} className="text-sm font-semibold text-text">{i + 1}. {p.enunciado}</h2>
                <div className="mt-3 flex flex-col gap-2">
                  {p.opciones.map((op, j) => {
                    const elegida = respuestas[i] === j;
                    const esCorrecta = corregido && j === p.correcta;
                    const esIncorrecta = corregido && elegida && j !== p.correcta;
                    return (
                      <label
                        key={j}
                        className={[
                          "flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm",
                          esCorrecta ? "border-lime text-text" : esIncorrecta ? "border-danger text-text" : elegida ? "border-violet text-text" : "border-border text-muted",
                        ].join(" ")}
                      >
                        <input
                          type="radio"
                          name={`pregunta-${i}`}
                          checked={elegida}
                          disabled={corregido}
                          onChange={() => setRespuestas((r) => ({ ...r, [i]: j }))}
                          className="mt-0.5"
                        />
                        <span>{op}{esCorrecta ? " ✓" : ""}</span>
                      </label>
                    );
                  })}
                </div>
                {corregido && p.explicacion ? <div className="mt-2 text-xs text-muted">{p.explicacion}</div> : null}
              </div>
            ))}

            {corregido ? (
              <div className="rounded-2xl border border-border bg-card p-4 text-center text-sm font-semibold text-text" role="status">
                Resultado: {aciertos} de {quiz.preguntas.length}
              </div>
            ) : null}

            <div className="flex gap-3">
              {!corregido ? (
                <button
                  type="button"
                  onClick={() => setCorregido(true)}
                  disabled={Object.keys(respuestas).length < quiz.preguntas.length}
                  className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-on-primary disabled:opacity-50"
                >
                  Corregir
                </button>
              ) : null}
              <button
                type="button"
                onClick={reiniciar}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-text"
              >
                Nuevo quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
