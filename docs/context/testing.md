# Testing — miIFTS Frontend

> Owner: Tester | Sources: REQUERIMIENTOS §3/§5-6, INTEGRACION §1-3

## 1. Estrategia
Vitest+RTL+MSW mock VITE_API_URL según openapi.json. Validar Paginated<T>, ApiError {detail,errors[]}, códigos 200/201/204/401/403/404/409/422. No tocar src para fix, reportar a Planner.

## 2. Escenarios

### Auth (§4 REQUERIMIENTOS, §2 INTEGRACION)
Registro 201 auto-login; 409 email duplicado; 422 password sin letra/número, nombre <2, carrera_id inexistente; rol ignorado. Login 200 guarda token+usuario; 401. 401 interceptor clear→/login. GET /auth/me rehidrata, /verify valid. Guard sin token→/login; rol oculta ABM.

### Catálogo §5.1
GET /materias/carreras paginado page/per_page 1-100 fuera rango items[]; detalle 404; POST/PUT/DELETE admin 409 si tiene materias; GET /materias/carrera/{id}; buscar q required 422 si falta +anio 1-6 cuatrimestre1|2; correlativas con requiere; GET /materias/{id} 404; POST codigo duplicado 409; DELETE tiene cursadas 409; valid duracion 1-12 nombre≥2 codigo upper.

### Cursadas §5.2
GET /materias/usuario/{id} 403 ajeno, paginado; POST sin usuario_id 409 dup/carrera distinta 422 notas1-10; PATCH/DELETE 404 si otro; promedio null; estado derivado.

### Recursos §5.3
GET /recursos/?materia_id&tipo&desde&hasta paginado Pub; /materia/{id} /usuario/{id} /{id}; POST sin usuario_id titulo1-150 HttpUrl 422; PUT/DELETE 403 no dueño 204 sin body.

### Convenios/TT §5.4
GET Pub paginado; POST/PUT/DELETE Admin 401 sin token 403 estudiante.

### Recordatorios §5.5
GET solo propios desc filtros; POST fecha no futura 422 sin usuario_id; DELETE 404 ajeno 204.

### Transversales (INTEGRACION §1)
Paginación total_pages, per_page 1-100; forms 422 errors[].campo→field resto detail toast; DELETE 204 no parse; PWA manifest autoUpdate; ownership usuario_id===me.id.

## 3. Tipos
Unit: ApiClient parser, AuthContext, Pagination. Integration: Page+Service+MSW. E2E opcional Playwright 5 pantallas.

## 4. Limitaciones
Sin runner/MSW/CI instalado; backend http://localhost:8000 vivo para E2E.

## 5. Reporte — Integrante 2 MATERIAS+INICIO (2026-09-11, Tester)

### Dependencias instaladas
- `npm install` con Node 23.10.0 (mise requiere 22, nvm 21.7 incompatible con vite 8/rolldown) → `vite build` OK (50 módulos, 74kB gzip) tras switch a 23.10.0. Sin `pnpm` en PATH, se usó `npm`. Faltantes opcionales no instalados: `@tanstack/react-query`, `react-router-dom`, `vitest`/`msw` (diferidos per D009) — no bloquean Int.2 que usa `useAsync` local.

### Alcance validado
Archivos Int.2: `features/catalogo/service.ts|hooks.ts`, `features/materias/service.ts|hooks.ts|estado.ts|materiaUsuarioSpec.ts|MateriaCard.tsx|ByteWidget.tsx|PromedioCard.tsx|MisMateriasScreen.tsx|InicioScreen.tsx`, `features/recordatorios/hooks.ts` (stub unblock), `App.tsx` integración.

### Evidencia

