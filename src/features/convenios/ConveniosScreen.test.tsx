import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConveniosScreen from "./ConveniosScreen";
import * as hooks from "./hooks";

vi.mock("./hooks", () => ({
  useConvenios: vi.fn(),
}));

// La pestaña de TalentoTech tiene su propia suite (TalentoTechSection.test.tsx):
// acá solo se verifica que Convenios la monte al cambiar de tab.
vi.mock("../talentotech", () => ({
  TalentoTechSection: () => <div>Talento Tech section</div>,
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
        link_info: "https://example.com/palermo",
      },
    ],
    page: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  it("should render convenios list and switch to the TalentoTech tab", async () => {
    vi.mocked(hooks.useConvenios).mockReturnValue({
      data: mockConvenioData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<ConveniosScreen />);

    expect(screen.getByText("Convenios")).toBeInTheDocument();
    expect(screen.getByText("Universidad Tecnológica")).toBeInTheDocument();
    expect(screen.getByText("Licenciatura en Sistemas")).toBeInTheDocument();
    expect(
      screen.getByText("Tecnicatura Superior en Desarrollo de Software"),
    ).toBeInTheDocument();
    expect(screen.getByText("Todas las carreras")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Talento Tech" }));

    expect(screen.getByText("Talento Tech section")).toBeInTheDocument();
    expect(screen.queryByText("Universidad Tecnológica")).not.toBeInTheDocument();
  });

  it("should open the detail modal and then the external site", async () => {
    vi.mocked(hooks.useConvenios).mockReturnValue({
      data: mockConvenioData,
      loading: false,
      error: null,
      refetch: vi.fn(),
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
