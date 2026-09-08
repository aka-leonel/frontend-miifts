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
      if (error instanceof ApiRequestError) {
        setErrorGeneral(error.detail);
      } else {
        setErrorGeneral("No se pudo conectar con el servidor. Probá de nuevo.");
      }
    }
  }

  return (
    <AuthLayout titulo="Iniciar sesión">
      <div style={{ paddingTop: "60px", textAlign: "center", marginBottom: 48 }}>
        {/* Logo */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: `linear-gradient(135deg, var(--color-accent) 0%, #6B5CE7 100%)`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M8 28V14l10-8 10 8v14H22v-8h-8v8H8z" fill="white" />
          </svg>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.5px", marginBottom: 4 }}>
          mi<span style={{ color: "var(--color-accent)" }}>IFTS</span>
        </div>
        <div style={{ color: "var(--color-ink-soft)", fontSize: 13 }}>Tu organizador académico</div>
      </div>

      {errorGeneral && <div className="mensajeGeneral">{errorGeneral}</div>}

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="campo" style={{ marginBottom: 0 }}>
          <label className="etiqueta" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="Email institucional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="campo" style={{ marginBottom: 0 }}>
          <label className="etiqueta" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div style={{ marginTop: 24 }}>
          <button type="submit" className="botonPrimario" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </form>

      <p style={{ textAlign: "center", marginTop: 24, color: "var(--color-ink-soft)", fontSize: 14 }}>
        ¿No tenés cuenta?{" "}
        <Link to="/registro" style={{ color: "var(--color-accent)", fontWeight: 600, textDecoration: "none" }}>
          Registrate
        </Link>
      </p>
    </AuthLayout>
  );
}

