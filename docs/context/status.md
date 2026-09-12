# Status — miIFTS Frontend

> Owner: Planner | Actualizado: 2026-09-11

## Estado
**TESTING → COMPLETE** (parcial) — Integrante 2 (MATERIAS+INICIO) implementado y validado por Tester (2026-09-11). Fase 1 Auth: **T1.2 Login real completado y validado** este mismo día (ver implementation.md); T1.1 Registro y T1.3 rehidratación siguen pendientes. Contexto enriquecido con INTEGRACION_FRONT.md + REQUERIMIENTOS_FRONTEND_IA.md + openapi.json + SPRINT2/3_FRONT.md.

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
Int.2 COMPLETE. Pendiente real: T1.1 Registro (`RegistroScreen`/`CarreraScreen` siguen mock, no llaman a `POST /auth/registro`) y T1.3 rehidratación/guard automático. Nota aparte: `context/status.md` (mirror raíz, D012) quedó desactualizado desde 2026-09-08 — no se tocó en este cambio por no ser parte del pedido, pero conviene que el Architect decida si resincroniza el mirror o lo da de baja.

## Bloqueadores
Ninguno para Int.2 ni para Login. Gap vigente: CORS si port !=5173. Pre-existentes tsc en Int.3 (`@tanstack/react-query`, `Correlativa`, `Card/Section`) no bloquean Int.2.

## Métricas
Build OK (50 módulos, 74kB gzip, Node 23.10); `features/catalogo` + `features/materias` DONE; `MateriaCard`/`ByteWidget`/`InicioScreen` entregados; tests 0 (vitest/msw no instalados, diferidos).
