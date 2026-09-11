# Status — miIFTS Frontend

> Owner: Planner | Actualizado: 2026-09-08

## Estado
**PLANNING** — Contexto enriquecido con docs/INTEGRACION_FRONT.md + docs/REQUERIMIENTOS_FRONTEND_IA.md + openapi.json. Listo para definir tareas y arquitectura detallada.

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
- [ ] Esperando prompt usuario: selección tareas → estructurar arquitectura detallada

## Próximo paso
Usuario definirá tareas a tomar; Architect detallará docs/context/architecture.md y decisions.md según selección.

## Bloqueadores
Ninguno. Gap vigente: CORS si port !=5173.

## Métricas
Build template OK; tests 0.
