// src/components/AppLayout.tsx
//
// Envoltorio de todas las pantallas protegidas: Navbar arriba, el contenido
// de cada feature (Int. 2, 3, 4) se renderiza en <Outlet /> según la ruta.

import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  return (
    <div className={styles.app}>
      <Navbar />
      <main className={styles.contenido}>
        <Outlet />
      </main>
    </div>
  );
}
