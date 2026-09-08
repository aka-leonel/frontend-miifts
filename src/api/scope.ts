// src/api/scope.ts
//
// IMPORTANTE — leer antes de usar:
// El sprint original pedía un withUsuarioId(params) genérico para TODAS las
// llamadas de cursadas y recordatorios. Eso quedó obsoleto: según
// docs/INTEGRACION_FRONT.md §6 (punto 1, "resuelto en Sprint 2"), el backend
// ya toma la identidad del token en POST/PATCH/DELETE — no hay que mandar
// usuario_id en el body ni en la URL de esos endpoints.
//
// Los ÚNICOS lugares que todavía llevan un id de usuario en la URL son dos
// GET, y ahí tiene que ser el id del propio usuario logueado (el backend
// devuelve 403 si pedís el de otro sin ser admin):
//   - GET /materias/usuario/{usuario_id}
//   - GET /materias/promedio/{usuario_id}
//
// Para esos dos casos, usar getMiUsuarioId().

import { getUsuarioGuardado } from "../auth/storage";

export function getMiUsuarioId(): number {
  const usuario = getUsuarioGuardado();
  if (!usuario) {
    throw new Error(
      "getMiUsuarioId() se llamó sin sesión activa. ¿Falta envolver la pantalla en <RutaProtegida>?"
    );
  }
  return usuario.id;
}
