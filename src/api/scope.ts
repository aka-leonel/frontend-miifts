import type { Usuario } from "./types";

const SESSION_KEY = "miifts_usuario";

export function getMiUsuario(): Usuario {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    throw new Error("No hay usuario en sesión.");
  }

  try {
    const usuario = JSON.parse(raw) as Usuario;
    if (!usuario?.id) {
      throw new Error("La sesión del usuario no es válida.");
    }
    return usuario;
  } catch {
    throw new Error("La sesión del usuario no es válida.");
  }
}

export function getMiUsuarioId(): number {
  return getMiUsuario().id;
}

/**
 * Interpola `{usuario_id}` con el id de la sesión en los GET que todavía lo exigen en
 * el path (`/materias/usuario/{usuario_id}`, `/materias/promedio/{usuario_id}`).
 * En todo lo demás (POST / PATCH / DELETE) el contrato NO espera `usuario_id`: sale del token.
 */
export function withUsuarioId(path: string): string {
  return path.replace("{usuario_id}", String(getMiUsuarioId()));
}