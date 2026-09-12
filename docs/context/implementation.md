# Implementation — miIFTS Frontend

> Owner: Planner | Sources: REQUERIMIENTOS §7-8, INTEGRACION §4-7

## 1. Estado Actual
Scaffold Vite+React+TS+PWA OK, App.tsx demo counter, pages/components/contexts/services/hooks vacíos (.gitkeep). Contrato openapi.json estable, VITE_API_URL configurado.

## 2. Plan Fases (ver REQUERIMIENTOS §7 tabla MVP)

### Fase 0 Fundaciones (1-2d)
- T0.1 api/client.ts: axios baseURL VITE_API_URL, Authorization Bearer, parser ApiError {detail,errors[]}, 401→clear→/login, no parse 204
- T0.2 api/schema.d.ts: `npx openapi-typescript docs/openapi.json -o src/api/schema.d.ts` + tipos §6
- T0.3 contexts/AuthContext: token+usuario localStorage, login/logout/me/verify, rol
- T0.4 components/Pagination<T>, Layout, ProtectedRoute, Toast

### Fase 1 Auth (bloquea resto)
- T1.1 Register: select GET /materias/carreras, valid password≥8 letra+número, nombre2-100, POST /auth/registro→POST /auth/login auto — **PENDIENTE** (`RegistroScreen`/`CarreraScreen` en App.tsx siguen mock, no pegan al backend).
- T1.2 Login: POST /auth/login guarda token+usuario, 401 toast — **DONE (2026-09-11)**. `src/features/auth/service.ts`+`hooks.ts` (`useLogin`), `LoginScreen` en App.tsx llama al backend real, guarda `miifts_token`/`miifts_usuario` (mismas claves que ya leían `api/scope.ts` y `features/perfil`), 401→toast error, sesión persiste al refrescar (`haySesion()` decide screen inicial). Validado build+tsc+eslint+Playwright contra backend real.
- T1.3 Rehidratar GET /auth/me en mount — **PENDIENTE** (no hay guard/rehidratación automática; si el token expira a mitad de sesión, no se limpia solo hasta el próximo 401 de una request).

### Fase 2 Plan Estudios (Pub, paralelo F3)
- T2.1 Carreras GET /materias/carreras + detalle GET /materias/carreras/{id} 404
- T2.2 Materias carrera GET /materias/carrera/{id} paginado
- T2.3 Buscar GET /materias/buscar?q required +anio+cuatrimestre + detalle GET /materias/{id} + correlativas GET /materias/correlativas/{id} con requiere

### Fase 3 Cursadas+Promedio (Auth token)
- T3.1 List GET /materias/usuario/{miId} + promedio GET /materias/promedio/{miId} 403 si ajeno
- T3.2 Alta POST /materias/usuario sin usuario_id, notas 1-10, 409 duplicado/carrera distinta
- T3.3 PATCH/DELETE /materias/cursada/{id} 404 si otro, estado derivado

