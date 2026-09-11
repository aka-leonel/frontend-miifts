# miIFTS — Frontend

Front del MVP de miIFTS: auth, catálogo académico, mis cursadas + promedio,
recordatorios y recursos, consumiendo la API de
[`backend-ifts`](https://github.com/aka-leonel/backend-ifts).

**Stack:** Vite + React + TypeScript + React Router + TanStack Query.

## Requisitos

- Node.js 18+
- El backend corriendo en paralelo (ver `backend-ifts/TESTING.md`)

## Cómo correr

```bash
npm install
npm run dev
```

Queda escuchando en **http://localhost:5173**.

> El backend por defecto solo acepta CORS desde ese puerto
> (`http://localhost:5173`). Si corrés el front en otro puerto, hay que
> agregarlo a `CORS_ORIGINS` en el backend.

### Levantar el backend en paralelo

En otra terminal, parado en la carpeta del backend:

```powershell
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Si es la primera vez (o la base está vacía — por ejemplo recién clonaste el
repo), cargá los datos de prueba **antes** de levantar el server:

```powershell
python seed.py
```

Sin esto, listados como el `<select>` de carreras del registro van a
aparecer vacíos aunque todo el resto funcione bien.

## Variables de entorno

Archivo `.env` en la raíz:

```dotenv
VITE_API_URL=http://localhost:8000
```

Apunta a la URL base del backend. Cambiarla si el backend corre en otro
puerto o hostname.

## Estructura del proyecto

```
src/
├── api/            # capa HTTP genérica: client.ts, types.ts, scope.ts
├── auth/           # Context de sesión, llamadas de auth, RutaProtegida
├── components/     # componentes compartidos (Navbar, AppLayout, AuthLayout)
├── pages/          # una página por ruta (Login, Registro, Home, ...)
├── features/       # código específico de cada feature (catálogo, cursadas, recursos)
├── styles/         # CSS compartido no acoplado a un componente puntual
└── App.tsx         # ruteo principal
```

### La capa `api/` — para todo el equipo

- **`api/client.ts`** — `request<T>(path, options)`. Es el único lugar que
  debería llamar a `fetch()` en todo el proyecto. Maneja base URL, header
  `Authorization` (con `auth: true`), parseo de errores a `ApiRequestError`
  (`.status`, `.detail`, `.errors`), y un `401` global que desloguea solo.
- **`api/types.ts`** — tipos calcados del contrato del backend
  (`docs/INTEGRACION_FRONT.md` del repo de backend). Si el contrato cambia,
  actualizar acá primero.
- **`api/scope.ts`** — `getMiUsuarioId()`. Solo hace falta para los dos
  `GET` que todavía llevan el id en la URL
  (`/materias/usuario/{id}`, `/materias/promedio/{id}`). En todo lo demás
  (POST/PATCH/DELETE de cursadas y recordatorios) **no** hay que mandar
  `usuario_id` — sale del token solo.

### Auth — cómo usarlo desde cualquier pantalla

```tsx
import { useAuth } from "../auth/AuthContext";

function MiComponente() {
  const { usuario, token, login, registro, logout } = useAuth();
  // usuario: Usuario | null — datos del usuario logueado
  // usuario?.rol === "admin" para mostrar/ocultar cosas de admin
}
```

Toda ruta que necesite sesión va anidada dentro del `<Route>` protegido en
`App.tsx` (el que envuelve `<AppLayout />`), así hereda Navbar y el redirect
automático a `/login` sin hacer nada extra.

## Regenerar los tipos desde el contrato real

Si el backend cambia el contrato, la forma más confiable de actualizar
`api/types.ts` es regenerar contra el OpenAPI real (con el backend
levantado):

```bash
npx openapi-typescript http://localhost:8000/openapi.json -o src/api/schema.generado.d.ts
```

Esto genera un archivo aparte con los tipos "crudos" del OpenAPI — no
reemplaza automáticamente `api/types.ts` (que tiene nombres en español y
algunos ajustes manuales), pero sirve para diffear y detectar qué cambió.

## Estado actual (Fundaciones)

- [x] Scaffolding, tipos, cliente HTTP
- [x] Login / Registro / Logout
- [x] `<RutaProtegida>` y manejo de 401 global
- [x] Navbar con link condicional a admin
- [x] Integrado TanStack Query (QueryClientProvider)
- [x] Ruta `/admin/catalogo` y guard admin (`RutaAdmin`)
- [x] Manejo de expiración de sesión: timers y bandera `expirandoPronto`
- [x] Extender sesión mediante re-login (modal en Navbar) — no hay endpoint de refresh en el backend; se reautentica con /auth/login
