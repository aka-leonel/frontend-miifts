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

## 8. Plan Detallado — Integrante 4: PERFIL · CONVENIOS · UX (Sprint 4)

> Fuente: `docs/SPRINT4_FRONT.md` § Integrante 4 (S4-16 a S4-20) + `docs/INTEGRACION_FRONT.md` §1.6-1.7/§2.8-2.11. **Stack real sin mocks:** Vite + React + TS + React Router + TanStack Query (o `useAsyncQuery` vigente) + Tailwind + `apiClient` (`VITE_API_URL=http://localhost:8000`, `Authorization: Bearer`, `ApiError` con `detail`/`errors[]`, `401→logout`, no parse `204`). `DEMO_MODE=false` obligatorio — prohibido `demo.ts` / arrays hardcodeados / `DEMO_USUARIO` como fuente primaria. Todos los datos poblados desde endpoints reales.

### 8.1 Estado actual (auditoría 2026-09-14)
- `features/perfil/service.ts` + `hooks.ts` + `PerfilScreen.tsx`: **PARCIAL con bug S4-16** — `getAuthMe()` → `GET /auth/me` real OK cuando `DEMO_MODE=false`, pero `PerfilScreen` mantiene `<select>` de carrera editable y `handleSave()` finge `✓ Guardado` sin `PATCH /auth/me` (gap §1.7, aún no existe en backend). Falta bloquear edición.
- `features/convenios/service.ts` + `hooks.ts` + `ConveniosScreen.tsx`: **PARCIAL con bug S4-17/S4-18** — `getConvenios()`/`getTalentoTech()` ya mapean `Paginated<ConvenioApi>`/`TalentoTechApi` → `ConvenioItem` y pegan a `/convenios/` y `/talentotech/` públicos OK, pero `DEMO_MODE` retorna arrays `universidades`/`talentoTech` hardcodeados (4+4 items, `demoPaginate`, `delay`) que ocultan fallos silenciosos y vacíos reales. `ConveniosScreen` usa `ListState`/`Paginador` OK pero no distingue `ErrorState` de vacío ni valida paginación real.
- `features/recordatorios/service.ts` + `hooks.ts` + `RecordatoriosScreen.tsx`: **DONE real** — `getRecordatorios(filtros)` único dueño Int.4 (`GET /recordatorios/?tipo=&desde=&hasta=&materia_id=&page=&per_page=` con token, `POST /recordatorios/` sin `usuario_id` fecha futura `422`, `DELETE /recordatorios/{id}` `204`/`404`) consumido también por `InicioScreen` y `MateriaDetalle`. Mantener, solo quitar rama `DEMO_MODE`.
- `src/App.tsx`: **CON DEUDA S4-19** — `materiasInit`/`recursosInit`/`recordatoriosInit`/`carreras` hardcodeados (líneas ~54-82) + `DetalleScreen` mock con estado local (`useState` recursos/recordatorios, `ModalMateria/Recurso/Recordatorio` duplicados) siguen como código muerto; `InicioReal`/`MisMateriasReal`/`RecordatoriosFeatureScreen`/`ConveniosFeatureScreen`/`PerfilFeatureScreen` ya integrados arriba pero la shell mantiene `maxWidth:430` fijo (S4-20).
- `InicioScreen.tsx`/`MisMateriasScreen.tsx` usan `getMiUsuario()`/`api/scope.ts` sin `GET /auth/me` en algunos casos — unificar a `useAuthMe()` real.
- Tokens Tailwind (`bg #111218`, `card #1A1B23`, `surface2 #2A2B36`, `primary #8C7DFF`, etc.) + `apiClient` + `ListState`/`Paginador`/`EmptyState`/`ErrorState` existentes.

### 8.2 Principios para el Developer (no mocks)
1. `VITE_DEMO_MODE=false` y `VITE_API_URL=http://localhost:8000` — sin `import { DEMO_MODE }` ni `demo.ts` en `perfil`/`convenios`/`recordatorios`. Si `DEMO_MODE` se mantiene por S4-04 global, no usarlo en estas features.
2. Componentes usan **hooks**, nunca `service.ts` ni `apiClient` directo (§2.8 INTEGRACION). `fieldSpec` inexistentes aquí no aplican (perfil es solo visual hasta `PATCH /auth/me`).
3. Validar contra **backend real con seed** (`python seed.py` si aplica) — colecciones vacías son válidas (`items:[]`, `EmptyState`), no se rellenan con fallback.
4. `Paginated<T>` estricto, `page`/`per_page` reales, `total_pages` gobierna `Paginador`. Errores `ApiError.detail`→toast, `422 errors[]`→field, `401`→`apiClient` ya hace logout, `403`/`404`→`EmptyState` específico.

