# Requirements — miIFTS Frontend

> Owner: Architect | Sources: `docs/REQUERIMIENTOS_FRONTEND_IA.md` (§1-10), `docs/INTEGRACION_FRONT.md` (§1-7), `docs/openapi.json` (v1.0.0), `docs/SPRINT5_FRONT.md` (S5-05→S5-08 Integrante 2)

## 1. Producto
Plataforma académica IFTS: auth/perfiles, catálogo (carreras/materias/correlativas), cursadas+promedio, recursos, convenios/TalentoTech, recordatorios/agenda. Backend FastAPI 0.115.5 + SQLAlchemy 2 + Pydantic v2, `VITE_API_URL=http://localhost:8000`, CORS `localhost:5173`, JSON ISO8601, Swagger `/docs`.

## 2. Convenciones Globales (obligatorias — docs §3 / INTEGRACION §1)
- Colección: `Paginated<T> = {items,total,page,per_page,total_pages}` ; Recurso: plano; DELETE 204 sin body; Error `{detail:string}`; 422 `{detail, errors:{campo,msg}[]}` campo con punto si anidado; `detail` → toast, `errors[]` → setError.
- Paginación: `?page=1&per_page=20` rango 1-100, fuera rango → `items:[]` + total real.
- Códigos: 200 OK, 201 Creado, 204 Borrado, 401 token inválido → limpiar sesión→login, 403 sin permiso, 404 no existe, 409 duplicado/regla negocio, 422 validación.

## 3. Funcionales

### FR1 Auth JWT HS256 24h sin refresh
- `POST /auth/registro` Pub {nombre 2-100, apellido 1-100, email único, password ≥8 letra+número, carrera_id existente} → 201 UsuarioResponse sin token, rol ignorado.
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

### FR7 Perfil Editable — Sprint 5 Integrante 2 (S5-05 → S5-08)
> Fuente: `SPRINT5_FRONT.md` § Integrante 2 + auditoría S4-16. Depende de S5-03 (identidad unificada en `useAuth()`).

- **Endpoint:** `PATCH /auth/me` Bearer (ya disponible en backend Sprint 5; no existía en Sprint 4 §1.7). Request parcial `{nombre?, apellido?, email?}` — **solo esos 3 campos**. `carrera_id` **no** se envía ni es editable (restricción de negocio validada por backend); `password` **no** pertenece a este form (va por flujo "Olvidé mi contraseña" Integrante 4).
- **S5-05 Edición:** `PerfilScreen` debe exponer 3 inputs editables (nombre, apellido, email) + carrera en solo lectura (`disabled` + `cursor-not-allowed` + valor derivado de `GET /auth/me` + `useCarreras` para nombre). Botón "Guardar" habilitado solo si hay cambios y validación cliente pasa. Al guardar → `PATCH /auth/me` via `apiClient` con `auth:true`. Éxito 200 → toast éxito + cerrar modo edición. Carrera nunca editable.
- **S5-06 Errores:** 422 validación → mapear `errors[]` a campo con `useApiForm` (`nombre` 2-100, `apellido` 2-100, `email` formato válido) → `fieldErrors` bajo input. 409 email duplicado → `detail` toast error (no field). Otros 401/403/500 → toast `detail`. Mismo patrón que `materiaUsuarioSpec`/`recursoSpec` (`onError {422:fields, 409:toast}`).
- **S5-07 Sincronización:** Tras 200, refrescar identidad en `AuthContext` (`usuario`) + `localStorage` (`miifts_usuario`) sin recarga. Debe reflejarse al instante en `InicioScreen` (bienvenida `usuario.nombre`), avatar/iniciales y cualquier `useAuth().usuario`. Invalidar `['auth-me']` si se usa, pero la fuente de verdad es `useAuth()`. No depender de S5-03 `getMiUsuario()` legacy.
- **S5-08 No-contraseña (Sprint 5 original):** Verificación negativa original: `PATCH /auth/me` nunca recibe `password`. Superado por FR8 si se habilita cambio dedicado.
- **Estados UI:** `loading` inicial → `Skeleton`; `error` carga → `ErrorState` con retry `refetch`; guardando → botón `Guardando...` disabled + spinner; sin cambios → guardar disabled.
- **Dependencia:** S5-03 debe estar completo (`InicioScreen`/`MisMateriasScreen`/`MateriaDetalleScreen` migrados a `useAuth().usuario`) para que S5-05 lea/escriba identidad única.

### FR8 Cambio de contraseña desde Perfil — Extensión Sprint 5 (integración lista)
> Fuente: solicitud usuario 2026-09-16 + auditoría live `openapi.json` (no existe `POST /auth/change-password` aún). **Frontend listo, backend pendiente: solo falta integrar string de ruta.**

