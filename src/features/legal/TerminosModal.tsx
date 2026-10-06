import Modal from "../../components/Modal";

// Colegio aplicable en CABA: COPITEC (Decreto-Ley 6070/58, Ley 14.467), que
// matricula técnicos en computación/informática. El CPCI es solo de Provincia.
const SECCIONES = [
  {
    titulo: "Uso de la app",
    // Cód. Ética 2.1.1.9 y 2.3.1.1: no prometer lo que no se puede cumplir.
    texto:
      "miIFTS es una herramienta personal para organizar tu cursada. No reemplaza los registros oficiales del instituto: ante cualquier diferencia, vale lo que figure en la institución.",
  },
  {
    titulo: "Confidencialidad de tus datos",
    // Cód. Ética 2.3.1.4: secreto y reserva salvo obligación legal.
    texto:
      "Tus datos académicos (materias, notas, estados) son tuyos. Los mantenemos en reserva: no los compartimos con terceros ni los usamos para fines distintos a los de la app, salvo obligación legal.",
  },
  {
    titulo: "Tus derechos",
    // Cód. Ética 1.2: respetar las disposiciones legales que inciden en la profesión.
    texto:
      "Conforme a la Ley 25.326 de Protección de Datos Personales, podés acceder, corregir o pedir la eliminación de tu información en cualquier momento.",
  },
  {
    titulo: "Errores y correcciones",
    // Cód. Ética 2.3.1.5: advertir errores y subsanar los propios.
    texto:
      "Si detectamos un error en la app que afecte tu información, te lo vamos a informar y lo vamos a corregir. Si vos encontrás uno, avisanos.",
  },
  {
    titulo: "Ética profesional",
    texto:
      "El desarrollo de esta app sigue el Código de Ética Profesional (Decreto 1099/84) que aplica el COPITEC, el consejo profesional de computación e informática de la Ciudad de Buenos Aires: respetar la buena técnica, actuar con diligencia y probidad, y guardar reserva sobre la información de las personas usuarias.",
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
