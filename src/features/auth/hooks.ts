import { useAsyncAction } from "../../hooks/useAsyncQuery";
import { useAuth } from "../../auth/AuthContext";
import type { LoginRequest, TokenResponse } from "./service";

export function useLogin() {
  const auth = useAuth();
  const action = useAsyncAction<[LoginRequest], TokenResponse>(async (body) => {
    await auth.login(body.email, body.password);
    // Devolver un TokenResponse mínimo para compatibilidad con consumidores
    return {
      access_token: window.localStorage.getItem("miifts_token") || "",
      token_type: "bearer",
      usuario: (auth.usuario as any),
    } as TokenResponse;
  });
  return action;
}
