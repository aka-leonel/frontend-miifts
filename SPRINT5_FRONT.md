# Sprint 5 · Frontend miIFTS

**Perfil editable, recuperar contraseña, y cerrar la deuda que dejó Sprint 4.**

Sprint 4 cerró casi todo lo que se propuso (auth real, Docker, sin mocks, responsive), pero quedaron puntas sueltas — algunas ya detectadas en el checklist de "Definición de terminado" de `SPRINT4_FRONT.md`, otras aparecidas recién ahora al auditar `dev` a fondo. Este sprint cierra esas puntas y suma dos features de negocio: editar perfil y recuperar contraseña.

## Objetivos

- **✅ Cerrar Sprint 4** — Los 3 ítems de su "Definición de terminado" que quedaron a medias (ver auditoría).
- **👤 Perfil editable** — Nombre, apellido y email editables vía `PATCH /auth/me` (ya existe en el backend). **Carrera queda bloqueada** — restricción de negocio ya validada por el backend, no se toca. **No entra edición de contraseña acá** — decisión de producto: el cambio de contraseña va únicamente por el flujo de recuperación (abajo).
- **🔑 Olvidé mi contraseña** — Botón en Login + flujo completo de recupero. Requiere endpoints nuevos en el backend: se coordina en este sprint, no se asume que ya existen.

**Meta:** 19 tickets · S5-01 → S5-19 · 5 integrantes · Base: `dev` @ `dd2f7d5`

---

## Auditoría: qué quedó de Sprint 4

Repaso de `dev` contra los 20 tickets de `SPRINT4_FRONT.md` y su "Definición de terminado". `✅` cerrado, `🟡` parcial, `❌` no arrancó.