### 8.3 Tareas delegables al Developer (orden estricto, sin duplicar módulos ajenos)

#### T4-PERFIL-01 · S4-16 Bloquear cambio de carrera en Perfil (0.5d) — Alta
- Archivos: `src/features/perfil/PerfilScreen.tsx`, `src/features/perfil/service.ts`, `src/features/perfil/hooks.ts`
- Cambios: `service.ts` solo `getAuthMe()` real (`apiClient<Usuario>("/auth/me")` sin rama demo, tipo `Usuario` de `src/api/types.ts` generado por `openapi-typescript`). `hooks.ts` expone `useAuthMe()` con `loading`/`error`/`data` (mantener `useAsyncQuery`). `PerfilScreen.tsx`: `<select>` carrera → `disabled`/`readOnly` + `cursor-not-allowed`/`opacity-60`, `value` desde `me.data.carrera_id` (y nombre carrera vía `useCarreras` solo lectura); `<input nombre>` también `readOnly`/`disabled` (no hay `PATCH /auth/me`); botón "Guardar cambios" → eliminar lógica `setSaved(true)/✓ Guardado` falsa, reemplazar por `disabled` + tooltip/banner "Edición deshabilitada hasta que esté disponible PATCH /auth/me (§1.7)" o ocultar botón; mantener "Cerrar sesión" real (`localStorage.removeItem("miifts_token"/"miifts_usuario")` → `onCerrarSesion()` / `useAuth().logout()` cuando exista). Estados: `loading`→`Skeleton`, `error`→`ErrorState` con retry `me.refetch()`, carrera sin datos→fallback texto.
- No tocar: `FormModal` (dueño Int.1), `updateAuthMe` no existe.
- Entrega: perfil 100% lectura real, sin mentir con guardado falso.

#### T4-CONV-01 · S4-17 Fix Convenios no trae datos (1d) — Alta
- Archivos: `src/features/convenios/service.ts`, `hooks.ts`, `ConveniosScreen.tsx`, `src/api/types.ts`
- Validación real: levantar backend `http://localhost:8000` con datos seed, `GET /convenios/?page=1&per_page=20` y `GET /talentotech/?page=1&per_page=20` (pub, `auth:false`) deben poblar; si `items:[]` → `EmptyState` "No hay convenios ..." con acción, no fallback; si fetch falla → `ErrorState` con `detail` toast + retry. Probar paginación fuera de rango (`page=999` → `items:[]` + `total` real), `totalPages` real. Verificar que silencio no es bug: loggear `ApiError` y mostrar `ErrorState`, no `[]` silencioso.
- `hooks.ts` mantener `mounted` guard pero asegurar `loading` correcto y `refetch` expuesto para `ListState onRetry`.
- `ConveniosScreen.tsx` ya usa `ListState`/`Paginador` — asegurar `active.error` renderiza `ErrorState`, `items.length===0` sin `loading` renderiza `EmptyState` (no grid vacío), tabs Universidades/TalentoTech conmutan `page=1` y mantienen query keys `['convenios',{page}]` / `['talentotech',{page}]`.

#### T4-CONV-02 · S4-18 Sacar hardcode de convenios/service.ts (1d) — Media — depende S4-04
- Archivo: `src/features/convenios/service.ts` (dueño Int.4, no tocar `features/catalogo`/`materias`)
- Borrar: `const universidades` (4 items), `const talentoTech` (4 items), `delay`, `demoPaginate`, toda rama `if (DEMO_MODE)` en `getConvenios`/`getTalentoTech`, import `DEMO_MODE`. Mantener solo: tipos `ConvenioApi`/`TalentoTechApi`, `mapConvenio`/`mapTalentoTech`, `toConvenioPage`, `getConvenios({page,carrera_id})` → `apiClient<Paginated<ConvenioApi>>` con `path` `/convenios/` o `/convenios/carrera/{id}` + `?page=`, `getTalentoTech({page,categoria,carrera_id})` → `apiClient<Paginated<TalentoTechApi>>` con paths `/talentotech/` / `/talentotech/carrera/{id}` / `/talentotech/categoria/{cat}`. Tipar `Paginated` de `src/api/types.ts`, asegurar `per_page` default 20 si se requiere y `page` clamped `>=1`.
- Coordinar con S4-04 (limpieza `DEMO_MODE` global de Int.1) — no reintroducir fallback.
- Entrega: `service.ts` <100 líneas, 0 datos mock, 100% backend real.

