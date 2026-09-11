# miIFTS - Referencia Backend para Agente Frontend (IA)

> **Propósito:** Este documento es el prompt/contexto que le pasás a un agente de IA para que desarrolle el frontend de **miIFTS** consumiendo el backend existente.
> **Fuente de verdad viva:** `GET http://localhost:8000/openapi.json` y Swagger en `/docs`. Copia versionada en `docs/openapi.json` (regenerar con `python scripts/export_openapi.py`).

---

## 1. Contexto del Producto

**miIFTS** es la plataforma académica para Institutos de Formación Técnica Superior (IFTS). Gestiona:
- Autenticación y perfiles (estudiante/admin)
- Catálogo académico (carreras, materias, correlativas)
- Cursadas del alumno y promedio
- Recursos de estudio
- Convenios interinstitucionales y cursos TalentoTech
- Recordatorios/agenda personal

---

## 2. Stack y Configuración

| Item | Valor |
|------|-------|
| **Framework Backend** | FastAPI 0.115.5 + SQLAlchemy 2.0 + Pydantic v2 |
| **Base URL (dev)** | `http://localhost:8000` — configurable en front como `VITE_API_URL` |
| **CORS** | `http://localhost:5173`, `http://127.0.0.1:5173` (Vite default). Otro origen → pedir agregar a `CORS_ORIGINS` en backend |
| **Formato** | JSON. Fechas ISO 8601 |
| **Docs interactivas** | `http://localhost:8000/docs` (Swagger) |

---

## 3. Convenciones Globales (obligatorias)

### 3.1 Shapes de respuesta
| Caso | Forma |
|------|-------|
| Colección (`GET` listado) | `{ items: T[], total, page, per_page, total_pages }` → `PaginatedResponse<T>` |
| Recurso (`GET/POST/PUT/PATCH` ítem) | objeto plano `T` |
| `DELETE` | `204` sin body |
| Error | `{ detail: string }` |
| Validación `422` | `{ detail: string, errors: { campo: string, msg: string }[] }` |

- `detail` siempre string → mostrar en toast.
- `errors[].campo` es el nombre del field (con punto si es anidado) → pintar en el form.

### 3.2 Paginación (todos los listados)
Query params: `?page=1&per_page=20` (defaults: `page=1`, `per_page=20`, rango `1-100`). Página fuera de rango → `items: []` + `total` real.

### 3.3 Códigos HTTP
`200` OK · `201` Creado · `204` Borrado · `401` Token inválido → limpiar sesión → login · `403` Sin permiso · `404` No existe · `409` Duplicado/regla de negocio · `422` Validación

---

## 4. Autenticación (JWT)

- **JWT:** HS256, expira **24h**. No hay refresh/logout servidor → cerrar sesión = borrar token.
- **Header:** `Authorization: Bearer <access_token>` en cada request autenticado.
- **Roles:** `estudiante` (default, gestiona lo suyo) · `admin` (administra catálogo). El backend autoriza (403); el front solo oculta/muestra UI según `usuario.rol`.

### Endpoints Auth

| Método | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| `POST` | `/auth/registro` | Pub | `{ nombre, email, password, carrera_id }` | `201` → `UsuarioResponse` (sin token) |
| `POST` | `/auth/login` | Pub | `{ email, password }` | `200` → `{ access_token, token_type:"bearer", usuario: Usuario }` |
| `GET` | `/auth/me` | Bearer | — | `UsuarioResponse` |
| `GET` | `/auth/verify` | Bearer | — | `{ valid: true, user_id }` |

**Validaciones:** `password` ≥8 con letra+número · `nombre` 2-100 · `carrera_id` debe existir (cargar con `GET /materias/carreras`) · `email` único. `rol` se ignora en registro (siempre `estudiante`).

**Flujo frontend:** registro → login → guardar `access_token` + `usuario` (localStorage/memoria) → interceptor 401 → logout. Login ya trae `usuario`.

