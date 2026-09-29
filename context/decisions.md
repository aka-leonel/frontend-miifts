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

## D014 Reset-password sin router: leer token de `window.location`
La app real diverge de D006 (nunca se instaló react-router — navega con un `switch(screen)` en `App.tsx`, ver comentario `App.tsx:453`). El link del mail (`INTEGRACION §2.4bis`) llega como `<url>?token=...`. En vez de agregar router solo para esta pantalla, `App()` lee `token` de `URLSearchParams(window.location.search)` una vez al montar (mismo patrón que `haySesion()` decide screen inicial) y si existe arranca en `"reset-password"` con el token en estado. Vite dev server (`appType` default `"spa"`) sirve `index.html` para cualquier path no-asset, así que `/reset-password?token=...` carga la SPA igual. Alternativa descartada: instalar react-router solo para esto — sobredimensionado para una sola pantalla, y ya está diferido (D009 style).

## D015 `apiClient`: 401 "opt-out" del logout global (`suppressUnauthorizedRedirect`)
`PATCH /auth/password` (INTEGRACION §2.4ter, D004 wrapper único) reusa el código 401 con un significado distinto al resto de la API: "la contraseña actual no coincide", no "el JWT es inválido" — el token sigue perfectamente vigente. El interceptor global de `apiClient.ts` (`unauthorizedHandler` → `AuthContext.logout()`) no distinguía esto y desconectaba al usuario por escribir mal la contraseña actual una vez. Se agregó `suppressUnauthorizedRedirect?: boolean` a `ApiClientOptions`: default `false` (comportamiento actual intacto para todo lo demás), `true` solo en `cambiarPasswordRequest` (`src/auth/api.ts`). Alternativa descartada: duplicar un fetch manual fuera de `apiClient` para este único caso — rompe D004.

## D016 Perfil editable Sprint5 (SPRINT5_FRONT S5-05→S5-07; S5-08 superado, ver D017)
`PATCH /auth/me` ya existe (cierra gap §1.7). **Payload real solo `{nombre?,apellido?}`** — `PerfilUpdate` en `backend-ifts/app/features/auth/schema.py` dice textual "el email identifica la cuenta... cualquier otro campo del body se ignora". La primera versión de este ticket asumía `email` editable también; se corrigió: `email` queda readOnly en `PerfilScreen`, igual que `carrera_id` (bloqueado por negocio). `password` sigue excluido de este PATCH — va por D017. 422→`useApiForm` fieldErrors, 409 email duplicado→toast (ya no aplica en la práctica al no mandarse email, se deja el manejo por si el backend agrega otra validación). Tras 200, `AuthContext.usuario` + `localStorage` (vía `actualizarPerfil`) son fuente única, no `getMiUsuario()` legacy.

## D017 Cambio de contraseña desde Perfil: endpoint real vs. asumido (2026-09-16)
Dos integrantes trabajaron esto en paralelo y llegaron a implementaciones distintas contra el mismo gap. Una asumía `POST /auth/change-password` (constante `CHANGE_PASSWORD_PATH` en `src/auth/api.ts`) — **ese endpoint nunca existió en el backend real** (verificado leyendo `backend-ifts/app/features/auth/router.py`); su `docs/openapi.json` local estaba desincronizado. El backend finalmente expuso **`PATCH /auth/password`** (INTEGRACION §2.4ter, confirmado en el mismo router.py), que es lo que quedó implementado: modal dedicado en `PerfilScreen` (`CambiarPasswordModal.tsx`) con 3 campos `actual/nueva/confirmar`, validación cliente igual a Registro (≥8, letra+número), `suppressUnauthorizedRedirect` (D015) para que el 401 de "no coincide" no desloguee. Contraseña viaja en claro solo por TLS, nunca hasheada en frontend. Validado en vivo contra backend real (login con la contraseña nueva tras logout). La implementación contra `/auth/change-password` se descartó al mergear — no había endpoint que llamar.
