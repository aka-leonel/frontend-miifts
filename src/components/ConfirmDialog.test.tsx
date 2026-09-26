import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("should not render when open is false", () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="¿Estás seguro?"
        description="Esta acción no se puede deshacer."
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("should render correctly when open is true", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Eliminar elemento"
        description="¿Querés borrar este registro?"
        confirmText="Sí, borrar"
        cancelText="No, cancelar"
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Eliminar elemento")).toBeInTheDocument();
    expect(screen.getByText("¿Querés borrar este registro?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sí, borrar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No, cancelar" })).toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title="Confirmación"
        description="Descripción"
        confirmText="Confirmar"
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when cancel button is clicked", async () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        title="Confirmación"
        description="Descripción"
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
