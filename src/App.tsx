// src/App.tsx

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RutaProtegida } from "./auth/RutaProtegida";
import { AppLayout } from "./components/AppLayout";
import { Login } from "./pages/Login";
import { Registro } from "./pages/Registro";
import { Home } from "./pages/Home";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route
            element={
              <RutaProtegida>
                <AppLayout />
              </RutaProtegida>
            }
          >
            <Route path="/" element={<Home />} />
            {/* Integrantes 2, 3 y 4: sus rutas van acá adentro, así
                heredan Navbar + <RutaProtegida /> gratis. */}
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
