# Requirements — miIFTS Frontend

> Owner: Architect | Sources: `docs/REQUERIMIENTOS_FRONTEND_IA.md` (§1-10), `docs/INTEGRACION_FRONT.md` (§1-7), `docs/openapi.json` (v1.0.0)

## 1. Producto
Plataforma académica IFTS: auth/perfiles, catálogo (carreras/materias/correlativas), cursadas+promedio, recursos, convenios/TalentoTech, recordatorios/agenda. Backend FastAPI 0.115.5 + SQLAlchemy 2 + Pydantic v2, `VITE_API_URL=http://localhost:8000`, CORS `localhost:5173`, JSON ISO8601, Swagger `/docs`.

## 2. Convenciones Globales (obligatorias — docs §3 / INTEGRACION §1)
- Colección: `Paginated<T> = {items,total,page,per_page,total_pages}` ; Recurso: plano; DELETE 204 sin body; Error `{detail:string}`; 422 `{detail, errors:{campo,msg}[]}` campo con punto si anidado; `detail` → toast, `errors[]` → setError.
- Paginación: `?page=1&per_page=20` rango 1-100, fuera rango → `items:[]` + total real.
- Códigos: 200 OK, 201 Creado, 204 Borrado, 401 token inválido → limpiar sesión→login, 403 sin permiso, 404 no existe, 409 duplicado/regla negocio, 422 validación.

## 3. Funcionales

### FR1 Auth JWT HS256 24h sin refresh
- `POST /auth/registro` Pub {nombre 2-100, email único, password ≥8 letra+número, carrera_id existente} → 201 UsuarioResponse sin token, rol ignorado.
- `POST /auth/login` Pub {email,password} → 200 {access_token, token_type:"bearer", usuario}; 401 credenciales.
- `GET /auth/me` Bearer → Usuario; `GET /auth/verify` → {valid,user_id}
- Flow: registro→login→ guardar token+usuario localStorage/memoria → interceptor 401→logout; login trae usuario (no necesita /me).
- Roles: estudiante default, admin catálogo; front oculta por `usuario.rol`, backend 403.

### FR2 Catálogo (Pub lectura, Admin escritura)
- `GET /materias/carreras?page=&per_page=` ; `GET /materias/carreras/{id}` 404 ; `POST/PUT/DELETE /materias/carreras` Admin, 409 si tiene materias; `GET /materias/carrera/{carrera_id}` ; `GET /materias/buscar?q=&anio=&cuatrimestre=` q requerido; `GET /materias/correlativas/{materia_id}` incluye `requiere:Materia` ; `GET/POST/PUT/DELETE /materias/{id}` Admin, 409 codigo duplicado / tiene cursadas.
- Validaciones: anio 1-6, cuatrimestre 1|2, duracion 1-12, nombre ≥2, codigo no vacío upper.

### FR3 Cursadas/Promedio (identidad token, Sprint2)
- `GET /materias/usuario/{usuario_id}` Auth propio/admin 403 ; `POST /materias/usuario` Auth {materia_id,cursando,nota_parcial_1,nota_parcial_2,nota_final} 409 duplicado/carrera distinta ; `PATCH/DELETE /materias/cursada/{id}` dueño 404 si otro ; `GET /materias/promedio/{usuario_id}` → {promedio|null,materias_computadas} ; Notas 1-10 422; estado derivado cursando→aprobada(nota_final)→pendiente; No mandar usuario_id en POST/PATCH/DELETE.

### FR4 Recursos
- `GET /recursos/?materia_id=&tipo=&desde=&hasta=&page=&per_page=` Pub ; `GET /recursos/materia/{id}` ; `GET /recursos/usuario/{id}` ; `GET /recursos/{id}` ; `POST /recursos/` Auth sin usuario_id {titulo 1-150, url HttpUrl, descripcion, tipo pdf|video|link, materia_id} ; `PUT/DELETE /recursos/{id}` solo dueño 403.
- Convenios/TalentoTech: `GET /convenios/`, `/convenios/carrera/{id}`, `/convenios/{id}`, `/talentotech/` etc Pub; POST/PUT/DELETE Admin 401/403 — estudiante solo lectura.

### FR5 Recordatorios (token, Sprint2)
- `GET /recordatorios/?tipo=&desde=&hasta=&materia_id=&page=&per_page=` Auth solo propios desc ; `POST /recordatorios/` Auth {titulo,fecha ISO futura, tipo parcial|tp|final|otro, materia_id?} 422 si no futura ; `DELETE /recordatorios/{id}` 404 si ajeno (no revela) 204. No mandar usuario_id.

### FR6 Health
- `GET /` → {mensaje} ; `GET /health` → {status:"ok"}

## 4. Modelos TS (copiar de REQUERIMIENTOS §6)
Paginated<T>, ApiError, Rol, Usuario, RegistroRequest, LoginRequest, TokenResponse, Carrera, Materia, Correlativa, MateriaCreate, EstadoCursada, Cursada, CursadaCreate, Promedio, Recurso, RecursoCreate, Convenio, TalentoTech, Recordatorio, RecordatorioCreate. Generables vía `npx openapi-typescript docs/openapi.json -o src/api/schema.d.ts`.

## 5. Pantallas MVP → Endpoints (REQUERIMIENTOS §7 / INTEGRACION §4)
- Registro/Login: select carreras, registro→login, login guarda token, rehidratar /auth/me
- Plan estudios: carreras, detalle carrera, materias carrera, buscar, detalle materia, correlativas
- Mis cursadas: listar, promedio, agregar, editar, quitar
- Recursos: lista filtrada, detalle, crear, editar/borrar dueño, convenios/TT lectura
- Recordatorios: agenda filtrada, crear, borrar

## 6. NFR y Reglas IA (REQUERIMIENTOS §8)
Wrapper único baseURL+Authorization+parser ApiError+401 side-effect; TanStack Query keys endpoint+params invalidar mutations; forms 422→errors[]; ownership `usuario_id===usuario.id`; Pagination reutilizable; Auth guard redirect; env VITE_API_URL; No inventar endpoints; Qué NO hacer: no mandar usuario_id en 3 POSTs, no mandar rol registro, no parsear 204, no refresh.

## 7. Criterios Aceptación
- Auth flujo completo + 401 interceptor + carrera select
- 5 pantallas navegables con guards y paginación reutilizable
- Ownership y 403/404/409/422 manejados (toast + field errors)
- Wrapper único + fecha futura 422 + DELETE 204

## 8. Fuera Alcance
Refresh, logout servidor, edición recordatorio, escritura convenios/TT para estudiante.
