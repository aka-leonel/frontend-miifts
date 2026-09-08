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