#### T4-CLEAN-01 · S4-19 Borrar recursosInit / recordatoriosInit (1d) — Media
- Archivo principal: `src/App.tsx`
- Borrar: `const recursosInit` (4 items), `const recordatoriosInit` (4 items), `const materiasInit` si ya no lo usa `DetalleScreen` mock (verificar — `ModalMateria` opciones lo usa), `const carreras` mock (usar `useCarreras` real si se mantiene `CarreraScreen`). Tras borrar, `DetalleScreen` mock (líneas ~488-602 con `useState(recursosInit)`/`recordatoriosInit`, `ModalRecurso`/`ModalRecordatorio` duplicados) queda sin datos — opciones: (a) eliminar `DetalleScreen` completo y dejar solo `MateriaDetalleFeatureScreen` (cuando `materiaIdSeleccionada==null` mostrar `EmptyState` "Seleccioná una materia") o (b) mantener shell visual pero alimentar con `useRecursos`/`useRecordatorios` reales. Confirmar con `grep recursosInit|recordatoriosInit` que ninguna pantalla real los importe.
- Limpiar imports muertos, tipos locales `interface Recurso/Recordatorio` si ya no se usan (reemplazados por `api/types.ts`).

#### T4-RESP-01 · S4-20 Responsive de Inicio / Recordatorios / Convenios / Perfil (1.5d) — Media
- Archivos: `src/features/materias/InicioScreen.tsx`, `src/features/recordatorios/RecordatoriosScreen.tsx`, `src/features/convenios/ConveniosScreen.tsx`, `src/features/perfil/PerfilScreen.tsx`, `src/App.tsx` (shell), `src/index.css`
- Shell: reemplazar `maxWidth:430` fijo + `style` inline por layout responsive Tailwind: `max-w-430 md:max-w-3xl lg:max-w-5xl mx-auto w-full px-4 sm:px-6`, `BottomTabs` fija con `safe-area`. Grids: `Inicio` — `ByteWidget`/`PromedioCard` en `grid-cols-1 md:grid-cols-2`, carrusel materias `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3` o `flex overflow-x-auto` con `snap`; `Recordatorios` — `space-y-2.5` → `grid gap-3 md:grid-cols-2` para cards; `Convenios` — `space-y-3` → `grid gap-3 sm:grid-cols-2 lg:grid-cols-3`; `Perfil` — `px-6 pt-14` → `container mx-auto max-w-lg md:max-w-2xl`, cards `rounded-2xl`. Verificar `sm`/`md`/`lg` breakpoints sin overflow horizontal, FAB `right-[calc(50%-190px)]` fijo → `fixed bottom-24 right-4 md:right-6`.
- Tokens intactos, sin `430px` dependiente.

#### T4-SERVICE-01 · Endurecer recordatorios/perfil sin demo (incluido en anteriores, 0.25d)
- Archivos: `src/features/recordatorios/service.ts`, `src/features/perfil/service.ts`
- Eliminar ramas `DEMO_MODE` / `demo*.ts` restantes, asegurar `getRecordatorios` construye `URLSearchParams` con `page/per_page/tipo/desde/hasta/materia_id`, `apiClient` con `auth:true` (token), `create/delete` sin `usuario_id`. Regenerar tipos si `docs/openapi.json` cambió: `npx openapi-typescript docs/openapi.json -o src/api/schema.d.ts`.

