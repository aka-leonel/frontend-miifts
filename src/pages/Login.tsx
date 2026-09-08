// src/pages/Login.tsx

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../auth/AuthContext";
import { ApiRequestError } from "../api/client";

export function Login() {
  const { login, cargando } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorGeneral(null);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (error) {
      // 401 con credenciales inválidas es el caso esperado acá (ver
      // docs/INTEGRACION_FRONT.md §2.2). Cualquier otro código también cae
      // en este mensaje genérico hasta que exista el <Toaster /> del kit
      // de UX de Integrante 4.
      if (error instanceof ApiRequestError) {
        setErrorGeneral(error.detail);
      } else {
        setErrorGeneral("No se pudo conectar con el servidor. Probá de nuevo.");
      }
    }
  }

  return (
    <AuthLayout titulo="Iniciar sesión">
      {errorGeneral && <div className="mensajeGeneral">{errorGeneral}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="campo">
          <label className="etiqueta" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="campo">
          <label className="etiqueta" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="botonPrimario" disabled={cargando}>
          {cargando ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>

      <p className="textoSecundario">
        ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
      </p>
    </AuthLayout>
  );
}