---

## 5. Referencia de Endpoints por Dominio

### 5.1 Catálogo Académico

| Método | Path | Acceso | Notas |
|--------|------|--------|-------|
| `GET` | `/materias/carreras?page=&per_page=` | Pub | paginado `Carrera` |
| `GET` | `/materias/carreras/{id}` | Pub | `Carrera` · 404 |
| `POST` | `/materias/carreras` | Admin | `CarreraCreate` |
| `PUT` | `/materias/carreras/{id}` | Admin | `CarreraUpdate` (parcial) |
| `DELETE` | `/materias/carreras/{id}` | Admin | 409 si tiene materias |
| `GET` | `/materias/carrera/{carrera_id}?page=&per_page=` | Pub | materias de carrera → paginado `Materia` |
| `GET` | `/materias/buscar?q=&anio=&cuatrimestre=&page=&per_page=` | Pub | `q` requerido (nombre/código), filtros opcionales |
| `GET` | `/materias/correlativas/{materia_id}?page=&per_page=` | Pub | paginado `Correlativa` (incluye `requiere: Materia`) |
| `GET` | `/materias/{materia_id}` | Pub | `Materia` · 404 |
| `POST` | `/materias/` | Admin | `MateriaCreate` · 409 si `codigo` duplicado en carrera |
| `PUT` | `/materias/{id}` | Admin | `MateriaUpdate` |
| `DELETE` | `/materias/{id}` | Admin | 409 si tiene cursadas |

**Validaciones:** `anio` 1-6 · `cuatrimestre` 1|2 · `duracion_cuatrimestres` 1-12 · `nombre` ≥2 · `codigo` no vacío (se guarda upper).

### 5.2 Cursadas y Promedio

> Identidad desde **token**. `POST/PATCH/DELETE` no llevan `usuario_id` (sale del JWT). `GET` con `{usuario_id}` → solo propio o admin (403).

| Método | Path | Acceso | Notas |
|--------|------|--------|-------|
| `GET` | `/materias/usuario/{usuario_id}?page=&per_page=` | Auth (propio/admin) | paginado `Cursada` |
| `POST` | `/materias/usuario` | Auth | `{ materia_id, cursando, nota_parcial_1, nota_parcial_2, nota_final }` · 409 duplicado o carrera distinta |
| `PATCH` | `/materias/cursada/{materia_usuario_id}` | Auth (dueño) | `MateriaUsuarioUpdate` · 404 si es de otro |
| `DELETE` | `/materias/cursada/{materia_usuario_id}` | Auth (dueño) | 204 · 404 si es de otro |
| `GET` | `/materias/promedio/{usuario_id}` | Auth (propio/admin) | `{ promedio: number\|null, materias_computadas }` |

Notas 1-10 (422). `estado` derivado: `cursando` si `cursando=true`, sino `aprobada` si `nota_final!=null`, sino `pendiente`.

### 5.3 Recursos de Estudio

| Método | Path | Acceso | Notas |
|--------|------|--------|-------|
| `GET` | `/recursos/?materia_id=&tipo=&desde=&hasta=&page=&per_page=` | Pub | filtros + paginado → `Recurso` |
| `GET` | `/recursos/materia/{materia_id}?page=&per_page=` | Pub | paginado |
| `GET` | `/recursos/usuario/{usuario_id}?page=&per_page=` | Pub | paginado |
| `GET` | `/recursos/{id}` | Pub | `Recurso` |
| `POST` | `/recursos/` | Auth | `RecursoCreate` (sin `usuario_id`) |
| `PUT` | `/recursos/{id}` | Auth (dueño) | 403 si es de otro |
| `DELETE` | `/recursos/{id}` | Auth (dueño) | 403 si es de otro |

`url` debe ser HttpUrl · `titulo` 1-150 · `tipo` libre (`pdf|video|link`) · `fecha_creacion` la pone el servidor.