### 8.4 Criterios de aceptación para Tester (validar contra backend real, sin mocks)
1. Perfil: `GET /auth/me` real puebla nombre/email/carrera; `<select>` carrera y nombre en solo lectura, sin `✓ Guardado` falso; `Cerrar sesión` limpia token y redirige a login; `Skeleton`/`ErrorState` OK.
2. Convenios: `GET /convenios/` y `GET /talentotech/` reales con datos seed paginan (`page`/`per_page`/`total_pages`), vacío → `EmptyState`, error red/422 → `ErrorState` + retry; 0 arrays hardcodeados en `service.ts` (`grep universidades|talentoTech|DEMO_MODE` vacío en ese archivo).
3. Recordatorios: `GET /recordatorios/?desde=hoy` real en Inicio y `GET /recordatorios/` en Agenda, crear/borrar con invalidación y `204` sin parse, `422 fecha futura` mapea a field, sin `demo.ts`.
4. Limpieza: `src/App.tsx` sin `recursosInit`/`recordatoriosInit` (`grep` 0 hits), `DetalleScreen` mock eliminado o migrado a datos reales, sin imports muertos.
5. Responsive: Inicio/Recordatorios/Convenios/Perfil sin `maxWidth:430` fijo ni frame vertical hardcodeado; `sm` (640px), `md` (768px), `lg` (1024px) sin scroll horizontal, grids adaptables verificados Playwright/Chromium.
6. Contrato global: `apiClient` único, `Authorization: Bearer` en perfil/recordatorios, públicas sin auth en convenios, `Paginated` + `Paginador`, `detail→toast`, `errors[]→fields`, `npm run build && tsc --noEmit` verdes, `VITE_DEMO_MODE=false` por defecto.

### 8.5 Orden de ejecución Developer
T4-PERFIL-01 → T4-CONV-01 → T4-CONV-02 → T4-CLEAN-01 → T4-RESP-01 (+ T4-SERVICE-01 en paralelo a T4-CONV-02)
Dependencias: T4-CONV-02 bloqueado por T4-CONV-01 (validar datos reales antes de borrar fallback); T4-CLEAN-01 independiente pero antes de T4-RESP-01 (evitar responsive sobre código muerto); T4-PERFIL-01 independiente al inicio.

## 9. Plan Detallado — Sprint 5 Integrante 2: Perfil editable (S5-05 → S5-08)

> Fuente: `docs/SPRINT5_FRONT.md` § Integrante 2 + `docs/context/requirements.md` FR7 + `decisions.md` D014. **Stack real sin mocks:** Vite+React+TS+Tailwind+`apiClient` (`VITE_API_URL=http://localhost:8000`, `Authorization: Bearer`, `ApiError {detail,errors[]}`, `401→logout`, `useAuth()` fuente única). Prioridad Alta/Media, ≈3.5d. **Depende de S5-03** (identidad unificada en `useAuth()`).

### 9.1 Estado actual (auditoría 2026-09-15)
- `src/api/types.ts`: **OK** — `Usuario {id,nombre,apellido,email,carrera_id,fecha_registro,rol}`; falta `UsuarioUpdate = Partial<Pick<Usuario,"nombre"|"apellido"|"email">>` para PATCH.
- `src/api/client.ts` → `src/lib/apiClient.ts`: wrapper único con `auth:true` agrega `Bearer`, parser `errors[]`→`Record`, `401→setUnauthorizedHandler(logout)`, `204` sin parse. Listo.
- `src/auth/AuthContext.tsx`: **PARCIAL** — `usuario/token/cargando/verificandoSesion/login/registro/logout` OK, persiste `miifts_token`/`miifts_usuario` via `auth/storage.ts`, `setUnauthorizedHandler(logout)` y timers expiración. **Falta** método `actualizarPerfil(patch)` o `setUsuario` expuesto para S5-07; hoy solo `meRequest()` en mount actualiza al arrancar.
- `src/auth/api.ts`: `loginRequest`, `registroRequest`, `meRequest() → GET /auth/me` OK. **Falta** `updateMeRequest(patch) → PATCH /auth/me`.
- `src/features/perfil/service.ts`: solo `getAuthMe() → apiClient<Usuario>("/auth/me")` sin rama demo. **Falta** `updateAuthMe(patch: UsuarioUpdate) → apiClient<Usuario>("/auth/me", {method:"PATCH", body:patch})`.
- `src/features/perfil/hooks.ts`: `useAuthMe()` con `useAsync(() => getAuthMe())` expone `data/loading/error/refetch`. No usa `useAuth()` aún.
- `src/features/perfil/PerfilScreen.tsx`: **BLOQUEADO S4-16** — 3 inputs `readOnly disabled opacity-80`, `useState nombre` sync con `me.data`, carrera `readOnly` vía `useCarreras + carreraNombre` OK, banner `amber-500/10 "PATCH /auth/me (§1.7)"`, `Skeleton`/`ErrorState` con `me.refetch()` OK, `handleLogout` limpia `localStorage` + `onCerrarSesion()`. **No hay edición**: falta modo edición, validación, `PATCH`, `useApiForm`/`useToast`, sincronización. 0× `password` (S5-08 ya cumplido en este commit).
- `src/hooks/useApiForm.ts` + `src/hooks/useToast.ts` + `src/components/EntityForm.tsx`: kit existente, patrón `409 toast / 422 fields` ya usado en `materiaUsuarioSpec`/`recursoSpec` — reusar.
- Tokens Tailwind `bg #111218, card #1A1B23, violet #8C7DFF, lime #CFFF5E` + `Skeleton/ErrorState` existentes.

