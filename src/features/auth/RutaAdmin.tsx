import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RutaAdmin({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();

  if (usuario?.rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
