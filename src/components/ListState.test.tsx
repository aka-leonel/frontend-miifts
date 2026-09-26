import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListState } from "./ListState";

describe("ListState", () => {
  it("should render skeleton when loading is true", () => {
    render(
      <ListState loading={true} error={null} items={[]}>
        <div>Contenido</div>
      </ListState>
    );

    // Skeleton has animate-pulse divs
    const pulseElements = document.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
    expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
  });

  it("should render ErrorState when error is present", async () => {
    const handleRetry = vi.fn();
    render(
      <ListState loading={false} error={new Error("Fail")} onRetry={handleRetry} items={[]}>
        <div>Contenido</div>
      </ListState>
    );

    expect(screen.getByText("No se pudo cargar")).toBeInTheDocument();
    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    expect(retryButton).toBeInTheDocument();

    await userEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("should render EmptyState when items array is empty", () => {
    render(
      <ListState
        loading={false}
        error={null}
        items={[]}
        emptyTitle="Sin resultados"
        emptyDescription="Pruebe con otro filtro."
      >
        <div>Contenido</div>
      </ListState>
    );

    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    expect(screen.getByText("Pruebe con otro filtro.")).toBeInTheDocument();
    expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
  });

  it("should render children when items are present", () => {
    render(
      <ListState loading={false} error={null} items={[1, 2, 3]}>
        <div data-testid="child-content">Contenido Principal</div>
      </ListState>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Contenido Principal")).toBeInTheDocument();
  });
});
