import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
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
        carrera_destino: "Licenciatura en Sistemas",
        descripcion: "Convenio de articulación para egresados.",
        carreras: [{ id: 1, nombre: "Tecnicatura Superior en Desarrollo de Software" }],
        todas_las_carreras: false,
        logo: "U",
        tipo: "universidad" as const,
        link_info: "https://example.com/info",
      },
      {
        id: 3,
        nombre: "Universidad de Palermo",
        carrera_destino: "Licenciatura en Tecnología de la Información",
        descripcion: "Abierto a todos los egresados.",
        carreras: [],
        todas_las_carreras: true,
        logo: "U",
        tipo: "universidad" as const,
        link_info: "https://example.com/palermo",
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
        descripcion: "Curso intensivo de backend.",
        carreras: [],
        todas_las_carreras: false,
        logo: "P",
        tipo: "talentotech" as const,
        categoria: "Backend",
        duracion: "3 meses",
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
    expect(screen.getByText("Licenciatura en Sistemas")).toBeInTheDocument();
    expect(
      screen.getByText("Tecnicatura Superior en Desarrollo de Software"),
    ).toBeInTheDocument();
    expect(screen.getByText("Todas las carreras")).toBeInTheDocument();

    // Switch to Talento Tech tab
    const talentoTab = screen.getByRole("button", { name: "Talento Tech" });
    await userEvent.click(talentoTab);

    await waitFor(() => {
      expect(screen.getByText("Python Avanzado")).toBeInTheDocument();
      expect(screen.getByText("Backend · 3 meses")).toBeInTheDocument();
    });
  });

  it("should open the detail modal and then the external site", async () => {
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

    // El botón tiene aria-label con el nombre del convenio (accesibilidad),
    // así que el nombre accesible ya no es el texto visible "Más info" a secas.
    const masInfoButton = screen.getByRole("button", {
      name: /Más información sobre Universidad Tecnológica/i,
    });
    await userEvent.click(masInfoButton);

    const dialog = screen.getByRole("dialog", { name: "Detalle del convenio" });
    expect(within(dialog).getByText("Convenio de articulación para egresados.")).toBeInTheDocument();
    expect(window.open).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole("button", { name: "Ir al sitio" }));

    expect(window.open).toHaveBeenCalledWith("https://example.com/info", "_blank", "noopener,noreferrer");
  });
});
