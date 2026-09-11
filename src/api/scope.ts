// SEAM · trabajo de Integrante 1 (Fundaciones): AuthProvider / useAuth.
//
// Mientras no exista `useAuth`, la identidad sale de `localStorage` (mismas claves que
// usará el AuthProvider) y, si no hay sesión, se cae a un usuario DEMO para poder
// recorrer la UI. Cuando Int. 1 entregue el auth real, SOLO este archivo cambia: las
// features ya consumen `withUsuarioId()` / `getMiUsuarioId()`.
import type { Usuario } from "./types";

const SESSION_KEY = "miifts_usuario";

const DEMO_USUARIO: Usuario = {
  id: 1,
  nombre: "Martina Ríos",
  email: "martina.demo@ifts.edu.ar",
  carrera_id: 1,
  fecha_registro: "2026-09-01T00:00:00",
  rol: "estudiante",
};

export function getMiUsuario(): Usuario {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (raw) {
      return JSON.parse(raw) as Usuario;
    }
  } catch {
    // sesión corrupta → demo
  }
  return DEMO_USUARIO;
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