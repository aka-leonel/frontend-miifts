import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TalentoTechSection from "./TalentoTechSection";
import * as hooks from "./hooks";

vi.mock("./hooks", () => ({
  useTalentoTech: vi.fn(),
}));

vi.mock("../../auth/AuthContext", () => ({
  useAuth: () => ({ usuario: { carrera_id: 1 } }),
}));

const curso = (overrides: Record<string, unknown>) => ({
  id: 1,
  institucion: "Agencia de Habilidades para el Futuro",
  nombre_curso: "Tecnologías Emergentes",
  categoria: "IT",
  descripcion: "Curso introductorio a las tecnologías emergentes.",
  duracion: "30hs",
  modalidad_cursada: "Virtual Asincrónico",
  dificultad: null,
  link_inscripcion: "https://example.com/inscripcion",
  todas_las_carreras: true,
  carreras: [],
  ...overrides,
});

describe("TalentoTechSection", () => {
  const cursosData = {
    items: [
      curso({}),
      curso({
        id: 2,
        nombre_curso: "Análisis de Datos",
        categoria: "Data",
        dificultad: "Intermedia",
        todas_las_carreras: false,
        carreras: [{ id: 2, nombre: "Tecnicatura en Análisis de Sistemas" }],
      }),
    ],
    total: 2,
    page: 1,
    per_page: 20,
    total_pages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useTalentoTech).mockImplementation(() => ({
      data: cursosData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    }));
  });

  it("renderiza los cursos con su metadata y disponibilidad", () => {
    render(<TalentoTechSection />);

    expect(screen.getByText("Tecnologías Emergentes")).toBeInTheDocument();
    expect(screen.getByText("Análisis de Datos")).toBeInTheDocument();
    expect(screen.getAllByText("Virtual Asincrónico").length).toBeGreaterThan(0);
    expect(screen.getByText("Todas las carreras")).toBeInTheDocument();
    expect(screen.getByText("Tecnicatura en Análisis de Sistemas")).toBeInTheDocument();
    expect(screen.getByText("Intermedia")).toBeInTheDocument();
  });

  it("abre el detalle y muestra el link de inscripción", async () => {
    render(<TalentoTechSection />);

    await userEvent.click(
      screen.getByRole("button", { name: "Ver detalle de Tecnologías Emergentes" }),
    );

    const dialog = screen.getByRole("dialog", { name: "Detalle del curso" });
    expect(
      within(dialog).getByText("Curso introductorio a las tecnologías emergentes."),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Inscribirme" })).toHaveAttribute(
      "href",
      "https://example.com/inscripcion",
    );
  });

  it("filtra por categoría y por la carrera del usuario", async () => {
    render(<TalentoTechSection />);

    const select = screen.getByLabelText("Categoría");
    expect(within(select).getByRole("option", { name: "Data" })).toBeInTheDocument();

    await userEvent.selectOptions(select, "Data");
    expect(hooks.useTalentoTech).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, categoria: "Data", carrera_id: undefined }),
    );

    await userEvent.click(screen.getByRole("button", { name: "Solo mi carrera" }));
    expect(hooks.useTalentoTech).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, categoria: undefined, carrera_id: 1 }),
    );
  });
});
