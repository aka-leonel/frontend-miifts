// src/pages/Registro.tsx

import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    // Público, no necesita auth. Se pide un per_page generoso porque el
    // select tiene que mostrar todas las carreras del instituto; si el
    // catálogo llegara a crecer mucho, esto se reemplaza por un buscador
    // (lo maneja Integrante 2 en /materias/buscar), pero para el MVP de
    // Fundaciones alcanza con una sola página grande.
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
      {errorGeneral && <div className="mensajeGeneral">{errorGeneral}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="campo">
          <label className="etiqueta" htmlFor="nombre">
            Nombre completo
          </label>
          <input
            id="nombre"
            type="text"
            className={`input ${erroresCampo.nombre ? "inputConError" : ""}`}
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

        <div className="campo">
          <label className="etiqueta" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`input ${erroresCampo.email ? "inputConError" : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          {erroresCampo.email && (
            <p className="errorCampo">{erroresCampo.email}</p>
          )}
        </div>

        <div className="campo">
          <label className="etiqueta" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className={`input ${erroresCampo.password ? "inputConError" : ""}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
            aria-describedby="password-ayuda"
          />
          <p id="password-ayuda" className="textoSecundario" style={{ marginTop: "0.375rem" }}>
            Mínimo 8 caracteres, con al menos una letra y un número.
          </p>
          {erroresCampo.password && (
            <p className="errorCampo">{erroresCampo.password}</p>
          )}
        </div>

        <div className="campo">
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

        <button type="submit" className="botonPrimario" disabled={cargando}>
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="textoSecundario">
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </AuthLayout>
  );
}