### 9.2 Principios para el Developer (no mocks, no scope-creep)
1. `PATCH /auth/me` con `auth:true`, body **solo** `nombre/apellido/email` parciales; nunca `carrera_id` ni `password`. Si backend responde `openapi.json` sin PATCH, igual implementar (SPRINT5 confirma que ya existe).
2. Componentes usan **hooks/service** (`updateAuthMe`), nunca `fetch` directo. `PerfilScreen` consume `useAuth().usuario` como fallback/inicial, pero `GET /auth/me` sigue siendo fetch de verdad (S5-03).
3. Sin `DEMO_MODE`/`demo.ts`; datos reales. Validación cliente mínima (trim, required, email regex) + servidor `422` mapea a field.
4. No tocar `features/recordatorios`, `features/convenios`, `SidebarNav` (dueños Int.3/5). No agregar ruta nueva.

### 9.3 Tareas delegables al Developer (orden estricto)

#### T5-PERFIL-01 · S5-05 Editar nombre/apellido/email en Perfil (2d) — Alta — depende S5-03
- Archivos: `src/api/types.ts`, `src/auth/api.ts`, `src/auth/AuthContext.tsx`, `src/auth/storage.ts`, `src/features/perfil/service.ts`, `src/features/perfil/hooks.ts`, `src/features/perfil/PerfilScreen.tsx`
- `api/types.ts`: agregar `export type UsuarioUpdate = Partial<Pick<Usuario,"nombre"|"apellido"|"email">>;` (no incluir `carrera_id`/`rol`/`password`).
- `auth/api.ts`: agregar `export function updateMeRequest(patch: UsuarioUpdate): Promise<Usuario> { return apiClient<Usuario>("/auth/me", {method:"PATCH", body: patch, auth:true}); }`
- `features/perfil/service.ts`: agregar `export async function updateAuthMe(patch: UsuarioUpdate): Promise<Usuario> { return apiClient<Usuario>("/auth/me", {method:"PATCH", body: patch}); }` (o reexportar `updateMeRequest`). Mantener `getAuthMe`.
- `auth/AuthContext.tsx`: exponer actualización sin recarga para S5-07: agregar `actualizarUsuario: (u: Usuario) => void` o `actualizarPerfil: (patch: UsuarioUpdate) => Promise<Usuario>` que llame `updateMeRequest`, luego `setUsuarioGuardado(u)` + `setUsuarioState(u)` + `pushToast` opcional. Alternativa mínima: exponer `setUsuarioState` via `setUsuarioGuardado` + helper `refreshAuthMe()` que hace `meRequest().then(set...)`. Elegir una y documentar en context value. No romper `login/registro/logout` existentes.
- `features/perfil/PerfilScreen.tsx`: transformar de readOnly a editable:
  - Estado: `form {nombre, apellido, email}` controlado, `isEditing` boolean (o siempre editable con `Guardar` disabled si no cambió), `saving` boolean, `fieldErrors` via `useApiForm()`, `pushToast` via `useToast()`.
  - Inicialización: `useEffect` cuando `me.data` cambia → `setForm({nombre: me.data.nombre, apellido: me.data.apellido ?? "", email: me.data.email})`; también `queueMicrotask` OK pero preferir `useEffect` directo.
  - Carrera: mantener `<input value={carreraNombre} readOnly disabled cursor-not-allowed opacity-60>` — nunca editable, no enviar en PATCH.
  - Validación cliente: `nombre.trim().length>=2 && <=100`, `apellido` igual, `email` regex simple; si falla, set `fieldErrors` local y no fetch.
  - Guardar: `onClick Guardar` → `clearErrors()` → `await updateAuthMe({nombre: form.nombre.trim(), apellido: form.apellido.trim(), email: form.email.trim()})` solo con campos cambiados (diff vs `me.data`); `setSaving(true/false)`. Éxito → `pushToast("Perfil actualizado","success")` + sincronizar (ver T5-PERFIL-03) + `me.refetch()` o `actualizarUsuario`.
  - UI estados: `me.loading&&!me.data → Skeleton` (ya existe); `me.error → ErrorState retry` (ya existe); form habilitado cuando `!saving`; botón `Guardar` muestra `Guardando...` + `disabled` si `saving` o `!hasChanges`; carrera `disabled` siempre; inputs editables con `border-violet` en foco, `border-red` si `fieldErrors[campo]`.
  - No agregar `<input type="password">` ni botón "Cambiar contraseña" (S5-08).
