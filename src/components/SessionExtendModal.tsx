import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export function SessionExtendModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { usuario, login } = useAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  if (!usuario) return null;

  const email = usuario.email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err?.detail || "No se pudo re-autenticar. Revisá tu contraseña.");
    } finally {
      setLoading(false);
      setPassword("");
    }
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{ background: "white", padding: "1rem 1.25rem", borderRadius: 8, width: 360 }}>
        <h3>Extender sesión</h3>
        <p>Volvé a ingresar tu contraseña para renovar la sesión.</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontSize: 12, color: "#333" }}>Usuario</label>
            <input type="email" value={usuario.email} readOnly style={{ width: "100%", padding: "0.5rem" }} />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontSize: 12, color: "#333" }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          {error && <p style={{ color: "#b00020" }}>{error}</p>}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.75rem" }}>
            <button type="button" onClick={onClose} disabled={loading} style={{ padding: "0.5rem 0.75rem" }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ padding: "0.5rem 0.75rem", background: "#0b76ef", color: "white", border: "none" }}>
              {loading ? "Extendiendo..." : "Extender sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