| Ticket S4 | Estado | Detalle |
|---|---|---|
| S4-01 Restaurar AuthProvider | 🟡 | `useAuth()` existe y funciona (login/registro/me), pero varias pantallas (`InicioScreen`, `MisMateriasScreen`, `MateriaDetalleScreen`, `PerfilScreen`) siguen leyendo la identidad de `api/scope.ts → getMiUsuario()` en vez de `useAuth().usuario`. Conviven dos fuentes de "quién es el usuario logueado". `RutaProtegida`/`RutaAdmin` existen como archivos pero no se usan (no hay router en esta app) — código muerto. |
| S4-02 Interceptor 401 global | 🟡 | `setUnauthorizedHandler(logout)` sí limpia `localStorage` en un 401. Pero nada redirige a Login: `App.tsx` calcula `screen` inicial una sola vez con `haySesion()` y nunca vuelve a mirar la sesión. Combinado con el fallback a `DEMO_USUARIO` de `scope.ts`, un 401 a mitad de sesión deja a la app mostrando **datos demo en la misma pantalla**, no un logout visible. |
| S4-03 Registro real | ✅ | Además, esta semana se encontraron y cerraron 4 bugs que bloqueaban el flujo end-to-end (no estaban en el radar de S4): backend exige `apellido` (campo nuevo, front no lo mandaba), `.env` apuntaba a sí mismo, un efecto en `CarreraScreen` quedaba colgado en dev por `React.StrictMode`, y la validación de contraseña débil no avisaba (el toast quedaba inalcanzable con el botón disabled). Ver commits `68a43a5`, `3127f3a`, `17d6799`, `bf45064`, `dd2f7d5`. |
| S4-04 Matar DEMO_MODE | 🟡 | El flag `DEMO_MODE` ya no existe en ningún `service.ts` (bien). Quedan **4 archivos `demo.ts` huérfanos** sin borrar: `catalogo`, `materias`, `recordatorios`, `recursos` — ninguno se importa desde ningún lado, cero impacto en runtime, solo falta el `rm`. |
| S4-05 Docker | ✅ | `Dockerfile` + `docker-compose.yml` funcionan (se probó levantando el stack completo). Se agregó `restart: on-failure:5` al servicio `api` para absorber un blip de DNS al arrancar en Docker Desktop/Windows. |
| S4-06 Shell responsive | 🟡 | Se sacó el `maxWidth: 430` fijo (ahora `sm:max-w-2xl lg:max-w-5xl`). Pero el `SidebarNav` para desktop **se construyó completo y nunca se conectó** — en `md:`+ seguís viendo el `BottomNav` de mobile estirado a todo el ancho en vez de un sidebar. |
| S4-07 Responsive /materias | ✅ | Grid `md:grid-cols-2 lg:grid-cols-3` en `MisMateriasScreen`. |
| S4-08 Estado "desaprobada" | ✅ | El backend ya deriva los 5 estados (`cursando/promocionada/aprobada/desaprobada/pendiente`) y el front los pinta bien. |
| S4-09 Select de materia vacío | ✅ | Hay un aviso claro cuando la carrera no tiene materias cargadas. *(Nota: esta semana además apareció y se corrigió un bug distinto en el mismo selector — quedaba **bloqueado siempre**, incluso con materias cargadas, por un `lockOnEdit` mal aplicado en `EntityForm`. Ya cerrado.)* |
| S4-10 /admin/catalogo real | ✅ | ABM de carreras y materias contra la API real, sin mocks. |
| S4-11 Fix guardar recordatorio | ✅ | Confirmado funcionando contra el backend (alta y edición reales). |
| S4-12 Sacar demo.ts materia-detalle | ✅ | |
| S4-13 Responsive /materias/:id | ✅ | |
| S4-14 Coordinar PATCH /recordatorios/{id} | ✅ | El backend ya lo entregó; el front lo usa (se retiró el workaround `DELETE`+`POST`). |
| S4-15 Borrar DetalleScreen muerto | ✅ | Se encontró que rompía `tsc --noEmit` (referenciaba componentes ya borrados) y se eliminó. |
| S4-16 Bloquear cambio de carrera en Perfil | ✅ | Sobre-cumplido: **todo** el form de Perfil quedó de solo lectura (no solo carrera), a falta de `PATCH /auth/me`. Ese endpoint **ya existe** en el backend — de ahí sale la tarea de Perfil editable de este sprint. |
| S4-17 Convenios no trae datos | ✅ reclasificado | El código pega bien a `/convenios/` y `/talentotech/` — el backend responde `200` con `items: []` porque no hay datos sembrados. No es bug de front. |
| S4-18 Sacar hardcode convenios | ✅ | |
| S4-19 Borrar recursosInit/recordatoriosInit | ✅ | |
| S4-20 Responsive Inicio/Recordatorios/Convenios/Perfil | 🟡 | Inicio, Convenios y Perfil tienen contenedor + grid responsive. **Recordatorios quedó afuera**: ni el contenedor `mx-auto max-w-lg sm:max-w-2xl lg:max-w-5xl` ni una grid `sm:`/`lg:` — es la única pantalla que sigue siendo una columna angosta sin importar el ancho. |

**Definición de terminado de S4 — repaso:**
- [x] `grep DEMO_MODE` limpio.
- [ ] Cero `demo.ts` — quedan 4 (S5-04).
- [x] `App.tsx` sin los arrays muertos de Figma.
- [ ] Se ve bien en 375/768/1440 — falta Recordatorios (S5-10) y el sidebar de desktop (S5-09).
- [x] `docker compose up` levanta todo.
- [~] Bugs de QA cerrados — los 6 originales sí, pero aparecieron 4 más esta ronda (ya cerrados, ver S4-03 arriba) más el logout no-reactivo (S5-01).

---

## Reparto de tareas · 5 integrantes

### Integrante 1 — Sesión e identidad (≈4d)

Cierra S4-01/S4-02 de verdad: hoy "cerrar sesión" solo funciona si el usuario aprieta el botón a mano.

