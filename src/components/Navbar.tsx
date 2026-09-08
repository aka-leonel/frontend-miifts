// src/components/Navbar.tsx

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { SessionExtendModal } from "./SessionExtendModal";
import styles from "./Navbar.module.css";

export function Navbar() {
  const { usuario, logout, expirandoPronto } = useAuth();
  const navigate = useNavigate();
  const [openExtend, setOpenExtend] = useState(false);

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
        {expirandoPronto && (
          <div style={{ marginRight: "1rem", background: "#fff4e5", padding: "0.35rem 0.6rem", borderRadius: 6 }}>
            <span style={{ marginRight: "0.5rem" }}>Tu sesión expirará pronto.</span>
            <button onClick={() => setOpenExtend(true)} style={{ background: "transparent", border: "none", color: "#0b76ef", textDecoration: "underline", cursor: "pointer" }}>
              Extender sesión
            </button>
          </div>
        )}

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

      <SessionExtendModal open={openExtend} onClose={() => setOpenExtend(false)} />
    </nav>
  );
}
