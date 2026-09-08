// src/pages/Home.tsx
//
// Placeholder de la pantalla principal autenticada. Cada feature (catálogo,
// mis cursadas, recursos, recordatorios) va a colgar de acá o de sus propias
// rutas dentro de <AppLayout />.

import { useAuth } from "../auth/AuthContext";

export function Home() {
  const { usuario } = useAuth();

  return (
    <div>
      <h2>Hola, {usuario?.nombre}</h2>
      <p>Elegí una sección desde la barra de arriba para empezar.</p>
    </div>
  );
}
