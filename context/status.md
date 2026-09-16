# Status — miIFTS Frontend

> Owner: Planner | Actualizado: 2026-09-16

## Estado
**IMPLEMENTATION READY** — Sprint 5 Int.2 Perfil (S5-05→S5-08) + extensión FR8 cambio contraseña completados. Modal limpio sin aviso, integración lista vía `CHANGE_PASSWORD_PATH`. Backend pendiente de exponer ruta.

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
Developer ya implementó §9 + §10 (modal limpio, `CHANGE_PASSWORD_PATH` único punto de integración). Tester validó §9. Siguiente: cuando backend exponga `POST /auth/change-password`, solo editar string en `src/auth/api.ts:40` y ejecutar T5-PWD-02 E2E.

## Sprint 5 — Int.2 (Planner)
**COMPLETE (2026-09-16)** — `implementation.md` §9 (4 tareas, 3.5d) + §10 FR8 implementados y validados Tester §7. Perfil `PATCH /auth/me` + modal contraseña limpio sin aviso. `CHANGE_PASSWORD_PATH` es único TODO futuro.

## Sprint 5 — Extensión FR8 Cambio contraseña (Planner → Developer)
**IMPLEMENTATION READY (2026-09-16)** — `implementation.md` §10 define T5-PWD-01→03 (0.5d). Front 100% listo: `ChangePasswordRequest` + `changePasswordRequest()` + modal con validación + `pwdSaving` + 422→fields/401→toast. Solo falta cambiar `CHANGE_PASSWORD_PATH` en `src/auth/api.ts` cuando `openapi.json` exponga `POST /auth/change-password`.

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
