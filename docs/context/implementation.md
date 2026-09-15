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
