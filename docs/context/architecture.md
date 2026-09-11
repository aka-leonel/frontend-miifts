# Architecture — miIFTS Frontend

> Owner: Architect | Sources: REQUERIMIENTOS §2/§8, INTEGRACION §1-7, openapi.json v1.0.0

## 1. Problema
SPA React consume API miIFTS FastAPI con 5 flujos MVP, auth JWT 24h, paginación Paginated<T>, errores {detail,errors[]}, PWA. Código actual solo template Vite counter.

## 2. Stack
React 19.2.8 + TS 6.0.2 + Vite 8.2 + @vitejs/plugin-react (Oxc, React Compiler) + react-router-dom 7.18.2 + axios 1.19 + tailwindcss 4.3.3 (@tailwindcss/vite) + vite-plugin-pwa 1.3 autoUpdate + eslint 10.8. BaseURL `VITE_API_URL=http://localhost:8000` (CORS 5173).

## 3. Estructura
```
src/
 api/client.ts       # axios baseURL, Authorization, parser ApiError, 401 clear→/login, no parse 204
 api/schema.d.ts     # npx openapi-typescript docs/openapi.json -o src/api/schema.d.ts
 pages/Auth/         # Login, Register (select GET /materias/carreras)
 pages/Catalog/      # Carreras, CarreraDetail, Materias, Buscar, MateriaDetail+Correlativas
 pages/Cursadas/     # List GET /materias/usuario/{id} + Promedio + Create/PATCH/DELETE
 pages/Recursos/     # List filtros GET /recursos/?... + Detail + Form + Convenios/TalentoTech lectura
 pages/Recordatorios/# Agenda GET /recordatorios/?... + Create + Delete
 components/         # Pagination<Paginated>, Layout, ProtectedRoute, AdminRoute, Toast
 contexts/AuthContext# token+usuario localStorage, login/logout/me/verify, rol
 hooks/useAuth,usePagination,useApiError
 services/           # materias, cursadas, recursos, convenios, recordatorios, auth
 App.tsx             # Router lazy + Providers + Guards
docs/openapi.json    # fuente tipos; INTEGRACION §6 / REQUERIMIENTOS §10
context/ + docs/context/ espejo (AGENTS.md vs agents/*.md)
```

## 4. Componentes
| Comp | Resp |
|---|---|
| ApiClient | Single instance, interceptors, ApiError parser, 401 side-effect |
| AuthContext | persistencia, rehidratación GET /auth/me, rol UI, logout=borrar |
| Router Guards | Protected/Admin, redirect 401, lazy |
| Pagination | genérico Paginated<T> |
| Services | tipado por dominio (§5 REQUERIMIENTOS) |
| Pages | 1:1 con §7 REQUERIMIENTOS / §4 INTEGRACION |

## 5. Integración
Vite :5173 → FastAPI :8000. Wrapper único (REQUERIMIENTOS §8.1). TanStack Query diferido: keys ["cursadas",userId] invalidar en POST/PATCH/DELETE.

## 6. Flujo Auth
registro POST /auth/registro→login POST /auth/login→ save token+usuario → Bearer → 401→clear→/login; rehidratar GET /auth/me.

## 7. Restricciones
No inventar endpoints (§8.8), no usuario_id en 3 POSTs, no rol registro, no parse 204, no refresh, ownership check + 403.

## 8. Sprint2 (INTEGRACION §6)
Identidad token cursadas/recordatorios, escritura convenios/TT protegida, detalles carrera/materia. Gap: CORS si port !=5173.

## 9. Diagrama
User→Router(Guard)→Page→Service→ApiClient→FastAPI; 401→AuthContext clear→/login