| ID | Prioridad | Días | Ticket | Dependencia |
|---|---|---|---|---|
| S5-01 | Alta | 1d | **Logout reactivo de verdad** — `App.tsx` tiene que reaccionar cuando `useAuth().token` se vuelve `null` (por 401 automático o por logout manual) y mandar a `screen = "login"` siempre, no solo cuando alguien clickea "Cerrar sesión". Hoy `screen` se inicializa una sola vez con `haySesion()` y nunca se vuelve a evaluar. | — |
| S5-02 | Alta | 1d | **Sacar (o encapsular) el fallback a `DEMO_USUARIO`** en `api/scope.ts` — hoy si no hay sesión, `getMiUsuario()` devuelve un usuario demo en silencio en vez de dejar evidente que no hay sesión. Combinado con S5-01, un 401 a mitad de uso no debería mostrar datos falsos. | ← S5-01 |
| S5-03 | Media | 1.5d | **Unificar identidad en `useAuth()`** — Migrar `InicioScreen`, `MisMateriasScreen`, `MateriaDetalleScreen` y lo que quede de `getMiUsuario()` a `useAuth().usuario`. Un solo lugar de verdad para "quién está logueado". | ← S5-02 |
| S5-04 | Baja | 0.5d | **Borrar los 4 `demo.ts` huérfanos** — `features/{catalogo,materias,recordatorios,recursos}/demo.ts`. Confirmar con `npx tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 6.0` que no rompe nada (deuda de S4-04). | — |

### Integrante 2 — Perfil editable (≈3.5d)

| ID | Prioridad | Días | Ticket | Dependencia |
|---|---|---|---|---|
| S5-05 | Alta | 2d | **Editar nombre / apellido / email en Perfil** — `PATCH /auth/me` (ya disponible). Carrera se mantiene de solo lectura (restricción del backend, no se toca). **No agregar campo de contraseña a este form** — el cambio de contraseña va solo por "Olvidé mi contraseña" (Integrante 4), es una decisión de producto explícita de este sprint. | ← S5-03 (usa `useAuth()`) |
| S5-06 | Alta | 0.5d | **Manejo de errores del guardado** — 422 (validación) mapeado a campo con `useApiForm`, 409 (email duplicado) por toast. Mismo patrón que ya usan `materiaUsuarioSpec`/`recursoSpec`. | ← S5-05 |
| S5-07 | Media | 0.5d | **Sincronizar el usuario actualizado** — tras un guardado exitoso, refrescar `usuario` en `AuthContext` + `localStorage` para que el nombre nuevo se vea al toque en Inicio/iniciales del avatar, sin tener que recargar. | ← S5-05 |
| S5-08 | Baja | 0.5d | **Confirmar que no hay forma de tocar la contraseña desde Perfil** — ni campo, ni botón, ni endpoint llamado desde ahí. Si alguien lo agregó "para completar el CRUD", sacarlo — es a propósito. | ← S5-05 |

### Integrante 3 — Shell responsive (≈3d)

Termina lo que dejó a medias S4-06 / S4-20.

| ID | Prioridad | Días | Ticket | Dependencia |
|---|---|---|---|---|
| S5-09 | Alta | 1.5d | **Conectar el `SidebarNav`** — Ya está construido (componente completo, sin usar). Reemplaza al `BottomNav` desde `md:` en el shell raíz de `App.tsx`; `BottomNav` sigue siendo el de mobile. | — |
| S5-10 | Alta | 1d | **Responsive de Recordatorios** — Es la única pantalla sin el contenedor (`mx-auto w-full max-w-lg sm:max-w-2xl lg:max-w-5xl`) ni grid `sm:`/`lg:` que ya tienen Inicio/Materias/Convenios/Perfil. Igualar el criterio. | — |
| S5-11 | Baja | 0.5d | **Pase de `tsc --noEmit` limpio** — Una vez conectado el sidebar (S5-09), correr `npx tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 6.0` y confirmar 0 errores (hoy el único que queda es `SidebarNav` sin usar). | ← S5-09 |

### Integrante 4 — Olvidé mi contraseña (≈4d, front + coordinación de back)

Feature nueva de punta a punta. **Necesita endpoints nuevos en el backend** — coordinar antes de arrancar el front a fondo.

