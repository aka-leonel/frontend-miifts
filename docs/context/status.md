# Status — miIFTS Frontend

> Owner: Planner | Actualizado: 2026-09-12

## Estado
**SPRINT 4 · Integrante 2 (Catálogo · Shell responsive) — COMPLETE**, tickets S4-06 → S4-10 implementados y validados (build+tsc+eslint+Playwright contra backend real, base `dev @ fbf69d6`). El resto del Sprint 4 (Integrantes 1/3/4) no se tocó en este pase.

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
Sprint 4 Integrante 2 completo. Pendiente (otros carriles): S4-01→S4-05 (Integrante 1), S4-11 (Integrante 3), S4-16+ (Integrante 4). Sugerido para el equipo: decidir si se seedea backend-ifts con materias para "Análisis de Sistemas" (resolvería la causa real de S4-09) y revisar la regresión de Registro/Carrera antes mencionada.

## Bloqueadores
Ninguno para los tickets de Integrante 2. Gap vigente: CORS si el front no corre en :5173 (puerto default del scaffold Figma Make es 8443).

## Métricas
Build OK (74 módulos, 78kB gzip); tsc 0 errores; eslint sin issues nuevos (2 preexistentes ajenos en `vite.config.ts`/`convenios/hooks.ts`); validado en vivo con Playwright contra backend real (login admin, registro nuevo, ABM catálogo, badges de estado, responsive desktop/mobile).
