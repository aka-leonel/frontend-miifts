import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConveniosScreen from "./ConveniosScreen";
import * as hooks from "./hooks";

vi.mock("./hooks", () => ({
  useConvenios: vi.fn(),
  useTalentoTech: vi.fn(),
}));

describe("ConveniosScreen", () => {
  const mockConvenioData = {
    items: [
      {
        id: 1,
        nombre: "Universidad Tecnológica",
        requisitos: "Promedio > 7",
        logo: "U",
        tipo: "universidad" as const,
        link_info: "https://example.com/info",
      },
    ],
    page: 1,
    totalPages: 1,
  };

  const mockTalentoData = {
    items: [
      {
        id: 2,
        nombre: "Python Avanzado",
        requisitos: "Backend · 3 meses",
        logo: "P",
        tipo: "talentotech" as const,
        link_inscripcion: "https://example.com/inscripcion",
      },
    ],
    page: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  it("should render convenios list and switch tabs correctly", async () => {
    vi.mocked(hooks.useConvenios).mockReturnValue({
      data: mockConvenioData,
      loading: false,
      error: null,
    });
    vi.mocked(hooks.useTalentoTech).mockReturnValue({
      data: mockTalentoData,
      loading: false,
      error: null,
    });

    render(<ConveniosScreen />);

    expect(screen.getByText("Convenios")).toBeInTheDocument();
    expect(screen.getByText("Universidad Tecnológica")).toBeInTheDocument();
    expect(screen.getByText("Promedio > 7")).toBeInTheDocument();

    // Switch to Talento Tech tab
    const talentoTab = screen.getByRole("button", { name: "Talento Tech" });
    await userEvent.click(talentoTab);

    await waitFor(() => {
      expect(screen.getByText("Python Avanzado")).toBeInTheDocument();
      expect(screen.getByText("Backend · 3 meses")).toBeInTheDocument();
    });
  });

  it("should open external link on 'Más info' click", async () => {
    vi.mocked(hooks.useConvenios).mockReturnValue({
      data: mockConvenioData,
      loading: false,
      error: null,
    });
    vi.mocked(hooks.useTalentoTech).mockReturnValue({
      data: { items: [], page: 1, totalPages: 1 },
      loading: false,
      error: null,
    });

    render(<ConveniosScreen />);

    const masInfoButton = screen.getByRole("button", { name: "Más info" });
    await userEvent.click(masInfoButton);

    expect(window.open).toHaveBeenCalledWith("https://example.com/info", "_blank", "noopener,noreferrer");
  });
});
