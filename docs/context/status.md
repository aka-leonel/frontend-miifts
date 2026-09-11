# Status — miIFTS Frontend

> Owner: Planner | Actualizado: 2026-09-11

## Estado
**TESTING → COMPLETE** — Integrante 2 (MATERIAS+INICIO) implementado y validado por Tester (2026-09-11). Contexto enriquecido con INTEGRACION_FRONT.md + REQUERIMIENTOS_FRONTEND_IA.md + openapi.json + SPRINT2/3_FRONT.md.

## Qué se agregó (este update)
- requirements.md: convenciones §3 shapes/paginación/códigos, validaciones por dominio, modelos TS §6, tabla MVP §7, reglas IA §8 y Qué NO hacer §9
- architecture.md: integración HTTP, Sprint2 gaps, mapeo estructura ↔ endpoints
- decisions.md: D013 Sprint2, D009 TanStack diferido
- implementation.md: fases alineadas a §7 MVP con validaciones y 409/422
- testing.md: matriz por dominio §5 con códigos y ownership
- Mirror docs/context/ sincronizado

## Progreso
- [x] context/ + docs/context/ 6 docs creados
- [x] Enriquecimiento con INTEGRACION+REQUERIMIENTOS
- [x] Int.2 T2-CAT-01→T2-INT-01 implementado (MateriaCard, ByteWidget, InicioScreen, MisMateriasScreen refactor, App integración)
- [x] Tester validó Int.2: build OK (vite 8 con Node 23.10), tsc 0 errores Int.2, criterios §7.3 PASS
- [x] Dependencias instaladas (`npm install` Node 23.10, 45 packages)

## Próximo paso
Int.2 COMPLETE. Siguiente: Int.3/Int.4 según SPRINT, o pulido E2E con backend `localhost:8000` + `VITE_DEMO_MODE=false`.

## Bloqueadores
Ninguno para Int.2. Gap vigente: CORS si port !=5173. Pre-existentes tsc en Int.3 (`@tanstack/react-query`, `Correlativa`, `Card/Section`) no bloquean Int.2.

## Métricas
Build OK (50 módulos, 74kB gzip, Node 23.10); `features/catalogo` + `features/materias` DONE; `MateriaCard`/`ByteWidget`/`InicioScreen` entregados; tests 0 (vitest/msw no instalados, diferidos).
