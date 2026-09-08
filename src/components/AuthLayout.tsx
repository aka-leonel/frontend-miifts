// src/components/AuthLayout.tsx
//
// Chrome compartido entre Login y Registro: panel de marca a la izquierda,
// contenido del form a la derecha. En mobile, el panel de marca colapsa a
// una franja superior angosta (ver AuthLayout.module.css).

import type { ReactNode } from "react";
import styles from "./AuthLayout.module.css";

interface AuthLayoutProps {
  titulo: string;
  children: ReactNode;
}

export function AuthLayout({ titulo, children }: AuthLayoutProps) {
  return (
    <div className={styles.contenedor}>
      <aside className={styles.marca}>
        <span className={styles.wordmark}>mi IFTS</span>
        <p className={styles.tagline}>
          Cursadas, promedio, recordatorios y recursos de tu carrera, en un
          solo lugar.
        </p>
      </aside>

      <main className={styles.panelForm}>
        <div className={styles.formAncho}>
          <h1 className={styles.titulo}>{titulo}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
