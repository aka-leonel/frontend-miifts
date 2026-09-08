// src/components/Navbar.tsx

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "./Navbar.module.css";

export function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.wordmark}>
        mi IFTS
      </Link>

      <div className={styles.derecha}>
        {usuario?.rol === "admin" && (
          <Link to="/admin/catalogo" className={styles.enlace}>
            Catálogo (admin)
          </Link>
        )}

        {usuario && <span className={styles.nombreUsuario}>{usuario.nombre}</span>}

        <button className={styles.botonLogout} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
