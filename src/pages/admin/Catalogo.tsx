import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Carrera, Materia } from "../../api/types";
import styles from "../Catalogo.module.css";

// Página básica de ABM de catálogo. Implementa listado simple y enlaces
// de alta/edición como placeholder para el sprint actual.
export function CatalogoAdmin() {
  const [carreras, setCarreras] = useState<Carrera[] | null>(null);
  const [materias, setMaterias] = useState<Materia[] | null>(null);

  useEffect(() => {
    // Por ahora no hacemos requests reales; cargamos datos vacíos.
    setCarreras([]);
    setMaterias([]);
  }, []);

  return (
    <div className={styles.catalogoContainer}>
      <h1>ABM de Catálogo (admin)</h1>
      <p>Desde aquí el admin podrá gestionar carreras y materias.</p>

      <section>
        <header className={styles.headerSection}>
          <h2>Carreras</h2>
          <Link to="/admin/catalogo/carreras/nuevo" className={styles.btn}>Nueva carrera</Link>
        </header>
        {carreras && carreras.length === 0 && <p>No hay carreras cargadas.</p>}
      </section>

      <section>
        <header className={styles.headerSection}>
          <h2>Materias</h2>
          <Link to="/admin/catalogo/materias/nuevo" className={styles.btn}>Nueva materia</Link>
        </header>
        {materias && materias.length === 0 && <p>No hay materias cargadas.</p>}
      </section>
    </div>
  );
}