### 5.4 Convenios y TalentoTech (solo lectura para estudiante)

| Método | Path | Acceso |
|--------|------|--------|
| `GET` | `/convenios/?page=&per_page=` | Pub |
| `GET` | `/convenios/carrera/{carrera_id}?page=&per_page=` | Pub |
| `GET` | `/convenios/{id}` | Pub |
| `GET` | `/talentotech/?page=&per_page=` | Pub |
| `GET` | `/talentotech/carrera/{carrera_id}?page=&per_page=` | Pub |
| `GET` | `/talentotech/categoria/{categoria}?page=&per_page=` | Pub |
| `GET` | `/talentotech/{id}` | Pub |
| `POST/PUT/DELETE` | `/convenios/*`, `/talentotech/*` | Admin |

### 5.5 Recordatorios (Agenda)

> Identidad desde **token** — no mandar `usuario_id`.

| Método | Path | Acceso | Notas |
|--------|------|--------|-------|
| `GET` | `/recordatorios/?tipo=&desde=&hasta=&materia_id=&page=&per_page=` | Auth | solo del usuario del token, orden fecha desc → paginado |
| `POST` | `/recordatorios/` | Auth | `{ titulo, fecha: ISO futura, tipo, materia_id? }` · 422 si fecha no futura |
| `DELETE` | `/recordatorios/{id}` | Auth (dueño) | 204 · 404 si es de otro (no revela existencia) |

`tipo` libre (convención `parcial|tp|final|otro`).

### 5.6 Health
`GET /` → `{ mensaje: "miIFTS API funcionando" }` · `GET /health` → `{ status: "ok" }`

---

## 6. Modelos TypeScript (copiar/pegar)

```ts
export interface Paginated<T> { items: T[]; total: number; page: number; per_page: number; total_pages: number; }
export interface ApiError { detail: string; errors?: { campo: string; msg: string }[]; }

export type Rol = "estudiante" | "admin";
export interface Usuario { id: number; nombre: string; email: string; carrera_id: number; fecha_registro: string; rol: Rol; }
export interface RegistroRequest { nombre: string; email: string; password: string; carrera_id: number; }
export interface LoginRequest { email: string; password: string; }
export interface TokenResponse { access_token: string; token_type: "bearer"; usuario: Usuario | null; }

export interface Carrera { id: number; nombre: string; duracion_cuatrimestres: number; ifts_id: number; }
export interface Materia { id: number; nombre: string; codigo: string; carrera_id: number; anio: number; cuatrimestre: 1 | 2; }
export interface Correlativa { id: number; materia_id: number; requiere_id: number; requiere: Materia | null; }
export interface MateriaCreate { carrera_id: number; nombre: string; codigo: string; anio: number; cuatrimestre: 1 | 2; }

export type EstadoCursada = "cursando" | "aprobada" | "pendiente";
export interface Cursada { id: number; usuario_id: number; materia_id: number; cursando: boolean; estado: EstadoCursada; nota_parcial_1: number | null; nota_parcial_2: number | null; nota_final: number | null; }
export interface CursadaCreate { materia_id: number; cursando?: boolean; nota_parcial_1?: number | null; nota_parcial_2?: number | null; nota_final?: number | null; }
export interface Promedio { promedio: number | null; materias_computadas: number; }

export interface Recurso { id: number; usuario_id: number; fecha_creacion: string; titulo: string; url: string; descripcion: string; tipo: string | null; materia_id: number; }
export interface RecursoCreate { titulo: string; url: string; descripcion: string; tipo?: string | null; materia_id: number; }
export interface Convenio { id: number; institucion: string; carrera_destino: string; descripcion: string; link_info: string; carrera_id: number; }
export interface TalentoTech { id: number; carrera_id: number; nombre_curso: string; categoria: string; descripcion: string; duracion: string; link_inscripcion: string; }

export interface Recordatorio { id: number; titulo: string; fecha: string; tipo: string; usuario_id: number; materia_id: number | null; }
export interface RecordatorioCreate { titulo: string; fecha: string; tipo: string; materia_id?: number | null; }
```

