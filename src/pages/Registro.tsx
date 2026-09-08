// src/pages/Registro.tsx

import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../auth/AuthContext";
import { ApiRequestError, request } from "../api/client";
import type { Carrera, Paginated } from "../api/types";

type ErroresPorCampo = Record<string, string>;

export function Registro() {
  const { registro, cargando } = useAuth();
  const navigate = useNavigate();

  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [cargandoCarreras, setCargandoCarreras] = useState(true);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [carreraId, setCarreraId] = useState<string>("");

  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [erroresCampo, setErroresCampo] = useState<ErroresPorCampo>({});

  useEffect(() => {
    request<Paginated<Carrera>>("/materias/carreras", {
      params: { per_page: 100 },
    })
      .then((res) => setCarreras(res.items))
      .catch(() => setCarreras([]))
      .finally(() => setCargandoCarreras(false));
  }, []);

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorGeneral(null);
    setErroresCampo({});

    try {
      await registro({
        nombre,
        email,
        password,
        carrera_id: Number(carreraId),
      });
      navigate("/", { replace: true });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        if (error.errors && error.errors.length > 0) {
          const mapa: ErroresPorCampo = {};
          for (const { campo, msg } of error.errors) {
            mapa[campo] = msg;
          }
          setErroresCampo(mapa);
        } else {
          setErrorGeneral(error.detail);
        }
      } else {
        setErrorGeneral("No se pudo conectar con el servidor. Probá de nuevo.");
      }
    }
  }

  return (
    <AuthLayout titulo="Crear cuenta">
      <button
        onClick={() => navigate("/login")}
        style={{
          background: "none",
          border: "none",
          color: "var(--color-ink-soft)",
          cursor: "pointer",
          marginBottom: 24,
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 14,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver
      </button>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.4px", marginBottom: 4 }}>
          Crear cuenta
        </div>
        <div style={{ color: "var(--color-ink-soft)", fontSize: 14 }}>Completá tus datos para empezar</div>
      </div>

      {errorGeneral && <div className="mensajeGeneral">{errorGeneral}</div>}

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="campo" style={{ marginBottom: 0 }}>
          <label className="etiqueta" htmlFor="nombre">
            Nombre completo
          </label>
          <input
            id="nombre"
            type="text"
            className={`input ${erroresCampo.nombre ? "inputConError" : ""}`}
            placeholder="Nombre y apellido"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            minLength={2}
            maxLength={100}
            required
          />
          {erroresCampo.nombre && (
            <p className="errorCampo">{erroresCampo.nombre}</p>
          )}
        </div>

        <div className="campo" style={{ marginBottom: 0 }}>
          <label className="etiqueta" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`input ${erroresCampo.email ? "inputConError" : ""}`}
            placeholder="Email institucional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          {erroresCampo.email && (
            <p className="errorCampo">{erroresCampo.email}</p>
          )}
        </div>

        <div className="campo" style={{ marginBottom: 0 }}>
          <label className="etiqueta" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className={`input ${erroresCampo.password ? "inputConError" : ""}`}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
            aria-describedby="password-ayuda"
          />
          <p id="password-ayuda" className="textoSecundario" style={{ marginTop: "0.375rem", marginBottom: 0 }}>
            Mínimo 8 caracteres, con al menos una letra y un número.
          </p>
          {erroresCampo.password && (
            <p className="errorCampo">{erroresCampo.password}</p>
          )}
        </div>

        <div className="campo" style={{ marginBottom: 0 }}>
          <label className="etiqueta" htmlFor="carrera">
            Carrera
          </label>
          <select
            id="carrera"
            className={`input ${erroresCampo.carrera_id ? "inputConError" : ""}`}
            value={carreraId}
            onChange={(e) => setCarreraId(e.target.value)}
            required
            disabled={cargandoCarreras}
          >
            <option value="" disabled>
              {cargandoCarreras ? "Cargando carreras..." : "Elegí tu carrera"}
            </option>
            {carreras.map((carrera) => (
              <option key={carrera.id} value={carrera.id}>
                {carrera.nombre}
              </option>
            ))}
          </select>
          {erroresCampo.carrera_id && (
            <p className="errorCampo">{erroresCampo.carrera_id}</p>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <button type="submit" className="botonPrimario" disabled={cargando}>
            {cargando ? "Creando cuenta..." : "Continuar"}
          </button>
        </div>
      </form>

      <p style={{ color: "var(--color-ink-soft)", fontSize: 12, textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
        Al registrarte aceptás los{" "}
        <span style={{ color: "var(--color-accent)" }}>términos y condiciones</span>
      </p>
    </AuthLayout>
  );
}