- No tocar: `FormModal` (dueño Int.1) no aplica acá — Perfil es inline, no modal. Pero reusar `useApiForm` pattern.

#### T5-PERFIL-02 · S5-06 Manejo de errores del guardado (0.5d) — Alta — depende T5-PERFIL-01
- Archivo principal: `src/features/perfil/PerfilScreen.tsx` (lógica catch)
- En `catch (e)`:
  - Si `e instanceof ApiError && e.status===422` → `applyApiError(e)` mapea `errors` → `fieldErrors` por campo (`nombre`/`apellido`/`email`). No toast genérico si hay fields.
  - Si `status===409` → `pushToast(e.detail || "Email ya registrado","error")` (email duplicado). Limpiar `fieldErrors`.
  - Otros `401` ya dispara `logout` vía `apiClient`; no duplicar. `403/500` → `pushToast(detail,"error")`.
  - Mantener `fieldErrors` visibles bajo cada input (`<span className="text-xs text-red-500">{fieldErrors.email}</span>`).
- Reusar mismo patrón que `src/components/FormModal.tsx:73 applyApiError` y `materiaUsuarioSpec onError:{409:toast,422:fields}`.
- Test manual: enviar `email` existente → 409 toast; `nombre="a"` → 422 field; vacío → cliente no fetch.

#### T5-PERFIL-03 · S5-07 Sincronizar usuario actualizado (0.5d) — Media — depende T5-PERFIL-01
- Archivos: `src/auth/AuthContext.tsx`, `src/auth/storage.ts`, `src/features/perfil/PerfilScreen.tsx`
- Tras `PATCH 200` que devuelve `Usuario` actualizado:
  - `AuthContext`: `setUsuarioGuardado(nuevoUsuario)` (`localStorage.setItem("miifts_usuario", JSON.stringify(u))`) + `setUsuarioState(nuevoUsuario)` para que `useAuth().usuario` cambie al instante.
  - Si se expuso `actualizarPerfil`, que lo haga internamente; si no, `PerfilScreen` llama `setUsuarioGuardado` + `me.refetch()` y además notifica a `AuthContext` vía prop o context (preferir método en context para no duplicar `localStorage` keys).
  - Verificar en `InicioScreen` (bienvenida `usuario.nombre`), avatar `iniciales()`, `MisMateriasScreen` no usan `getMiUsuario()` legacy (S5-03 ya migrado; si no, documentar que dependerán de `useAuth()` tras este ticket).
  - No requerir `window.location.reload()`. Probar: cambiar nombre → navegar a Inicio sin reload → nombre nuevo visible.
- Keys: si `useAuthMe` usa TanStack Query futura, invalidar `['auth-me']`; hoy con `useAsync`, basta `me.refetch()` + context update.

#### T5-PERFIL-04 · S5-08 Confirmar que no hay forma de tocar contraseña desde Perfil (0.5d) — Baja — depende T5-PERFIL-01
- Archivos: `src/features/perfil/PerfilScreen.tsx`, `src/features/perfil/service.ts`, `src/auth/api.ts`
- Verificación negativa: `grep -r "password" src/features/perfil/` y `grep -r "contrase" src/features/perfil/` deben dar 0 hits. No debe existir `<input type="password">`, `Button "Cambiar contraseña"`, ni `apiClient(..., {body:{password}})`.
- Si revisión encuentra campo agregado "para completar CRUD", eliminarlo y dejar comentario `// S5-08: password va por flujo Olvidé mi contraseña (Int.4), no en Perfil`.
- `service.ts`/`auth/api.ts` nunca envían `password` en `updateAuthMe`.
- Entrega: archivo `PerfilScreen.tsx` <300 líneas, 3 campos editables + carrera readOnly + logout, 0 referencias a password.

