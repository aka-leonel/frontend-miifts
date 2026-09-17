# Status — miIFTS Frontend

> Owner: Planner | Actualizado: 2026-09-16

## Estado
**COMPLETE** — Sprint 5 Int.4: OLVIDÉ MI CONTRASEÑA (S5-13/14/15) + Cambiar contraseña logueado (FR8, INTEGRACION §2.4ter) + Perfil editable (S5-05/06/07, Int.2) mergeados en una sola rama y validados EN VIVO contra backend real (Chrome/Playwright), no solo build/tsc — ver `testing.md` §7/§8. De paso se corrigió una regresión real de logout (ver más abajo) y un bug de perfil editable (email se mandaba al backend pero éste lo ignora, ver D016). Previo: Int.2 (MATERIAS+INICIO) + Int.4 (PERFIL·CONVENIOS·UX S4-16..S4-20) COMPLETE (2026-09-14). Fase 1 Auth: T1.2 Login real DONE; T1.1 Registro y T1.3 rehidratación siguen pendientes.

## Qué se agregó (este update — Sprint 5, Integrante 4: Olvidé mi contraseña)
- **S5-12** Contrato cerrado con backend, documentado en `INTEGRACION_FRONT.md` §2.4bis (backend) y reflejado en `requirements.md` FR7. Sin cambios de código.
- **S5-13** `OlvidePasswordScreen` nueva + link en `LoginScreen`; `forgotPasswordRequest` (`src/auth/api.ts`) → `POST /auth/forgot-password`, siempre muestra éxito (no distingue si el email existe).
- **S5-14** `ResetPasswordScreen` nueva con misma validación de password que Registro; `resetPasswordRequest` → `POST /auth/reset-password`. Token leído de `?token=` en la URL sin agregar router (decisión D014 — esta app navega con `switch(screen)`, nunca se instaló react-router pese a D006).
- **S5-15** `400` (token inválido/vencido/usado) vuelve a `olvide-password` con el mensaje real del backend, no error genérico.

## Bloqueadores (Sprint 5)
QA manual end-to-end requiere el token de reset, que en dev solo se loguea en la consola del backend (sin SMTP configurado) — no es bloqueante para marcar DONE del front, pero falta antes de poder decir "probado contra backend real".

## Bug encontrado y corregido en QA manual (2026-09-16)
Durante la prueba E2E de S5-13/14/15 el usuario reportó "no me deja desloguearme". Diagnóstico: la sesión guardada había quedado inválida (token vencido/401 real de `/auth/me`) y `App.tsx` no tenía ningún mecanismo que reaccionara a eso — `AuthContext` limpiaba `usuario`/`token` correctamente vía `unauthorizedHandler`, pero el estado `screen` (que no está ligado a la sesión) se quedaba en la pantalla protegida donde estuviera, típicamente Perfil, que en su estado de error solo ofrecía "Reintentar" (sin salida). Corregido: (1) nuevo `useEffect` en `App()` que fuerza `screen→"login"` apenas `useAuth().usuario` es `null` fuera de las pantallas públicas; (2) `PerfilScreen.handleLogout` ahora llama `useAuth().logout()` en vez de borrar `localStorage` a mano (evita estado stale en `AuthContext`); (3) el estado de error de Perfil ahora también ofrece "Cerrar sesión", no solo "Reintentar". Validado en vivo con Playwright/browser contra backend real (sesión inválida → redirect automático a login; logout manual → limpia sesión y redirige).

## Gap resuelto (2026-09-16) — Cambiar contraseña logueado
Backend entregó `PATCH /auth/password` dedicado (INTEGRACION §2.4ter, commit `810809f` en `backend-ifts` dev). Implementado: `CambiarPasswordModal` en Perfil, `cambiarPasswordRequest` en `src/auth/api.ts`, y un ajuste en `apiClient` (`suppressUnauthorizedRedirect`, D015) para que el 401 de "contraseña actual incorrecta" no dispare el logout global (era un riesgo real: sin el fix, escribir mal la actual una vez te desconectaba de una sesión válida). Validado en vivo contra backend real: error de actual no desloguea, éxito no desloguea, y la contraseña nueva funciona para loguearse de nuevo tras un logout manual. Ver `requirements.md` FR8, `decisions.md` D017, `implementation.md` §9.6, `testing.md` §7.