| Check | Resultado | Evidencia |
|-------|-----------|-----------|
| **Build** | PASS | `npx vite build` con Node 23.10 → `✓ built in 239ms`, `dist/assets/index-*.js 250kB` |
| **Typecheck Int.2** | PASS | `tsc --skipLibCheck` → 0 errores en `MateriaCard|ByteWidget|InicioScreen|recordatorios/hooks`; errores restantes son pre-existentes de Int.3 (`Correlativa` missing, `@tanstack/react-query` missing, `Card/Section/Button` missing) y `App.tsx` DemoItem mock |
| **T2-CAT-01 catálogo** | PASS | `getMateriasDeCarrera(carreraId, {page,per_page})` → `GET /materias/carrera/{id}?page=&per_page=100`, `Paginated<Materia>`, demo paginate con `total_pages`, hook `useMateriasDeCarrera(carreraId)` |
| **T2-MAT service** | PASS | `getMisMaterias(page)` → `withUsuarioId(/materias/usuario/{id})` + `page/per_page`, `getPromedio()` → `withUsuarioId`, `createCursada(body: CursadaCreate)` sin `usuario_id` → `POST /materias/usuario`, `updateCursada(id, CursadaUpdate)` → `PATCH /materias/cursada/{id}` sin `materia_id`, `deleteCursada` → `DELETE 204` sin body. 409/422 propagados vía `ApiError` |
| **estadoLabel** | PASS | `cursando→En curso`, `nota_final→Aprobada`, `parcial→Regular`, else `Pendiente`; `estadoBadgeClasses` tokens `violet/green/lime/border` |
| **MateriaCard** | PASS | Presentacional, props `cursada,onOpen,onEdit,onDelete`, usa `estadoLabel+Badge`, `subtitulo` notas, `stopPropagation` en botones, `hover:border-violet/40` |
| **ByteWidget** | PASS | Props `{aprobadas,total}`, pct calc, 4 estados Dormido/Despierto/Entusiasta/Graduado, SVG Byte + barra `from-violet to-lime`, tokens `card/border/surface2` |
| **materiaUsuarioSpec** | PASS | `fields: materia_id select lockOnEdit + cursando switch + 3 notas number 1-10`, `submit.create→createCursada`, `update→updateCursada` sin materia_id, `onError {409:toast,422:fields}`, `invalidates [['mis-materias'],['promedio']]` |
| **MisMateriasScreen** | PASS | `useMisMaterias(page)` + `usePromedio()` + `useMateriasDeCarrera(carrera_id)`, `ByteWidget+PromedioCard` arriba, chips filtro cliente `Todas/En curso/Regular/Aprobada/Pendiente` via `estadoLabel`, `ListState` loading/error/empty, `MateriaCard` con onEdit/onDelete/onOpen, `Paginador page/total_pages`, FAB `+` → `FormModal` create vs edit spec, `ConfirmDialog` borrar, `onSuccess refetch` lista+promedio, `ApiError.detail` toast en delete |
| **InicioScreen** | PASS | Panel: `useMisMaterias+usePromedio` → `ByteWidget+PromedioCard` reusados, `useRecordatorios({desde: hoyISO, per_page:3})` importado de `features/recordatorios/hooks` (no duplicado), solo lectura tap→materia, estados loading/skeleton/empty, accesos rápidos carrusel materias, `getMiUsuario()` header |
| **Integración App** | PASS | `App.tsx` importa `InicioReal`/`MisMateriasReal`, `case inicio/materias` rutean a reales, `BottomTabs` intacto |
| **No duplicación** | PASS | No se creó `FormModal/EntityForm/ListState/Paginador` (dueño Int.1), no `Recurso/Correlativa` (Int.3), `recordatorios/service` reusado solo via hook |
| **Contrato** | PASS | `Paginated<T>` + `Paginador`, `detail→toast` via `useToast`, `errors[]→fields` via `FormModal/useApiForm`, nunca `usuario_id` en POST, wrapper único `apiClient` |

### No validado / Limitaciones
- Backend `localhost:8000` no levantado → validación en `DEMO_MODE=true` (demo.ts) no contra API real; 401/403/404/409 reales no ejercitados E2E.
- Sin `vitest`/`msw`/`@testing-library` instalados → sin tests automatizados; validación manual + build + tsc.
- TanStack Query no instalado (uso `useAsync` local per D009) — migración pendiente no bloquea.
- `InicioScreen` agrupación por semana y navegación detalle no testeada E2E (requiere `react-router` real).