Generación automática: `npx openapi-typescript docs/openapi.json -o src/api/schema.d.ts` o `orval`.

---

## 7. Pantallas MVP → Endpoints

| Pantalla | Acción | Request |
|----------|--------|---------|
| **Registro/Login** | select carreras | `GET /materias/carreras` |
| | registro | `POST /auth/registro` → `POST /auth/login` |
| | login | `POST /auth/login` → guarda token+usuario |
| | rehidratar | `GET /auth/me` (Bearer) |
| **Plan de estudios** | carreras | `GET /materias/carreras` |
| | detalle carrera | `GET /materias/carreras/{id}` |
| | materias carrera | `GET /materias/carrera/{carrera_id}` |
| | buscar | `GET /materias/buscar?q=&anio=&cuatrimestre=` |
| | detalle materia | `GET /materias/{id}` |
| | correlativas | `GET /materias/correlativas/{materia_id}` |
| **Mis cursadas** | listar | `GET /materias/usuario/{miId}` (Bearer) |
| | promedio | `GET /materias/promedio/{miId}` (Bearer) |
| | agregar | `POST /materias/usuario` (Bearer) |
| | editar | `PATCH /materias/cursada/{id}` (Bearer) |
| | quitar | `DELETE /materias/cursada/{id}` (Bearer) |
| **Recursos** | listar filtrado | `GET /recursos/?materia_id=&tipo=&desde=&hasta=` |
| | detalle | `GET /recursos/{id}` |
| | crear | `POST /recursos/` (Bearer) |
| | editar/borrar dueño | `PUT/DELETE /recursos/{id}` (Bearer) |
| | convenios/TT | `GET /convenios/*`, `GET /talentotech/*` |
| **Recordatorios** | agenda | `GET /recordatorios/?tipo=&desde=&hasta=&materia_id=` (Bearer) |
| | crear | `POST /recordatorios/` (Bearer) |
| | borrar | `DELETE /recordatorios/{id}` (Bearer) |

---

## 8. Reglas para el Agente IA

1. **Wrapper HTTP único** con baseURL, header Authorization, parser `ApiError`, side-effect 401.
2. **TanStack Query** (o similar): keys por endpoint+params; invalidar en mutations (ej: crear cursada → invalidar `["cursadas", userId]` y `["promedio", userId]`).
3. **Formularios:** en `422` recorrer `errors[]` → `setError(campo, msg)`; resto → toast `detail`.
4. **Ownership:** comparar `recurso.usuario_id === usuario.id` para mostrar Editar/Borrar; manejar 403 igual.
5. **Paginación:** componente reutilizable `<Pagination paginated={Paginated}>`.
6. **Auth guard:** rutas protegidas redirigen a login si no hay token; en 401 limpiar storage.
7. **Env:** `VITE_API_URL=http://localhost:8000`.
8. **No inventar endpoints.** Todo lo que no está listado no existe. Consultar `openapi.json` si duda.

---

## 9. Qué NO hacer

- No mandar `usuario_id` en `POST /materias/usuario`, `POST /recursos/`, `POST /recordatorios/` (sale del token).
- No mandar `rol` en registro.
- No parsear body en `204`.
- No asumir refresh token.

---

## 10. Archivos de Referencia para el Agente

- `docs/INTEGRACION_FRONT.md` → guía completa con ejemplos y changelog Sprint 2
- `docs/openapi.json` → contrato OpenAPI (tipos y cliente generable)
- `http://localhost:8000/docs` → Swagger vivo

> Pasale a tu agente: **este archivo + `docs/openapi.json`**. Con eso tiene todo para implementar el frontend sin preguntar nada del backend.
