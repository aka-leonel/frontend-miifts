import Modal from "../../components/Modal";

// TODO(sprint 8): reemplazar [COLEGIO A CONFIRMAR] cuando se defina el colegio
// profesional aplicable (COPITEC u otro; plan B: Código de Ética de ACM).
const SECCIONES = [
  {
    titulo: "Uso de la app",
    texto:
      "miIFTS es una herramienta personal para organizar tu cursada. No reemplaza los registros oficiales del instituto: ante cualquier diferencia, vale lo que figure en la institución.",
  },
  {
    titulo: "Confidencialidad de tus datos",
    texto:
      "Tus datos académicos (materias, notas, estados) son tuyos. No los compartimos con terceros ni los usamos para fines distintos a los de la app.",
  },
  {
    titulo: "Tus derechos",
    texto:
      "Conforme a la Ley 25.326 de Protección de Datos Personales, podés acceder, corregir o pedir la eliminación de tu información en cualquier momento.",
  },
  {
    titulo: "Ética profesional",
    texto:
      "El desarrollo de esta app sigue los principios del Código de Ética de [COLEGIO A CONFIRMAR]: honestidad en el manejo de la información, responsabilidad profesional y respeto por la privacidad de las personas usuarias.",
  },
];

export default function TerminosModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="Términos y ética profesional"
      onClose={onClose}
      className="m-auto w-full max-w-md p-5"
      overlayClassName=""
      headerExtra={
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-muted transition hover:text-text"
        >
          <span aria-hidden="true">×</span>
        </button>
      }
    >
      <div className="max-h-[60vh] space-y-4 overflow-y-auto text-sm">
        {SECCIONES.map((s) => (
          <section key={s.titulo}>
            <h3 className="mb-1 font-semibold text-text">{s.titulo}</h3>
            <p className="leading-relaxed text-muted">{s.texto}</p>
          </section>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 w-full rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-on-primary"
      >
        Entendido
      </button>
    </Modal>
  );
}
