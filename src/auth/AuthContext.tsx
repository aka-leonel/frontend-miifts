// src/auth/AuthContext.tsx
//
// Fuente única de verdad del estado de sesión. El resto de la app consume
// esto vía useAuth(), nunca lee localStorage directamente.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { RegistroRequest, Usuario } from "../api/types";
import { loginRequest, meRequest, registroRequest } from "./api";
import {
  clearSesion,
  getToken,
  getUsuarioGuardado,
  setToken,
  setUsuarioGuardado,
  getTokenExpSeconds,
} from "./storage";
import { setUnauthorizedHandler } from "../api/client";

interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  /** true mientras se resuelve login/registro (para deshabilitar botones) */
  cargando: boolean;
  /**
   * true solo al arrancar la app, mientras se confirma contra el backend
   * que el token guardado en localStorage todavía es válido. Útil para
   * evitar mostrar una pantalla protegida con datos potencialmente
   * vencidos por una fracción de segundo.
   */
  verificandoSesion: boolean;
  /** true si la sesión expirará en breve (p.ej. < 60s) */
  expirandoPronto: boolean;
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
  // Arranca en true solo si había un token guardado: recién ahí tiene
  // sentido esperar la confirmación antes de mostrar una pantalla protegida.
  const [verificandoSesion, setVerificandoSesion] = useState(
    () => getToken() !== null
  );

  // Estado que indica que la sesión expirará pronto (p.ej. < 60s). Sirve para
  // que la UI muestre un banner/pregunta antes del logout automático.
  const [expirandoPronto, setExpirandoPronto] = useState(false);

  const logoutTimerRef = useRef<number | null>(null);
  const warnTimerRef = useRef<number | null>(null);
  const WARN_MS = 60_000; // avisar 60s antes

  function clearTimers() {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (warnTimerRef.current) {
      clearTimeout(warnTimerRef.current);
      warnTimerRef.current = null;
    }
  }

  function logout(): void {
    clearTimers();
    setExpirandoPronto(false);
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

  useEffect(() => {
    // Confirmación de sesión al arrancar: el token guardado puede haber
    // expirado (dura 24h, sin refresh) mientras la pestaña estaba cerrada.
    // Sin esto, la app "cree" que hay sesión hasta que el usuario dispare
    // el primer request protegido y recién ahí lo desloguee.
    const tokenGuardado = getToken();
    if (!tokenGuardado) {
      setVerificandoSesion(false);
      return;
    }

    meRequest()
      .then((usuarioActualizado) => {
        setUsuarioGuardado(usuarioActualizado);
        setUsuarioState(usuarioActualizado);
      })
      .catch(() => {
        // Un 401 acá ya disparó el logout vía setUnauthorizedHandler.
        // Cualquier otro error de red se ignora: nos quedamos con los
        // datos que había en localStorage en vez de desloguear por un
        // problema de conectividad pasajero.
      })
      .finally(() => setVerificandoSesion(false));

    // Además, programar timers de expiración basados en el token actual
    // (si el token ya expiró, logout inmediato).
    const expSec = getTokenExpSeconds(tokenGuardado);
    if (expSec) {
      const msUntilExpiry = expSec * 1000 - Date.now();
      if (msUntilExpiry <= 0) {
        logout();
      } else {
        clearTimers();
        // aviso WARN_MS antes
        if (msUntilExpiry > WARN_MS) {
          warnTimerRef.current = window.setTimeout(() => {
            setExpirandoPronto(true);
          }, msUntilExpiry - WARN_MS);
        } else {
          // si queda menos del umbral, avisamos ya
          setExpirandoPronto(true);
        }
        logoutTimerRef.current = window.setTimeout(() => {
          logout();
        }, msUntilExpiry);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // configurar timers según el token nuevo
      clearTimers();
      const expSec = getTokenExpSeconds(data.access_token);
      if (expSec) {
        const msUntilExpiry = expSec * 1000 - Date.now();
        if (msUntilExpiry <= 0) {
          logout();
        } else {
          if (msUntilExpiry > WARN_MS) {
            warnTimerRef.current = window.setTimeout(() => {
              setExpirandoPronto(true);
            }, msUntilExpiry - WARN_MS);
          } else {
            setExpirandoPronto(true);
          }
          logoutTimerRef.current = window.setTimeout(() => {
            logout();
          }, msUntilExpiry);
        }
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
      value={{
        usuario,
        token,
        cargando,
        verificandoSesion,
        expirandoPronto,
        login,
        registro,
        logout,
      }}
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