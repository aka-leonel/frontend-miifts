import { useAsyncAction } from "../../hooks/useAsyncQuery";
import { guardarSesion, login } from "./service";
import type { LoginRequest, TokenResponse } from "./service";

export function useLogin() {
  const action = useAsyncAction<[LoginRequest], TokenResponse>(async (body) => {
    const result = await login(body);
    guardarSesion(result.access_token, result.usuario);
    return result;
  });
  return action;
}
