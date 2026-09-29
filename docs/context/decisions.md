# Decisions — miIFTS Frontend

> Owner: Architect | Sources: INTEGRACION §6-7, REQUERIMIENTOS §8-9

## D001 Vite+React19+TS
Mantener template. HMR, React Compiler ya habilitado, TS strict. No Next (sin SSR).

## D002 Tailwind 4.3 @tailwindcss/vite
Ya instalado, atomic CSS. Versus CSS modules más verboso.

## D003 Axios
Interceptor 401 centralizado, parser ApiError. Ya en deps. Fetch requeriría wrapper manual.

## D004 Wrapper único ApiClient
baseURL VITE_API_URL, Authorization, parser {detail,errors[]}, 401 clear→login, no parse 204. Evita duplicación (REQUERIMIENTOS §8.1, INTEGRACION §7).

## D005 Auth localStorage+mem sin refresh
JWT 24h sin refresh/logout servidor. Simple, XSS mitigar CSP. Cookie httpOnly no soportada backend.

## D006 React Router 7
Guards Protected/Admin, lazy. Ya instalado.

## D007 PWA vite-plugin-pwa autoUpdate
Manifest miIFTS, icons 192/512, offline básico.

## D008 Pagination Paginated<T> reutilizable
Todos listados igual ?page=&per_page=, total_pages gobierna UI (REQUERIMIENTOS §8.5).

## D009 TanStack Query diferido
Recomendado REQUERIMIENTOS §8.2 keys ["cursadas",userId] invalidar mutations, pero no instalado → diferir a Planner; axios+hooks basta MVP.

## D010 Tipos openapi.json
`npx openapi-typescript docs/openapi.json -o src/api/schema.d.ts` single source truth; fallback modelos TS §6 REQUERIMIENTOS.

## D011 Estructura pages/components/contexts/services/hooks
Carpetas .gitkeep existentes, agregar src/api. Separación AGENTS.md.

## D012 context vs docs/context
AGENTS.md define context/ raíz; agents/*.md referencian docs/architecture.md; usuario pide docs/. Decisión: context/ canónico + docs/context/ espejo.

## D013 Sprint2 gaps (INTEGRACION §6)
Resueltos: identidad token cursadas/recordatorios, escritura convenios/TT admin, detalles carrera/materia. Vigente: CORS si front !=5173 pedir CORS_ORIGINS.

## D014 Ejecutar D010: openapi-typescript real (Panel Admin, 2026-09-28)
Instalar `openapi-typescript` devDependency + script `gen:api` (`openapi-typescript $VITE_API_URL/openapi.json -o src/api/schema.d.ts`, backend debe estar corriendo). Alias en `api/types.ts` SOLO los tipos pedidos por el ticket (`CarreraCreate/Update`, `MateriaCreate/Update`, `CorrelativaCreate`, `ConvenioCreate`, `Convenio`) sourceados de `components["schemas"]`; el resto de `api/types.ts` queda hand-written como está (evita refactor no pedido — AGENTS.md "Avoid unnecessary refactoring").

## D015 Admin: un solo nav item con tabs internas, no 4 rutas separadas
El ticket pide "4 pantallas" (carreras, materias, correlativas, convenios) pero Carreras+Materias ya viven combinadas en `AdminCatalogoScreen` (S4-10, ya validado por Tester). Se mantiene esa combinación, se le agrega una sección de Correlativas (materia-scoped, encaja naturalmente junto al listado de materias), y Convenios se separa en su propia pantalla. Un único `AdminScreen` con 2 tabs (Catálogo / Convenios) se cuelga de un nuevo nav item "Admin" (rol-gated), reemplazando el botón inline que vivía en `MisMateriasScreen` (S4-10) — un solo punto de entrada en vez de dos. No hay React Router real en esta app (pese a lo que dice architecture.md §2/§6): `App.tsx` navega con un `switch` de `Screen` en memoria; `RutaAdmin`/`RutaProtegida` (`features/auth/`) existen pero no están wireados — el guard de rol real de esta app vive en el `switch` de `App.tsx` (ya el patrón usado por `admin-catalogo` en S4-10).

## D016 Convenios admin = feature nueva, no reusar `features/convenios`
`features/convenios` es de solo lectura para estudiante y mapea la respuesta a `ConvenioItem` (forma UI, pierde `id`/`carrera_id` crudos). El ticket pide explícitamente no reusar componentes de consulta para gestión. Nueva carpeta `features/convenios-admin/` con su propio `service.ts` (CRUD sobre la forma cruda del backend), `convenioSpec.ts`, `hooks.ts`, `ConveniosAdminScreen.tsx` — mismo patrón que `features/catalogo-admin/`.