| ID | Prioridad | Días | Ticket | Dependencia |
|---|---|---|---|---|
| S5-12 | Alta | 1d | **Coordinar contrato con backend** — Definir y documentar en `INTEGRACION_FRONT.md` (mismo criterio que los gaps anteriores): `POST /auth/forgot-password` (recibe email, dispara el envío) y `POST /auth/reset-password` (recibe token + contraseña nueva). Si el backend no llega con el endpoint a tiempo, dejarlo dicho explícito en el planning — no armar un mock silencioso. | — |
| S5-13 | Alta | 1d | **Botón + pantalla "¿Olvidaste tu contraseña?"** — Link visible en `LoginScreen`; pantalla nueva que pide el email y llama al endpoint de S5-12. Estado de éxito ("revisá tu email") aunque el email no exista (no revelar si un mail está registrado). | ← S5-12 |
| S5-14 | Alta | 1.5d | **Pantalla de contraseña nueva** — Recibe el token (por query param o similar, a definir con backend), pide contraseña + repetir, **mismo criterio de validación que Registro**: ≥8 caracteres, letra y número, confirmación, ícono de ojo para mostrar/ocultar (reusar el patrón de `Input` de `App.tsx` si se puede). | ← S5-12 |
| S5-15 | Media | 0.5d | **Estados de error** — Token vencido/inválido, mostrar mensaje claro y volver a "olvidé mi contraseña" en vez de un error genérico. | ← S5-14 |

### Integrante 5 — QA, regresión y cierre (≈3.5d)

| ID | Prioridad | Días | Ticket | Dependencia |
|---|---|---|---|---|
| S5-16 | Alta | 1d | **Regresión de los fixes de esta semana** — Recorrer contra el backend real: registro completo (con apellido y contraseña válida), alta de cursada eligiendo materia desde el selector, y confirmar que no reaparece ninguno de los 4 bugs cerrados en `68a43a5`/`3127f3a`/`17d6799`/`bf45064`/`dd2f7d5`. Dejar evidencia (capturas o notas) en el PR. | — |
| S5-17 | Media | 0.5d | **Cerrar S4-17 con el backend** — Confirmar si van a sembrar datos de Convenios/TalentoTech o si el "sin resultados" es el estado esperado en producción; documentarlo en vez de dejarlo como duda. | — |
| S5-18 | Media | 1d | **QA de Perfil editable + Olvidé mi contraseña** — Los dos features nuevos del sprint (Integrantes 2 y 4): casos felices, 422/409, y que Perfil realmente NO permita tocar la contraseña (S5-08). | ← S5-05, S5-14 |
| S5-19 | Baja | 1d | **Checklist final del sprint** — Repasar la "Definición de terminado" de abajo entera antes del cierre, ítem por ítem, y dejar asentado en el PR qué quedó para Sprint 6. | — |

---

## Definición de terminado del sprint

- [ ] Cerrar sesión (manual o por 401) siempre termina en `screen = "login"`.
- [ ] `getMiUsuario()` / `DEMO_USUARIO` fuera de las pantallas — todo pasa por `useAuth()`.
- [ ] Cero archivos `demo.ts` en `src/`.
- [ ] `SidebarNav` visible y funcional desde `md:` en adelante.
- [ ] Las 5 pantallas principales (Inicio, Materias, Recordatorios, Convenios, Perfil) responsive en 375px, 768px y 1440px.
- [ ] Perfil permite editar nombre, apellido y email contra `PATCH /auth/me` real, con 422/409 manejados — y **sin** ningún campo de contraseña.
- [ ] Flujo de "olvidé mi contraseña" completo (pedir email → link/token → contraseña nueva), o documentado como bloqueado por backend si el endpoint no llegó.
- [ ] `npx tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 6.0` sin errores.
- [ ] `docker compose up` sigue levantando todo sin pasos manuales.

---

*reparto de tareas · sprint5_front.md — generado a partir de SPRINT4_FRONT.md + auditoría de dev@dd2f7d5*