### Veredicto
**PASS con observaciones pre-existentes.** Int.2 cumple criterios SPRINT §7.3 1-7. Fallos `tsc` restantes son de Int.3/App mock, no regresión de Int.2. Recomendación: instalar `@tanstack/react-query` + `react-router-dom` y `vitest`/`msw` para suite futura, y alinear `src/api/types.ts` con `docs/openapi.json` generado (`Correlativa`, `Recurso`).

### Próximo paso
Planner → Architect: marcar `status.md` TESTING→COMPLETE para Int.2, o escalar gaps backend (`PATCH /auth/me`, `PATCH /recordatorios` per §1.7).

## 7. Reporte — Integrante 4 OLVIDÉ MI CONTRASEÑA S5-13/14/15 (2026-09-16, Tester)

### Alcance validado
`implementation.md` §9 T5-FORGOT-01/T5-RESET-01/T5-RESET-02. Archivos: `src/api/types.ts` (`ForgotPasswordRequest`/`ResetPasswordRequest`/`MensajeResponse`), `src/auth/api.ts` (`forgotPasswordRequest`/`resetPasswordRequest`), `src/App.tsx` (`OlvidePasswordScreen`, `ResetPasswordScreen`, link en `LoginScreen`, lectura de `token` en `App()`).

### Evidencia

| Check | Resultado | Evidencia |
|-------|-----------|-----------|
| **Build** | PASS | `npm run build` vite 8 → `✓ built in 926ms`, 71 módulos |
| **Typecheck** | PASS | `npx tsc --noEmit` → 0 errores nuevos; únicos 2 errores (`RutaAdmin.tsx`/`RutaProtegida.tsx` sin `react-router-dom` instalado) son preexistentes, ajenos a este cambio (no tocados) |
| **S5-13 link + pantalla** | PASS | `LoginScreen` link "¿Olvidaste tu contraseña?" → `onGo("olvide-password")`; `OlvidePasswordScreen` llama `forgotPasswordRequest` y muestra SIEMPRE el mensaje de éxito tras el 200 (no distingue si el email existe, cumple FR7) |
| **S5-14 pantalla nueva password** | PASS | `ResetPasswordScreen` valida ≥8 + letra+número + confirmación (mismo criterio que `RegistroScreen`), usa `Input type="password"` (ojo mostrar/ocultar ya incluido en el componente compartido) |
| **S5-14 token por query param sin router** | PASS | `App()` lee `new URLSearchParams(window.location.search).get("token")` una vez al montar y arranca en `"reset-password"` con prioridad sobre sesión guardada (D014) |
| **S5-15 error 400 token inválido/vencido** | PASS | catch de `resetPasswordRequest` con `err.status===400` → toast `err.detail` + `onGo("olvide-password")`, no error genérico ni pantalla muerta |
| **422 password débil** | PASS | mismo flujo de validación cliente que Registro antes de pegarle al backend; error 422 del backend (si pasa la validación cliente pero falla server-side) → toast `err.detail`, no consume el token, se puede reintentar |
| **Nav** | PASS | `showNav` excluye `olvide-password`/`reset-password` de la bottom nav |

### No validado / Limitaciones
- **Sin SMTP en dev (gap conocido de backend, INTEGRACION §2.4bis)**: no se pudo ejercitar el flujo end-to-end real (pedir email → recibir link → click → reset) porque el mail no se envía; requiere pedir el token de los logs del backend a quien lo tenga levantado. No es un fallo del front.
- Sin `vitest`/`msw` instalados (mismo gap que Int.2/Int.4) → validación manual + build + tsc, no automatizada.
- No se probó contra backend real levantado en esta sesión (sin acceso); validado por contrato (tipos, rutas, manejo de status codes) contra INTEGRACION §2.4bis.

### Veredicto
**PASS con limitación documentada (no bloqueante).** S5-13/14/15 cumplen `implementation.md` §9.3 1-8 por contrato y build/tsc. Pendiente: QA manual end-to-end contra backend real con el token de consola, a cargo de quien tenga el backend levantado.