### 9.4 Criterios de aceptación para Tester (validar contra backend real, sin mocks)
1. **S5-05 Edición:** `GET /auth/me` pobla form; editar `nombre/apellido/email` + `Guardar` → `PATCH /auth/me` con body parcial, `200` devuelve `Usuario` y persiste (recargar → datos nuevos). Carrera `input disabled cursor-not-allowed opacity-60`, no se envía. Sin campo password.
2. **S5-06 Errores:** `422` (nombre<2, email inválido) → `fieldErrors` bajo input (no toast); `409` email duplicado → toast `detail`; `saving` deshabilita botón. Mismo canal que `useApiForm` (ver `src/hooks/useApiForm.ts:11`).
3. **S5-07 Sync:** Tras 200, `useAuth().usuario.nombre` + `localStorage miifts_usuario` actualizados sin reload; `InicioScreen` bienvenida/avatar reflejan cambio inmediato. `me.refetch()` o context update invocado.
4. **S5-08 No-contraseña:** `grep password src/features/perfil` vacío; `service.ts` no importa ni envía `password`; UI sin botón/input password. Veredicto binario pass/fail.
5. **Contrato global:** `apiClient` único `Authorization: Bearer`, `Paginated` no aplica acá pero `ApiError` parser OK, `401→logout`, `useToast`/`useApiForm` reusados, `npm run build && npx tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 6.0` 0 errores, `VITE_API_URL` configurable.
6. **No regresión S4-16:** `Skeleton`/`ErrorState` + `carreraNombre` fallback `Carrera #id` siguen OK; `Cerrar sesión` limpia `miifts_token`/`miifts_usuario` → `onCerrarSesion()`.

### 9.5 Orden de ejecución Developer
T5-PERFIL-01 → T5-PERFIL-02 → T5-PERFIL-03 → T5-PERFIL-04
Dependencias: T5-PERFIL-01 bloquea 02/03/04; 02 y 03 pueden ir en paralelo tras 01; 04 es verificación final tras 01. **Bloqueante externo:** S5-03 (Integrante 1) debe entregar `useAuth().usuario` unificado antes de T5-PERFIL-03, si no Perfil quedará con `getMiUsuario()` legacy y la sync no se verá en Inicio.

## 10. Plan Detallado — Extensión: Cambio de contraseña desde Perfil (FR8, gap backend real)

> Fuente: auditoría 2026-09-16 live `backend-ifts/app/features/auth/{router,schema,service}.py` + `docs/openapi.json` + `requirements.md` FR8 + `SPRINT5_FRONT.md` S5-08/S5-12. **Gap crítico:** frontend asume `POST /auth/change-password {current_password,new_password}` (D015/FR8, `CHANGE_PASSWORD_PATH` en `src/auth/api.ts:40`), pero **backend no lo expone** — solo existe `POST /auth/forgot-password {email}` y `POST /auth/reset-password {token,password}` (ver `router.py:56-69`). Docker daemon offline (`npipe` no disponible) impide levantar `http://localhost:8000` para re-test live; validación por código.
> **Decisión SPRINT5 original (S5-08):** no tocar contraseña desde Perfil — va por "Olvidé mi contraseña" (Int.4). FR8 es extensión solicitada por usuario que contradice S5-08 y requiere endpoint nuevo.

### 10.1 Estado actual (auditoría 2026-09-16 — revisada)
- `src/auth/api.ts`: `CHANGE_PASSWORD_PATH="/auth/change-password"` + `changePasswordRequest → apiClient<void>(PATH,{POST,auth:true})` **listo pero contra endpoint inexistente** → hoy 404 si se clickea Guardar.
- `src/api/types.ts`: `ChangePasswordRequest {current_password,new_password}` OK.
- `src/features/perfil/PerfilScreen.tsx`: modal limpio 3× `type=password` + validación cliente (current requerido, next ≥8 letra+número, confirm===next) + `pwdSaving` + `ApiError` 422→fields/401→toast + sin hash frontend — **UI lista, integración rota**.
- Backend real: `PerfilUpdate` solo `{nombre?,apellido?}` (schema.py:134), `forgot/reset-password` con `password_reset_tokens` tabla, sin `change-password`. `SPRINT5 § Int.4 S5-12→S5-15` es el flujo oficial.
- `status.md`: marcaba IMPLEMENTATION READY asumiendo backend pendiente; debe pasar a **BLOCKED/BACKEND_GAP** hasta decisión Architect.

