# Status — miIFTS Frontend

> Owner: Planner | Actualizado: 2026-09-14

## Estado
**COMPLETE** — Int.2 (MATERIAS+INICIO) + **Int.4 (PERFIL·CONVENIOS·UX S4-16..S4-20)** implementados y validados por Tester (2026-09-14). Int.2: build+tsc PASS. Int.4: build 250ms + tsc 0 + grep 0 hardcode/demo + responsive PASS (observación menor BottomNav). Fase 1 Auth: T1.2 Login real DONE; T1.1 Registro y T1.3 rehidratación siguen pendientes.

## Qué se agregó (este update)
- `features/auth/` (service+hooks): `POST /auth/login` real, guarda sesión en `miifts_token`/`miifts_usuario`.
- `App.tsx` `LoginScreen`: dejó de ser mock (antes "Ingresar" navegaba directo a "registro" sin llamar al backend); ahora autentica de verdad, 401→toast, sesión persiste al refrescar.
- `api/scope.ts`: `DEMO_USUARIO` ahora exportado (reusado por `features/auth` en DEMO_MODE).

## Progreso
- [x] context/ + docs/context/ 6 docs creados
- [x] Enriquecimiento con INTEGRACION+REQUERIMIENTOS
- [x] Int.2 T2-CAT-01→T2-INT-01 implementado (MateriaCard, ByteWidget, InicioScreen, MisMateriasScreen refactor, App integración)
- [x] Tester validó Int.2: build OK (vite 8 con Node 23.10), tsc 0 errores Int.2, criterios §7.3 PASS
- [x] Dependencias instaladas (`npm install` Node 23.10, 45 packages)
- [x] T1.2 Login real implementado y validado (build+tsc+eslint+Playwright contra backend real, incluyendo caso 401)

## Próximo paso
Int.2 COMPLETE. **Sprint 4 — Int.4 PLANNING** (2026-09-14): `implementation.md` §8 planificado para Planner→Developer con 5 tareas S4-16..S4-20 sin mocks (perfil solo-lectura, convenios real sin hardcode, limpieza recursos/recordatoriosInit, responsive). Pendiente real: T1.1 Registro mock y T1.3 rehidratación + ejecución Int.4 T4-PERFIL-01→T4-RESP-01 contra backend real (`VITE_API_URL=http://localhost:8000`, `DEMO_MODE=false`).

## Sprint 4 — Int.4 (Planner)
**PLANNING** — `implementation.md` §8 define 5 tareas delegables (0.5d+1d+1d+1d+1.5d≈5d): S4-16 bloquear carrera Perfil (solo lectura, quitar ✓ Guardado falso, gap PATCH /auth/me), S4-17 validar convenios contra backend real (vacío→EmptyState, error→ErrorState, paginación total_pages), S4-18 borrar hardcode `universidades`/`talentoTech` de `convenios/service.ts` (coord S4-04), S4-19 borrar `recursosInit`/`recordatoriosInit` de `App.tsx` + DetalleScreen mock, S4-20 responsive grids Inicio/Recordatorios/Convenios/Perfil (quitar frame 430px). Sin `DEMO_MODE`, datos reales vía `apiClient` + `Paginated<T>`.

## Sprint 4 — Int.4 (Developer → Tester)
**TESTING → COMPLETE (2026-09-14)** — Developer implementó 5/5 tareas: perfil `readOnly` + banner PATCH, convenios 100% `apiClient` sin hardcode/demo, `App.tsx` sin `recursosInit`/`recordatoriosInit`, 4 pantallas responsive `max-w-lg sm:2xl lg:5xl` + `grid sm:2 lg:3`, shell `App.tsx:653` responsive. Tester validó: `build ✓250ms` + `tsc 0` + `grep` 0 hits hardcode/demo + `grid` responsive + `ListState/Paginador` OK. Veredicto **PASS** con observación menor `BottomNav maxWidth 430` fijo (no bloqueante). Evidencia en `testing.md` §6. Pendiente opcional: `BottomNav` responsive follow-up y E2E con backend seed.

## Bloqueadores
Ninguno para Int.2 ni para Login. Gap vigente: CORS si port !=5173. Pre-existentes tsc en Int.3 (`@tanstack/react-query`, `Correlativa`, `Card/Section`) no bloquean Int.2.

## Métricas
Build OK (50 módulos, 74kB gzip, Node 23.10); `features/catalogo` + `features/materias` DONE; `MateriaCard`/`ByteWidget`/`InicioScreen` entregados; tests 0 (vitest/msw no instalados, diferidos).