### Próximo paso
Planner → Architect: informar que S5-13/14/15 están implementados y listos para QA manual (se necesita el token del log del backend para probar el flujo completo).

### Regresión encontrada en QA manual E2E (2026-09-16) — CORREGIDA
Usuario reportó "no me deja desloguearme" probando el flujo contra backend real. Causa: sesión con token inválido/vencido + `App.tsx` sin mecanismo para volver a "login" cuando `AuthContext` pierde la sesión (ver `status.md` para el detalle y el fix). Confirmado con Chrome/Playwright: antes del fix, sesión inválida → Perfil atascado en "No se pudo cargar tu perfil / Not authenticated" sin salida; después del fix, redirect automático a Login + logout manual limpio. Fuera de alcance de S5-13/14/15 pero se corrigió en la misma sesión de trabajo por ser bloqueante para probar el resto.

### Gap resuelto (2026-09-16) — Cambiar contraseña logueado
Backend entregó `PATCH /auth/password` (INTEGRACION §2.4ter, ver `requirements.md` FR8). Implementado y validado EN VIVO contra backend real con Chrome/Playwright (no solo build/tsc, a diferencia del resto de S5):

| Check | Resultado | Evidencia |
|-------|-----------|-----------|
| Build/tsc | PASS | `npm run build` 72 módulos, `tsc --noEmit` 0 errores nuevos |
| Botón en Perfil | PASS | "Cambiar contraseña" visible, abre `CambiarPasswordModal` |
| 401 actual incorrecta | PASS | Toast "La contraseña actual no coincide.", modal se queda abierto, **sesión NO se cierra** (confirma fix D015 — antes de `suppressUnauthorizedRedirect` esto hubiera disparado logout global) |
| 200 éxito | PASS | Toast "Contraseña actualizada correctamente.", modal cierra, sigue en Perfil con la misma sesión (JWT no se invalida) |
| Persistencia real | PASS | Logout manual + login con la contraseña NUEVA → entra correctamente (confirma que el backend la guardó, no fue solo un 200 optimista del front) |
| Validación cliente | PASS | Mismo criterio Registro/Reset (≥8, letra+número, confirmación) antes de pegarle al backend |

### Gap encontrado, no corregido (2026-09-16)
Ninguno pendiente de este lote — S5-13/14/15 + cambio de contraseña logueado (FR8) completos y validados.

## 6. Reporte — Integrante 4 PERFIL·CONVENIOS·UX (2026-09-14, Tester)

### Alcance validado
`implementation.md` §8 S4-16..S4-20. Archivos: `features/perfil/service.ts|hooks.ts|PerfilScreen.tsx`, `features/convenios/service.ts|hooks.ts|ConveniosScreen.tsx`, `features/recordatorios/service.ts|hooks.ts|RecordatoriosScreen.tsx`, `features/materias/InicioScreen.tsx`, `src/App.tsx`. Criterios §8.4.

### Evidencia

