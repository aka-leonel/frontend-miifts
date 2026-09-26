import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PerfilScreen from "./PerfilScreen";
import * as AuthContext from "../../auth/AuthContext";
import * as perfilHooks from "./hooks";
import * as catalogoHooks from "../catalogo/hooks";
import * as materiasHooks from "../materias/hooks";

vi.mock("../../auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("./hooks", () => ({
  useAuthMe: vi.fn(),
}));

vi.mock("../catalogo/hooks", () => ({
  useCarreras: vi.fn(),
}));

vi.mock("../materias/hooks", () => ({
  useMisMaterias: vi.fn(),
}));

describe("PerfilScreen", () => {
  const mockUser = {
    id: 1,
    email: "juan.perez@ifts.edu.ar",
    nombre: "Juan",
    apellido: "Pérez",
    rol: "alumno" as const,
    carrera_id: 1,
  };

  const mockMeQuery = {
    data: mockUser,
    loading: false,
    error: null,
    refetch: vi.fn(),
  };

  const mockCarrerasQuery = {
    data: {
      items: [{ id: 1, nombre: "Desarrollo de Software" }],
      page: 1,
      totalPages: 1,
    },
    loading: false,
    error: null,
  };

  const mockMateriasQuery = {
    data: {
      items: [
        { id: 1, materia_id: 1, estado: "aprobada", nota_final: 8 },
        { id: 2, materia_id: 2, estado: "cursando", nota_final: null },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    },
    loading: false,
    error: null,
  };

  const mockAuthContext = {
    usuario: mockUser,
    token: "token-123",
    cargando: false,
    verificandoSesion: false,
    login: vi.fn(),
    registro: vi.fn(),
    logout: vi.fn(),
    actualizarPerfil: vi.fn(),
    cambiarPassword: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AuthContext.useAuth).mockReturnValue(mockAuthContext);
    vi.mocked(perfilHooks.useAuthMe).mockReturnValue(mockMeQuery);
    vi.mocked(catalogoHooks.useCarreras).mockReturnValue(mockCarrerasQuery);
    vi.mocked(materiasHooks.useMisMaterias).mockReturnValue(mockMateriasQuery);
  });

  it("should render user profile information and academic stats correctly", () => {
    render(<PerfilScreen onCerrarSesion={vi.fn()} />);

    expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Juan")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Pérez")).toBeInTheDocument();
    expect(screen.getByDisplayValue("juan.perez@ifts.edu.ar")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Desarrollo de Software")).toBeInTheDocument();
    expect(screen.getByText("JP")).toBeInTheDocument(); // Initials
  });

  it("should render password change and logout buttons", () => {
    render(<PerfilScreen onCerrarSesion={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Cambiar contraseña" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
  });
});
