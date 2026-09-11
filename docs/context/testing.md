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