| Check | Resultado | Evidencia |
|-------|-----------|-----------|
| **Build** | PASS | `npm run build` vite 8 → `✓ built in 250ms`, 68 módulos, `tsc --noEmit` exit 0 |
| **S4-16 Perfil bloqueado** | PASS | `PerfilScreen.tsx:100-122` 3 inputs `readOnly disabled cursor-not-allowed opacity-80`; 0× `setSaved`/`✓ Guardado`/`handleSave`; banner `amber-500/10` explica `PATCH /auth/me (§1.7)`; `Skeleton` y `ErrorState` con `me.refetch()`; `carreraNombre` derivado de `useCarreras` + fallback `Carrera #id`; `getAuthMe()` en `perfil/service.ts:5` solo `apiClient<Usuario>("/auth/me")` sin `DEMO_MODE` |
| **S4-17 Convenios datos reales** | PASS | `convenios/service.ts:71,84` → `apiClient<Paginated<ConvenioApi>>("/convenios/…?page=")` y `apiClient<Paginated<TalentoTechApi>>("/talentotech/…?page=")` con `auth:false`; `ConveniosScreen.tsx:42-49` `ListState loading/error/items` con `emptyTitle`/`onRetry`; `Paginador page/totalPages` real; vacío `items:[]` no rellenado |
| **S4-18 Sin hardcode** | PASS | `grep DEMO_MODE|universidades|talentoTech|demoPaginate|delay` en `convenios/service.ts` → 0 hits; archivo 86 líneas (antes 197), solo `mapConvenio/mapTalentoTech/toConvenioPage` + 2 fetchers; coord S4-04 ok |
| **S4-19 Limpieza App.tsx** | PASS | `grep recursosInit|recordatoriosInit src/` → 0 hits; `DetalleScreen` ahora `useState<Recurso[]>([])`/`useState<Recordatorio[]>([])`; `materiasInit` retenido solo para `ModalMateria` local (no es deuda S4-19); tipos `Recurso/Recordatorio` locales aún usados solo por `DetalleScreen` muerto |
| **Recordatorios real** | PASS | `recordatorios/service.ts:1-33` sin `DEMO_MODE`, `buildQuery` con `page/per_page/tipo/desde/hasta/materia_id`, `apiClient` con `auth:true` default, `POST /recordatorios/` sin `usuario_id`, `DELETE 204` sin parse |
| **S4-20 Responsive** | PASS con observación | Inicio `mx-auto max-w-lg sm:max-w-2xl lg:max-w-5xl` + `grid md:grid-cols-2` para Byte/Promedio y `grid sm:2 lg:3` para cards/materias; Convenios `grid sm:2 lg:3` + container responsive; Recordatorios `grid sm:2 lg:3` + FAB `right-4 sm:6 lg:8`; Perfil `max-w-lg sm:6 md:max-w-2xl`; `App.tsx:653` shell `max-w-[430px] sm:max-w-2xl lg:max-w-5xl` (ya no frame fijo 430). Observación menor: `BottomNav` en `App.tsx:333` aún `maxWidth:430` fijo inline — no rompe layout pero debería migrar a `max-w-[430px] sm:max-w-2xl` para consistencia |
| **Contrato global** | PASS | `apiClient` único, `Authorization: Bearer` en perfil/recordatorios, públicas sin auth en convenios, `Paginated<T>` + `Paginador`, `ApiError` handling, `VITE_API_URL` configurable |
| **No duplicación** | PASS | No se creó `FormModal/EntityForm`; no se pisó `features/catalogo`/`materias` ajenos |

### No validado / Limitaciones
- Backend `localhost:8000` no levantado en CI → convenios/recordatorios validados por contrato (`Paginated`, `auth:false/true`) y `EmptyState`/`ErrorState`, no E2E con seed real; probar `page=999 → items:[]` y `GET /talentotech/categoria/{cat}` con datos seed en local.
- Sin `vitest`/`msw` instalados → sin tests automatizados; validación manual + build + tsc + grep.
- `BottomNav` fijo 430px restante (ver observación) — no bloquea pero conviene follow-up `T4-RESP-02`.

### Veredicto
**PASS.** Integrante 4 cumple `implementation.md` §8.4 1-6 sin mocks. 4/5 tareas completas 100%, 1 con observación menor no bloqueante. Recomendación Planner→Architect: marcar Int.4 TESTING→COMPLETE, abrir follow-up opcional para `BottomNav` responsive y E2E `msw` con backend seed.

## 7. Reporte — Sprint 5 Integrante 2 PERFIL EDITABLE (2026-09-16, Tester)

### Alcance validado
`implementation.md` §9 S5-05..S5-08. Archivos: `api/types.ts` (UsuarioUpdate), `auth/api.ts` (updateMeRequest), `auth/AuthContext.tsx` (actualizarUsuario/actualizarPerfil), `features/perfil/service.ts` (updateAuthMe), `features/perfil/PerfilScreen.tsx`. Criterios §9.4 + live backend `http://localhost:8000` (`GET /auth/me` + `PATCH /auth/me` PerfilUpdate).