## Merge con `feature/perfil_editable` (2026-09-16)
Dos integrantes trabajaron el mismo gap (cambio de contraseña) en paralelo desde ramas distintas. La otra rama asumía `POST /auth/change-password` (`CHANGE_PASSWORD_PATH`) — **endpoint que nunca existió en el backend real**, verificado leyendo `backend-ifts/app/features/auth/router.py` directamente; se descartó esa implementación al mergear. Se conservó la implementación de esta rama (`PATCH /auth/password`, ya validada en vivo) más el trabajo genuino y correcto de perfil editable de la otra rama (S5-05/06/07: nombre/apellido editables vía `PATCH /auth/me`, sincronización con `AuthContext.actualizarPerfil`) — con una corrección: esa rama también dejaba `email` editable en el formulario, pero el backend (`PerfilUpdate` en `auth/schema.py`) ignora silenciamente cualquier campo que no sea nombre/apellido, así que mandar un email nuevo ahí no lo cambiaba y el front mostraba éxito igual. Se corrigió a readOnly (ver D016). Detalle completo en `decisions.md` D016/D017 e `implementation.md` §9.6/§10/§11.

## Qué se agregó (este update — Sprint 4, Integrante 2)
- **S4-06** Shell responsive: `App.tsx` sacó el `maxWidth:430` fijo del shell raíz. Nuevo `SidebarNav` (desktop, `md:+`) reemplaza a `BottomNav` (que ahora solo se ve en mobile). Bug encontrado y corregido en el camino: `BottomNav` tenía `display:"flex"` en `style` inline, que anulaba el `display:none` de la clase `md:hidden` sin importar el viewport — se movió `display` a la clase (`className="flex md:hidden"`).
- **S4-07** Responsive `/materias`: `MisMateriasScreen` pasa de lista a `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. FAB reescrito de `right: calc(50% - 190px)` (asumía el frame fijo viejo) a `right-6` fijo al viewport.
- **S4-08** Estado "Reprobada": `estado.ts` ahora deriva `"Reprobada"` cuando `nota_final < 4` (antes cualquier nota final marcaba "Aprobada"). Umbral confirmado con el usuario. Se corrigieron también los conteos de `aprobadas` en `InicioScreen`/`MisMateriasScreen`, que leían el campo crudo `cursada.estado==="aprobada"` del backend (sin umbral) en vez de `estadoLabel()`.
- **S4-09** Fix "select de materia vacío": diagnosticado como **gap de datos del backend** (`backend-ifts/seed.py` solo carga materias para "Desarrollo de Software", no para "Análisis de Sistemas"), no un bug del front — confirmado con `useMateriasDeCarrera`/`materiaUsuarioSpec` funcionando correctamente. Se agregó un aviso visible en `MisMateriasScreen` cuando la carrera del usuario no tiene materias cargadas.
- **S4-10** (opcional, confirmado en alcance de Integrante 2) `features/catalogo-admin/` nuevo: ABM real de carreras y materias (`POST/PUT/DELETE /materias/carreras`, `/materias/`), sin `DEMO_MODE` (pedido explícito del ticket). Pantalla `AdminCatalogoScreen`, accesible solo para `usuario.rol==="admin"` (guard en `App.tsx` + link condicional en `MisMateriasScreen`). `api/types.ts`: se corrigió `Carrera` (agregado `ifts_id`, quitado `descripcion` inexistente en el backend) y se agregaron `CarreraCreate/Update`, `MateriaCreate/Update`.

## Regresión detectada (no de Sprint 4)
Se encontró que el commit base `fbf69d6` **no incluye** el trabajo de Registro/CarreraScreen reales ni el fix del `total` hardcodeado de `ByteWidget` que se habían hecho y validado en una sesión anterior — `RegistroScreen`/`CarreraScreen` volvieron a aparecer como mock puro. El `total` hardcodeado se re-corrigió como parte de S4-08 (mismo archivo/línea); Registro/Carrera **no** se tocó en este pase porque en Sprint 4 esa tarea es de Integrante 1 (S4-03), no de Integrante 2. Vale la pena que el equipo revise por qué ese commit no incluyó esos cambios (¿reset parcial? ¿conflicto de merge resuelto con la versión vieja?).

## Progreso
- [x] S4-06 Shell responsive (sidebar desktop + bottom nav mobile)
- [x] S4-07 Grid responsive `/materias`
- [x] S4-08 Estado "Reprobada" (umbral ≥4)
- [x] S4-09 Diagnóstico + aviso UX (causa real: dato de backend, no de front)
- [x] S4-10 Admin catálogo real (carreras + materias, sin mocks)

## Próximo paso
Tester validar T5-PWD-02 E2E (422/401/200 + login con nueva). Docker requiere Desktop running para `docker compose up`.

## Sprint 5 — Extensión FR8 Cambio contraseña (Planner → Developer → Tester)
**SUPERADO — ver `decisions.md` D017.** Este registro describe una implementación contra `POST /auth/change-password`; el backend que terminó mergeado a `dev` (commit `810809f`) expone `PATCH /auth/password`, no ese path — se descartó al mergear `feature/perfil_editable`. Se deja el registro original abajo como historial de la investigación, no como estado vigente.

**COMPLETE (2026-09-16)** — Planner armó T5-PWD-BE-01/T5-PWD-01/T5-PWD-02. Developer implementó BE `POST /auth/change-password` (`schema ChangePasswordRequest` + `service.cambiar_password` verifica current + `router` con auth) + export `docs/openapi.json` 33 paths copiado a front. Build `vite 349ms` + `tsc 0` (solo SidebarNav preexistente) + `pytest 46 passed`. E2E service directo `cambiar_password` verifica current incorrecto 401, same 400, corta 422, login con nueva OK. `PerfilScreen` modal intacto vía `changePasswordRequest` (`auth:true`, `current_password`/`new_password`).

## Sprint 5 — Int.2 (Planner) — RESUELTO
**COMPLETE (2026-09-16)** — `implementation.md` §9 + §10 cerrados. FR8 gap resuelto vía opción A — backend expuso `PATCH /auth/password` (no `POST /auth/change-password`, ver nota arriba y D017).

## Sprint 5 — Int.2 (Developer → Tester)
**COMPLETE** — Developer implementó T5-PERFIL-01→04 + T5-PWD (modal limpio, servicio integración lista). Tester validó §9.4 `build 258ms` + `tsc` + live `PATCH`. Veredicto **PASS con observación email** (§7). FR8 queda ready para E2E cuando backend exponga ruta.

## Sprint 4 — Int.4 (Planner)
**PLANNING** — `implementation.md` §8 define 5 tareas delegables (0.5d+1d+1d+1d+1.5d≈5d): S4-16 bloquear carrera Perfil (solo lectura, quitar ✓ Guardado falso, gap PATCH /auth/me), S4-17 validar convenios contra backend real (vacío→EmptyState, error→ErrorState, paginación total_pages), S4-18 borrar hardcode `universidades`/`talentoTech` de `convenios/service.ts` (coord S4-04), S4-19 borrar `recursosInit`/`recordatoriosInit` de `App.tsx` + DetalleScreen mock, S4-20 responsive grids Inicio/Recordatorios/Convenios/Perfil (quitar frame 430px). Sin `DEMO_MODE`, datos reales vía `apiClient` + `Paginated<T>`.

## Sprint 4 — Int.4 (Developer → Tester)
**TESTING → COMPLETE (2026-09-14)** — Developer implementó 5/5 tareas: perfil `readOnly` + banner PATCH, convenios 100% `apiClient` sin hardcode/demo, `App.tsx` sin `recursosInit`/`recordatoriosInit`, 4 pantallas responsive `max-w-lg sm:2xl lg:5xl` + `grid sm:2 lg:3`, shell `App.tsx:653` responsive. Tester validó: `build ✓250ms` + `tsc 0` + `grep` 0 hits hardcode/demo + `grid` responsive + `ListState/Paginador` OK. Veredicto **PASS** con observación menor `BottomNav maxWidth 430` fijo (no bloqueante). Evidencia en `testing.md` §6. Pendiente opcional: `BottomNav` responsive follow-up y E2E con backend seed.

## Bloqueadores
Ninguno para los tickets de Integrante 2. Gap vigente: CORS si el front no corre en :5173 (puerto default del scaffold Figma Make es 8443).

## Métricas
Build OK (74 módulos, 78kB gzip); tsc 0 errores; eslint sin issues nuevos (2 preexistentes ajenos en `vite.config.ts`/`convenios/hooks.ts`); validado en vivo con Playwright contra backend real (login admin, registro nuevo, ABM catálogo, badges de estado, responsive desktop/mobile).
