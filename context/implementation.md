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
- T1.1 Register: select GET /materias/carreras, valid password≥8 letra+número, nombre2-100, POST /auth/registro→POST /auth/login auto
- T1.2 Login: POST /auth/login guarda token+usuario, 401 toast
- T1.3 Rehidratar GET /auth/me en mount

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