### Evidencia

| Check | Resultado | Evidencia |
|-------|-----------|-----------|
| **Build** | PASS | `vite build` → `✓ 306ms`, 71 módulos, `265kB gzip 77kB` |
| **Typecheck** | PASS | `tsc --noEmit -p tsconfig.app.json` → 1 preexistente `SidebarNav unused` (ajeno), 0 en `perfil/*`/`auth/*` |
| **S5-05 Tipos+API** | PASS | `types.ts:158 UsuarioUpdate=Partial<Pick<Usuario,"nombre"|"apellido"|"email">>`, `auth/api.ts:35 updateMeRequest PATCH /auth/me auth:true`, `perfil/service.ts:8 updateAuthMe PATCH` |
| **S5-05 UI editable** | PASS | `PerfilScreen.tsx` 3 inputs controlados `form.{nombre,apellido,email}` + `hasChanges` diff + `useCarreras` carrera `readOnly disabled cursor-not-allowed opacity-60`, `Guardar cambios` disabled `!hasChanges||saving`, `saving→Guardando...` |
| **S5-05 Carrera RO** | PASS | `input carrera value=carreraNombre` `readOnly disabled`, patch construye solo `nombre/apellido/email` cambiados, nunca `carrera_id`; live `PATCH {carrera_id:999}` → backend ignora, `carrera_id` queda 1 |
| **S5-06 422→fields** | PASS | `useApiForm` `applyApiError` mapea `errors[]→fieldErrors` con `border-red-500` + `<span text-red-400>`, live `PATCH {nombre:"a"}` → `422 {campo:"nombre",msg:"at least 2"}` → fieldError correcto |
| **S5-06 409→toast** | PASS* | Código: `status 409 → pushToast(detail)` (línea 91). *No ejercitable E2E: backend `PerfilUpdate` no acepta `email`, nunca retorna 409. FR7 pide 409 email duplicado pero live ignora `email` |
| **S5-07 Sync** | PASS | `AuthContext actualizarPerfil → updateMeRequest → actualizarUsuario → setUsuarioGuardado+setUsuarioState`, `PerfilScreen handleSave → await actualizarPerfil(patch) → pushToast success → me.refetch()`, sin reload. Live: `PATCH {nombre:"TestQAEdit"}` → 200 + `GET /auth/me` refleja cambio |
| **S5-08 No password** | PASS | `grep -r password src/features/perfil` → 0 hits; `service.ts`/`auth/api.ts` no envían password; `PerfilScreen` 0× `type=password` |
| **E2E live PATCH** | PASS | Usuario `testqa1789527020@example.com` registro→login→`GET /auth/me` 200→`PATCH {nombre,apellido}` 200 persiste→`PATCH {email}` 200 pero `email` queda original (ignorado, ver gap) |
| **No mocks** | PASS | `grep DEMO_MODE src/features/perfil` 0 hits; `apiClient` único con `Authorization: Bearer` |
| **Contrato global** | PASS | `Paginated` n/a, `ApiError` parser `errors[]`→Record OK, `401→logout` via `setUnauthorizedHandler` intacto, `VITE_API_URL` configurable |

### Gap detectado (escalar a Architect/Planner)
**FR7/S5-05 pide `PATCH /auth/me` con `email` editable + 409 duplicado, pero live `openapi.json` define `PerfilUpdate {nombre?, apellido?}` solo** — descripción: "sólo edita su propio nombre y apellido… El email identifica la cuenta". Live verificado: `PATCH {email:"new@example.com"}` → 200 pero `email` no cambia (ignorado). Impacto: `S5-06 409` nunca ocurre, email en UI es "falso editable". Recomendación: (a) Architect actualice `requirements.md` FR7 a solo `nombre/apellido` y `PerfilScreen` pase `email` a readOnly como `carrera`, o (b) backend amplíe `PerfilUpdate` para incluir `email` con validación 409.

