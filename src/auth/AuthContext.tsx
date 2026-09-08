// src/auth/AuthContext.tsx
//
// Fuente única de verdad del estado de sesión. El resto de la app consume
// esto vía useAuth(), nunca lee localStorage directamente.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { RegistroRequest, Usuario } from "../api/types";
import { loginRequest, registroRequest } from "./api";
import {
  clearSesion,
  getToken,
  getUsuarioGuardado,
  setToken,
  setUsuarioGuardado,
} from "./storage";
import { setUnauthorizedHandler } from "../api/client";

interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  /** true mientras se resuelve login/registro (para deshabilitar botones) */
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  registro: (payload: RegistroRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado inicial leído de localStorage: así una recarga de página no
  // desloguea al usuario (rehidratación simple, sin llamar a /auth/me).
  const [usuario, setUsuarioState] = useState<Usuario | null>(() =>
    getUsuarioGuardado()
  );
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [cargando, setCargando] = useState(false);

  function logout(): void {
    clearSesion();
    setUsuarioState(null);
    setTokenState(null);
  }

  useEffect(() => {
    // Cuando client.ts recibe un 401 de cualquier request, limpia la
    // sesión acá. El redirect a /login lo resuelve <RutaProtegida> solo,
    // porque usuario/token van a quedar en null.
    setUnauthorizedHandler(logout);
  }, []);

  async function login(email: string, password: string): Promise<void> {
    setCargando(true);
    try {
      const data = await loginRequest({ email, password });
      setToken(data.access_token);
      setTokenState(data.access_token);
      if (data.usuario) {
        setUsuarioGuardado(data.usuario);
        setUsuarioState(data.usuario);
      }
    } finally {
      setCargando(false);
    }
  }

  async function registro(payload: RegistroRequest): Promise<void> {
    setCargando(true);
    try {
      // POST /auth/registro NO devuelve token (ver INTEGRACION_FRONT.md §2.1)
      // así que hacemos login inmediatamente después con las mismas
      // credenciales, tal como pide el sprint ("auto-login").
      await registroRequest(payload);
      await login(payload.email, payload.password);
    } finally {
      setCargando(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{ usuario, token, cargando, login, registro, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() tiene que usarse dentro de <AuthProvider>.");
  }
  return ctx;
}
