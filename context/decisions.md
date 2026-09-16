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

## D014 Perfil editable Sprint5 (SPRINT5_FRONT S5-05→S5-08)
`PATCH /auth/me` ya existe (cierra gap §1.7). Payload solo `{nombre?,apellido?,email?}` parcial; `carrera_id` bloqueado negocio (backend 422/409 si se envía) y `password` excluido de PATCH a propósito — va por endpoint dedicado. 422→`useApiForm` fieldErrors, 409 email duplicado→toast (mismo canal que `materiaUsuarioSpec`). Tras 200, `AuthContext.usuario` + `localStorage` son fuente única (S5-03), no `getMiUsuario()` legacy.

## D015 Cambio de contraseña desde Perfil (2026-09-16, extensión usuario)
Modal dedicado en `PerfilScreen` con 3 campos `current/new/confirm`, validación cliente (actual requerido, nueva ≥8 letra+número). **Seguridad:** contraseña se transmite en claro por TLS (HTTPS), **nunca hasheada en frontend**; backend hashea con bcrypt y no loguea. Endpoint dedicado `POST /auth/change-password {current_password, new_password}` (o el que defina backend) con único punto de integración `CHANGE_PASSWORD_PATH` en `src/auth/api.ts` — solo hay que cambiar ese string cuando el back esté listo. No se toca `PATCH /auth/me`. 422→fields mapeado, 401→toast. Modal limpio sin aviso de "endpoint no disponible".
