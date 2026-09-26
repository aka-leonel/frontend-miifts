import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Paginador from "./Paginador";

describe("Paginador", () => {
  it("should return null if totalPages <= 1", () => {
    const { container } = render(
      <Paginador page={1} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("should render pagination info and buttons correctly", () => {
    render(<Paginador page={2} totalPages={5} onPageChange={vi.fn()} />);

    expect(screen.getByText("Página 2 / 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).not.toBeDisabled();
  });

  it("should disable 'Anterior' on first page", () => {
    render(<Paginador page={1} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).not.toBeDisabled();
  });

  it("should disable 'Siguiente' on last page", () => {
    render(<Paginador page={3} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Anterior" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  });

  it("should call onPageChange with correct page numbers", async () => {
    const handlePageChange = vi.fn();
    render(<Paginador page={2} totalPages={4} onPageChange={handlePageChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Anterior" }));
    expect(handlePageChange).toHaveBeenCalledWith(1);

    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });
});
