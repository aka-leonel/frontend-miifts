import { useState } from "react";
import type { Cursada, Materia } from "../../api/types";
import { ConfirmDialog, FormModal } from "../../components";
import AyudaParciales from "./AyudaParciales";
import { materiaUsuarioInitial, materiaUsuarioSpec, type ModoCursada } from "./materiaUsuarioSpec";

export type AccionCursada = "creada" | "actualizada" | "recursada";

type Props = {
  open: boolean;
  /** Cursada que se edita; `null` = agregar una materia nueva. */
  cursada: Cursada | null;
  materias: Materia[];
  /**
   * Qué campos muestra al EDITAR: "estado" (desde la lista de materias: solo
   * MATERIA y ESTÁS CURSANDO) o "notas" (desde el detalle de la materia: suma
   * NOTA 1, NOTA 2 y FINAL). Al agregar siempre es solo MATERIA y ESTÁS CURSANDO.
   */
  edicion?: "estado" | "notas";
  /** Si viene, al agregar la materia queda fija (el detalle de UNA materia). */
  materiaIdFija?: number;
  onClose: () => void;
  onSaved: (accion: AccionCursada) => void;
};

/**
 * Modal de alta/edición de cursada + el flujo de **Recursar**.
 *
 * Recursar: en una materia desaprobada aparece el botón "Recursar" al editar.
 * Pide confirmación ("se borran las notas viejas y pasa a cursando"); al
 * confirmar el botón desaparece y el modal pasa al de "estás cursando", que al
 * guardar manda cursando y las notas en null (PATCH /materias/cursada/{id}).
 */
export default function CursadaFormModal({
  open,
  cursada,
  materias,
  edicion = "estado",
  materiaIdFija,
  onClose,
  onSaved,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const [recursando, setRecursando] = useState(false);

  const modo: ModoCursada = !cursada ? "alta" : recursando ? "recursar" : edicion;
  const puedeRecursar = cursada?.estado === "desaprobada" && !recursando;

  const opciones =
    !cursada && materiaIdFija != null ? materias.filter((m) => m.id === materiaIdFija) : materias;

  const spec = materiaUsuarioSpec({ materias: opciones, cursadaActual: cursada, modo });

  const initialValues =
    modo === "recursar"
      ? {
          ...materiaUsuarioInitial(cursada ?? undefined),
          cursando: true,
          nota_parcial_1: "",
          nota_parcial_2: "",
          examen_final: "",
        }
      : materiaUsuarioInitial(cursada ?? (materiaIdFija != null ? { materia_id: materiaIdFija } : undefined));

  const cerrar = () => {
    setConfirmando(false);
    setRecursando(false);
    onClose();
  };

  return (
    <>
      {/* key={modo}: al pasar a "recursar" el form se vuelve a montar con los valores de recursar. */}
      <FormModal
        key={modo}
        open={open}
        item={cursada ?? undefined}
        spec={spec}
        initialValues={initialValues}
        onClose={cerrar}
        onSuccess={() => onSaved(!cursada ? "creada" : recursando ? "recursada" : "actualizada")}
        extra={
          modo === "notas" || puedeRecursar ? (
            <div className="flex flex-col gap-3">
              {/* La ayuda vive acá (junto a las notas que se están cargando) y no
                  en el detalle de la materia, que ahora solo muestra el estado. */}
              {modo === "notas" ? <AyudaParciales /> : null}
              {puedeRecursar ? (
                <button
                  type="button"
                  onClick={() => setConfirmando(true)}
                  className="w-full rounded-xl border border-warning/50 bg-warning/10 px-4 py-2.5 text-sm font-semibold text-warning transition hover:bg-warning/20"
                >
                  Recursar
                </button>
              ) : null}
            </div>
          ) : null
        }
      />

      <ConfirmDialog
        open={confirmando}
        title="Recursar materia"
        description="¿Seguro que vas a recursar? Se borran las notas viejas y pasa a cursando"
        confirmText="Recursar"
        onConfirm={() => {
          setConfirmando(false);
          setRecursando(true);
        }}
        onClose={() => setConfirmando(false)}
      />
    </>
  );
}