- **Endpoint (único punto de integración):** `POST /auth/change-password` Bearer (o el que defina backend: `PATCH /auth/password`, `POST /auth/me/password`). Contrato: `ChangePasswordRequest {current_password: string, new_password: string}` → 200/204 éxito, 401 current incorrecto, 422 validación (`new_password` ≥8 letra+número), 400/403. **Constante `CHANGE_PASSWORD_PATH` en `src/auth/api.ts` es el único lugar a editar cuando el back esté listo.**
- **Seguridad:** contraseña se envía en texto plano por TLS (HTTPS), **nunca hasheada en frontend**. Backend hashea con bcrypt y nunca loguea. Inputs `type="password"` con `autoComplete="current-password"` / `new-password`, no se guarda en `localStorage`, no se envía en `PATCH /auth/me`.
- **UI:** `PerfilScreen` botón "Cambiar contraseña" abre modal limpio (sin aviso de endpoint faltante) con 3 campos: actual, nueva, confirmar. Validación cliente: actual requerido, nueva ≥8 letra+número, confirmar === nueva. Al guardar → `POST CHANGE_PASSWORD_PATH` con `auth:true` vía `apiClient`. Éxito → toast "Contraseña actualizada" + cerrar modal + limpiar campos. Error 422 → `fieldErrors` mapeado (`new_password`→`next`), 401 → toast "Contraseña actual incorrecta".
- **NFR:** sin `DEMO_MODE`, reutiliza `useToast`/`ApiError`, deshabilita botón mientras `pwdSaving`, no toca `carrera` ni perfil.

## 4. Modelos TS (copiar de REQUERIMIENTOS §6)
Paginated<T>, ApiError, Rol, Usuario {id,nombre,apellido,email,carrera_id,fecha_registro,rol}, RegistroRequest, LoginRequest, TokenResponse, Carrera, Materia, Correlativa, MateriaCreate, EstadoCursada, Cursada, CursadaCreate, Promedio, Recurso, RecursoCreate, Convenio, TalentoTech, Recordatorio, RecordatorioCreate. `UsuarioUpdate = Partial<Pick<Usuario,"nombre"|"apellido"|"email">>` para PATCH /auth/me, `ChangePasswordRequest {current_password, new_password}` para POST /auth/change-password. Generables vía `npx openapi-typescript docs/openapi.json -o src/api/schema.d.ts`.

## 5. Pantallas MVP → Endpoints (REQUERIMIENTOS §7 / INTEGRACION §4)
- Registro/Login: select carreras, registro→login, login guarda token, rehidratar /auth/me
- Plan estudios: carreras, detalle carrera, materias carrera, buscar, detalle materia, correlativas
- Mis cursadas: listar, promedio, agregar, editar, quitar
- Recursos: lista filtrada, detalle, crear, editar/borrar dueño, convenios/TT lectura
- Recordatorios: agenda filtrada, crear, borrar
- **Perfil (Sprint5):** `GET /auth/me` poblar form + `PATCH /auth/me` guardar (nombre/apellido/email), carrera readOnly; **Cambio contraseña:** modal `POST /auth/change-password` (integración lista, solo falta string de ruta) 

## 6. NFR y Reglas IA (REQUERIMIENTOS §8)
Wrapper único baseURL+Authorization+parser ApiError+401 side-effect; TanStack Query keys endpoint+params invalidar mutations; forms 422→errors[]; ownership `usuario_id===usuario.id`; Pagination reutilizable; Auth guard redirect; env VITE_API_URL; No inventar endpoints; Qué NO hacer: no mandar usuario_id en 3 POSTs, no mandar rol registro, no parsear 204, no refresh.
- **Sprint5 Perfil:** sin `DEMO_MODE`/`demo.ts`; solo `apiClient` + `useApiForm`/`useToast`; `PATCH /auth/me` con `auth:true`; carrera jamás editable; password **solo** vía `POST /auth/change-password` modal dedicado (TLS + bcrypt backend, nunca hash frontend).

## 7. Criterios Aceptación
- Auth flujo completo + 401 interceptor + carrera select
- 5 pantallas navegables con guards y paginación reutilizable
- Ownership y 403/404/409/422 manejados (toast + field errors)
- Wrapper único + fecha futura 422 + DELETE 204
- **Sprint5 Perfil (para Tester validar contra backend real):**
  - [ ] Edita nombre/apellido/email vía `PATCH /auth/me` real y persiste.
  - [ ] Carrera siempre readOnly (disabled, no request).
  - [ ] 422 mapea a campo, 409 email duplicado a toast.
  - [ ] Tras éxito, `useAuth().usuario` y `localStorage` actualizados sin reload (Inicio/avatar reflejan cambio).
  - [ ] Modal "Cambiar contraseña" existe limpio (sin aviso de endpoint faltante), 3 inputs `password`, validación cliente, envía `POST /auth/change-password` con `auth:true`, 422→fields, 401→toast, éxito→toast (integración lista, solo cambiar `CHANGE_PASSWORD_PATH` si el back usa otra ruta).

## 8. Fuera Alcance
Refresh, logout servidor, edición recordatorio, escritura convenios/TT para estudiante.
- **Sprint5 Perfil:** cambio de `carrera_id` (bloqueado). Cambio de contraseña antes iba por "Olvidé mi contraseña" (Int.4) pero ahora FR8 lo habilita desde Perfil vía endpoint dedicado.