### Fase 4 Recursos+Convenios
- T4.1 List filtros GET /recursos/?materia_id=&tipo=&desde=&hasta= + /recursos/materia/{id} + /usuario/{id} + GET /recursos/{id}
- T4.2 Create POST /recursos/ sin usuario_id titulo 1-150 HttpUrl + PUT/DELETE dueño 403
- T4.3 Convenios/TT lectura GET /convenios/* /talentotech/*; escritura admin 403

### Fase 5 Recordatorios
- T5.1 Agenda GET /recordatorios/?tipo=&desde=&hasta=&materia_id= paginado desc solo propios
- T5.2 Create POST /recordatorios/ fecha futura 422 + DELETE 404 si ajeno

### Fase 6 Pulido
Routing guards rol, manejo 401/403/404/409/422 (detail toast, errors[]→field), PWA icons, env prod, `npm run build && npm run lint`

## 3. Dependencias
T0→T1→(T2∥T3∥T4∥T5)→T6 ; T3/T5 requieren T1 token

## 4. Archivos por Tarea
api/* T0; contexts/AuthContext hooks/useAuth T0.3/T1; pages/Auth T1; pages/Catalog services/materias T2; pages/Cursadas services/cursadas T3; pages/Recursos services/recursos T4; pages/Recordatorios services/recordatorios T5

## 5. Riesgos
Backend down→MSW mock openapi.json; CORS port !=5173→pedir CORS_ORIGINS; 409/403 toasts

## 6. Done
Fase OK cuando endpoints responden, paginación y errores verificados build+lint pasan.

## 7. Plan Detallado — Integrante 2: MATERIAS + INICIO (para Planner → Developer)

> Fuente: SPRINT2_FRONT.md / SPRINT3_FRONT.md § Integrante 2. Prioridad ALTA, 4 días. Depende de Int.1 `<FormModal>` (ya entregado en `src/components/FormModal.tsx`) y de Int.4 `features/recordatorios/` para Inicio (importar `useRecordatorios`, no duplicar).

### 7.1 Estado actual (auditoría 2026-09-11)
- `features/catalogo/service.ts` + `hooks.ts` + `demo.ts`: **DONE** provisional con `DEMO_MODE` y `getMateriasDeCarrera(carreraId, {page,per_page})` → `GET /materias/carrera/{id}` OK. No tocar interfaz, consumido por `materiaUsuarioSpec`.
- `features/materias/service.ts` + `hooks.ts` + `demo.ts` + `estado.ts` + `materiaUsuarioSpec.ts` + `PromedioCard.tsx` + `MisMateriasScreen.tsx`: **DONE/PARCIAL** — CRUD cursadas (`GET /materias/usuario/{id}`, `GET /materias/promedio/{id}`, `POST /materias/usuario` sin usuario_id, `PATCH/DELETE /materias/cursada/{id}`) + `estadoLabel`/`estadoBadgeClasses` + `Paginador` + `409/422` vía `FormModal` OK. Falta extraer `MateriaCard`/`ByteWidget` y crear `InicioScreen`.
- `src/App.tsx`: aún mock con `materiasInit` hardcodeado; no rutea a `MisMateriasScreen` real ni a `Inicio` real. Intake del Developer: integrar sin pisar `features/recordatorios/` ni `FormModal`.
- Tokens Tailwind (`bg #111218`, `card #1A1B23`, etc.) y `apiClient`/`api/scope.ts` (`withUsuarioId`) ya listos.

### 7.2 Tareas delegables al Developer (orden estricto, sin duplicar módulos ajenos)

#### T2-CAT-01 · Verificación catálogo (0.5d) — NO RE-CREAR
- Archivos: `src/features/catalogo/service.ts`, `hooks.ts`
- Validar: `getMateriasDeCarrera` usa `per_page=100`, query correcta, tipado `Paginated<Materia>`, `hooks.useMateriasDeCarrera(carreraId)` sin TanStack (useAsync OK hasta migrar). Si output `docs/openapi.json` cambió, regenerar tipos pero mantener firma.
- Entrega: sin cambios o patch mínimo; Planner marca DONE.

#### T2-MAT-01 · Extraer `MateriaCard` + `ByteWidget` (1d)
- Archivos nuevos: `src/features/materias/MateriaCard.tsx`, `src/features/materias/ByteWidget.tsx`
- `MateriaCard({ cursada, onEdit, onDelete, onOpen })`: nombre (`cursada.materia.nombre ?? #id`), `<Chip>` con `estadoLabel`+`estadoBadgeClasses`, subtítulo notas (`nota_parcial_1/2/final` o "Sin notas"), botones Editar/Borrar (stopPropagation), click card → detalle. Solo presenta, sin fetch.
- `ByteWidget({ aprobadas, total })`: 4 estados Dormido/Despierto/Entusiasta/Graduado según `aprobadas/total` (reusa SVG/logica de `App.tsx:ByteCard`), barra progreso `pct=aprobadas/total*100`, colores tokens. Props derivadas de `useMisMaterias` en padre, no fetch interno. Exportar en `features/materias/index.ts` para que Int.3 importe `estadoLabel`.
- Restricción: NO crear `FormModal`, `ListState`, etc. (dueño Int.1).

#### T2-MAT-02 · Refactor `MisMateriasScreen` para usar nuevos componentes (0.5d)
- Archivo: `src/features/materias/MisMateriasScreen.tsx`
- Reemplazar inline cards por `<MateriaCard>`, extraer cálculo `aprobadas = items.filter(c=>c.estado==='aprobada').length` para `<ByteWidget>` + `<PromedioCard>` arriba. Mantener chips filtro cliente (`Todas/En curso/Regular/Aprobada/Pendiente`), `Paginador`, FAB `+` → `FormModal spec={materiaUsuarioSpec}` con `409 toast` / `422 fields`, `ConfirmDialog` borrar. Invalidación `onSuccess` → `refetch` lista+promedio.
- Test: `409` duplicado/carrera distinta, `422` nota 1-10.

#### T2-INI-01 · Pantalla `/` Inicio (Panel) (1d)
- Archivo nuevo: `src/features/materias/InicioScreen.tsx` (o `src/pages/Inicio/` re-export)
- Composición: `useMisMaterias(1)` + `usePromedio()` → `<ByteWidget>` + `<PromedioCard>` reusados arriba. Sección "Próximos recordatorios": `import { useRecordatorios } from "../recordatorios/hooks"` con `{ desde: hoyISO }` (solo lectura, tap → `onOpenMateria(materia_id)`), dot por tipo, vacío → `EmptyState`. Sección "Accesos rápidos / Mis materias": carrusel horizontal de 3-4 `<MateriaCard>` compactas o chips. Header bienvenida `usuario.nombre` desde `api/scope:getMiUsuario()` / `useAuth`.
- NO crear `features/recordatorios/service.ts` ni `RecordatorioCard` — importar de Int.4. Si Int.4 aún no entregó, usar `demo.ts` de recordatorios con TODO comment y fallback EmptyState.
- Arquetipo Panel (§2.5 INTEGRACION), sin tabs propias (usa `AppShell` BottomTabs).

#### T2-INT-01 · Integración Router/AppShell (0.5d)
- Archivo: `src/App.tsx` (o `src/main.tsx` router)
- Reemplazar `InicioScreen` mock y `MateriasScreen` mock por `features/materias/InicioScreen` y `MisMateriasScreen` reales. Mantener `BottomTabs` 5 destinos, `RutaProtegida` ya existente. Lazy si aplica. Verificar `DEMO_MODE=true` funciona sin backend; `VITE_API_URL` con `apiClient`.
- NO tocar `features/convenios`, `features/recursos`, `features/recordatorios`.

#### T2-OPT-01 · (Si sobra) ABM catálogo admin `/admin/catalogo` solo `usuario.rol==='admin'` — opcional, no bloquea DONE.

### 7.3 Criterios de aceptación para Tester (validar contra SPRINT § Criterios)
1. `getMateriasDeCarrera` + `useMateriasDeCarrera` responden `Paginated<Materia>` paginado, fuera rango `items:[]`.
2. `getMisMaterias`/`getPromedio`/`create/update/deleteCursada` sin `usuario_id` en body, `409`/`422` mapeados, `estado` derivado OK.
3. `MateriaCard`/`ByteWidget`/`PromedioCard` presentacionales con tokens Tailwind, `estadoLabel` exportado.
4. `/materias` lista paginada + chips filtro cliente + FAB modal + editar/borrar con `ConfirmDialog`, promedio/Byte reactivos.
5. `/` Inicio reusa mismos widgets + próximos recordatorios vía `useRecordatorios` importado, sin duplicar service.
6. Contrato: `Paginated` + `Paginador`, `detail→toast`, `errors[]→fields`, nunca `usuario_id` en POST, wrapper único `apiClient`.
7. `npm run build && npm run lint` verdes.

### 7.4 Orden de ejecución Developer
T2-CAT-01 → T2-MAT-01 → T2-MAT-02 → T2-INI-01 → T2-INT-01 → (T2-OPT-01)
Dependencias: T2-MAT-02 bloquea T2-INI-01 (reuso widgets); T2-INI-01 depende de `useRecordatorios` de Int.4 (si no disponible, mock).