### No validado / Limitaciones
- Sin `vitest`/`msw`/`RTL` → sin tests automatizados; validación manual + build + tsc + live curl.
- `S5-03` unificación `useAuth()` en `Inicio/MisMaterias/Detalle` no re-validado acá (asumido mergeado).
- Email gap bloquea validación completa 409 hasta decisión Arquitecto.

### Veredicto
**PASS con observación mayor (email gap).** T5-PERFIL-01/02/03/04 implementados según `implementation.md` §9.3, build+tsc verdes, `PATCH` real funciona para `nombre/apellido`, carrera sigue RO, sync sin reload, sin password. Observación: `email` editable no persiste (backend lo ignora) — escalar a Architect antes de marcar COMPLETE o ajustar UI a readOnly.

## 8. Reporte — Extensión FR8 Cambio de contraseña (2026-09-16, Tester)

### Alcance validado
`implementation.md` §10 FR8 + `requirements.md` FR8 + `decisions.md` D015 + `auth/api.ts` + `api/types.ts` + `features/perfil/PerfilScreen.tsx` modal. Criterios §10.3. Live `http://localhost:8000` aún sin `POST /auth/change-password`.

### Evidencia

| Check | Resultado | Evidencia |
|-------|-----------|-----------|
| **Build** | PASS | `vite build` → `✓ 256ms`, 71 módulos, `269kB gzip 78kB` |
| **Typecheck** | PASS | `tsc --noEmit -p tsconfig.app.json` → 1 preexistente `SidebarNav unused`, 0 en `auth/*`/`perfil/*` |
| **Modal limpio** | PASS | `PerfilScreen.tsx:245` modal sin `amber-500/10` warning; `grep -i "no disponible\|Endpoint aún"` en `src/features/perfil` → 0 hits |
| **Único punto integración** | PASS | `auth/api.ts:40 CHANGE_PASSWORD_PATH = "/auth/change-password"` (1 definición), `changePasswordRequest(payload: ChangePasswordRequest)` → `apiClient<void>(CHANGE_PASSWORD_PATH,{method:"POST",body:payload,auth:true})` |
| **Tipos** | PASS | `api/types.ts` `ChangePasswordRequest {current_password, new_password}` |
| **Inputs seguros** | PASS | 3× `type="password"` + `autoComplete="current-password"` / `new-password` en `PerfilScreen.tsx:266,277,288`; sin `hash`/`bcrypt`/`crypto` en `features/perfil` (grep 0) |
| **No hash frontend** | PASS | `grep -i hash\|bcrypt\|crypto src/features/perfil` 0; contraseña viaja texto plano por TLS, backend hashea (D015) |
| **Validación cliente** | PASS | `current` requerido, `next` ≥8 + letra+número (`/[A-Za-z]/ && /[0-9]/`), `confirm===next` → `pwdErrors` con `border-red-500` |
| **422→fields / 401→toast** | PASS (código) | `catch (e instanceof ApiError)` mapea `new_password→next`, `current_password→current` a `pwdErrors`; otros `detail` → `pushToast`; `pwdSaving` deshabilita botón (`disabled:opacity-50`, texto `Guardando...`) |
| **No regresión §9** | PASS | `PATCH /auth/me` sigue OK, `carrera readOnly` intacto, `build` verde |
| **Backend pendiente** | INFO | `curl openapi.json \| grep change-password` → `[]` (endpoint aún no existe); E2E `POST /auth/change-password` 404 hasta que backend lo exponga — front queda listo con solo cambiar `CHANGE_PASSWORD_PATH` si el back usa otro path |

### No validado / Limitaciones
- Endpoint `POST /auth/change-password` no existe en live → no se ejercitó E2E 200/401/422 real; validación por código + contrato.
- Sin `vitest`/`msw` → sin test automatizado de modal; validación manual + grep + build + tsc.

### Veredicto
**PASS.** §10 `T5-PWD-01→03` implementados: modal limpio, servicio con único string `CHANGE_PASSWORD_PATH`, seguridad TLS sin hash frontend, validación y manejo 422/401 listos. **Integración lista:** cuando backend exponga `POST /auth/change-password` (o variante) solo hay que editar ese string. Sin regresión sobre §9.