### 10.2 Principios / Decisiones para Planner→Architect (escalar antes de codear)
1. **No inventar endpoint en front:** cambiar solo `CHANGE_PASSWORD_PATH` no alcanza — el 404 persistirá hasta que backend lo cree.
2. **Opciones (Architect elige):**
   - **A — Crear `POST /auth/change-password` en backend (recomendado FR8):** con `auth:true`, body `{current_password,new_password}`, valida `current` con `verify_password`, valida `new` con mismo `field_validator` que `UsuarioCreate` (≥8 letra+número), hashea bcrypt, `detail` genérico 401 si current mal. Toca `router.py`+`schema.py ChangePasswordRequest`+`service.py cambiar_password(user_id,current,new)`. 0.5d backend, front queda tal cual.
   - **B — Reusar flujo existente sin backend nuevo:** modal pasa a "Enviar email de recupero" → `POST /auth/forgot-password {email: me.data.email}` + toast "Revisá tu email" (no revela existencia). No pide `current_password`; UX distinta pero S5-08 compliant. 0.2d front.
   - **C — Desactivar modal hasta Sprint 6:** ocultar botón "Cambiar contraseña" (`hidden`/`featureFlag`) y mantener S5-08 verbatim; documentar gap en `decisions.md`.
3. **Seguridad (cualquiera opción):** texto plano por TLS, backend hashea bcrypt, no `crypto`/`bcryptjs` en frontend, no log `password`, `autoComplete` ya OK.
4. **Contrato si se elige A:** método `POST`, path `/auth/change-password` (o variante `PATCH /auth/password` — entonces cambiar solo `CHANGE_PASSWORD_PATH`+`method`), response `200 {detail}` o `204`, errores `401 current mal`, `422 new_password inválida`, `400 current===new`.

### 10.3 Tareas delegables al Developer (cuando Architect decida — orden estricto)

#### T5-PWD-BE-01 · Backend `POST /auth/change-password` (0.5d) — Alta — solo si opción A — dueño backend
- Archivos: `backend-ifts/app/features/auth/schema.py` (+ `ChangePasswordRequest`), `service.py` (+ `cambiar_password`), `router.py` (+ `@router.post("/change-password")` con `Depends(get_current_user)`), `tests/test_auth.py` (+ casos 401/422/200).
- Verificación: `curl openapi.json | grep change-password` muestra path; `pytest tests/test_auth.py -k change_password` verde.

#### T5-PWD-01 · Front integrar string de ruta (0.1d) — Baja — depende T5-PWD-BE-01 si A
- Archivo: `src/auth/api.ts`
- Acción: confirmar path/método del backend en `docs/openapi.json` (exportado). Editar **solo** `CHANGE_PASSWORD_PATH` y `method` si difiere. Mapear campo si backend usa `password` vs `new_password`.
- Verificación docker: levantar `docker compose up` en `ProyectoIntegrador/` (requiere Docker Desktop running; hoy `npipe` falló — reintentar) y `curl -s http://localhost:8000/openapi.json | grep change-password`.

#### T5-PWD-01B · Front fallback forgot-password (0.2d) — solo si opción B
- Archivos: `src/auth/api.ts` (+ `forgotPasswordRequest`), `src/features/perfil/PerfilScreen.tsx` (modal cambia a 1 campo email readOnly + botón "Enviar email")
- Lógica: `POST /auth/forgot-password {email}` → toast éxito siempre (mismo `detail` exista o no), 422 email inválido → field.

#### T5-PWD-02 · Validación E2E contra backend real (0.2d) — depende T5-PWD-01/01B
- Casos A: login→modal→ `current` vacío→field, `next` sin número→field, `confirm!=next`→field, `current` mal→401 toast, `next` corta→422 field, éxito→toast "Contraseña actualizada" + login con nueva funciona, `change-password` sin auth→401.
- Casos B: `POST /auth/forgot-password` con email propio→200, con email inexistente→mismo 200 (no revela).

#### T5-PWD-03 · Criterios Tester (0.1d)
- `grep CHANGE_PASSWORD_PATH src/auth/api.ts` 1 def; `grep -i "hash|bcrypt|crypto" src/features/perfil` 0; `grep -i "no disponible"` 0; `npm run build && npx tsc --noEmit -p tsconfig.app.json` verde; modal `type=password` + `autoComplete` OK.

### 10.4 Orden de ejecución Developer
**Escalar a Architect → elegir A/B/C. Si A:** T5-PWD-BE-01 → T5-PWD-01 → T5-PWD-02 → T5-PWD-03. **Si B:** T5-PWD-01B → T5-PWD-02 → T5-PWD-03. **Si C:** ocultar botón + documentar. Estado actual: **PLANNING/BLOCKED** hasta decisión.
