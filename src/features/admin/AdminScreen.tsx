// Panel Admin (ver decisions D015) — shell con tabs internas, sin ruta propia
// (esta app navega con un `switch(screen)` en memoria, ver App.tsx §10 en
// architecture.md). Punto de entrada único vía el nav item "Admin"
// (rol-gated), reemplaza al botón que vivía en MisMateriasScreen (S4-10).
import { useState } from "react";
import AdminCatalogoScreen from "../catalogo-admin/AdminCatalogoScreen";
import ConveniosAdminScreen from "../convenios-admin/ConveniosAdminScreen";

type Tab = "catalogo" | "convenios";

// Las dos sub-pantallas ya traen su propio título/`pt-14` (son las mismas
// pantallas standalone de S4-10), así que acá solo va el selector de tab,
// sin envolver en otro contenedor con scroll propio (evita doble scrollbar).
export default function AdminScreen() {
  const [tab, setTab] = useState<Tab>("catalogo");

  const tabs: { key: Tab; label: string }[] = [
    { key: "catalogo", label: "Catálogo" },
    { key: "convenios", label: "Convenios" },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex gap-1 border-b border-border bg-card px-4 pt-3 sm:px-6">
        {tabs.map((option) => (
          <button
            key={option.key}
            type="button"
            aria-pressed={tab === option.key}
            onClick={() => setTab(option.key)}
            className={[
              "rounded-t-lg px-4 py-2 text-sm font-medium transition",
              tab === option.key ? "border-b-2 border-violet text-violet" : "text-muted",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>

      {tab === "catalogo" ? <AdminCatalogoScreen /> : <ConveniosAdminScreen />}
    </div>
  );
}
