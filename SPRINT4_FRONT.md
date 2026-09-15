# Sprint 4 · Frontend miIFTS

**Cero datos hardcodeados, cien% responsive.**

Las pantallas ya pegan contra la API real, pero el sprint anterior dejó cascarones de Figma sin tirar, un shell de 430px fijo y ningún contenedor. Este sprint cierra esas tres deudas y reparte, dentro de cada tarea, los gaps de `INTEGRACION_FRONT.md` que todavía no tienen dueño.

## Objetivos

- **🎯 Sin mocks** — Fuera `DEMO_MODE`, los 6 `demo.ts` y los arrays muertos del import de Figma en `App.tsx`.
- **📦 Dockerizado** — Front con Nginx multi-stage + Dockerfile de referencia para el back (FastAPI/Uvicorn) + compose local.
- **📱 Responsive real** — Sale el `maxWidth:430px` fijo; layout fluido de mobile a desktop.

**Meta:** 20 tickets · S4-01 → S4-20 · 4 integrantes · 5–7 días estimados por integrante · Base: `dev` @ `fbf69d6`

---

## Qué falta según INTEGRACION_FRONT.md

Auditoría del código actual contra el contrato (§1.7, §2.6, §2.8, §2.12–2.13). Cada línea con `−` reaparece como ticket en el board de abajo.

### §2.8 / §2.12 · auth y fundaciones — `front`

- `src/auth/*` — AuthProvider, useAuth, RutaProtegida y AdminOnly existieron (commit `8110c7c`) y se borraron enteros en el merge "estilos figma" (`9e489e4`). Nunca volvieron a `dev`.
- `lib/apiClient.ts` — Sin el interceptor global de 401 → limpiar sesión + `/login` que pide §2.12; hoy cada pantalla recibe el error suelto.
- `RegistroScreen, CarreraScreen` — Siguen siendo el mock de Figma: "Continuar" navega de pantalla en pantalla sin llamar `POST /auth/registro` (§2.6, §2.11).

### §2.13 · datos hardcodeados — `front`

- `api/demo.ts + DEMO_MODE` — Interruptor y 5 `demo.ts` más (catalogo, materia-detalle, materias, recordatorios, recursos) — el paso 1 de §2.13 ("el resto se tira") nunca se terminó.
- `App.tsx` — `materiasInit`, `recursosInit`, `recordatoriosInit`, `carreras` — arrays del export original de Figma, código muerto desde que cada feature real los reemplazó.
- `convenios/service.ts` — Arrays `universidades` / `talentoTech` hardcodeados como fallback de `DEMO_MODE`.

### Responsive — sin sección propia en el doc, pedido de este sprint — `front`

- `App.tsx:668` — `maxWidth: 430` fijo en el shell raíz — en desktop la app es una columna angosta flotando en el centro de la pantalla.
- `src/**/*.tsx` — Cero usos de `sm:` / `md:` / `lg:` en toda la base — ninguna pantalla tiene un layout de tablet o desktop pensado.

### §1.7 · gaps de backend — fuera del alcance del front — `backend`

- `PATCH /recordatorios/{id}` — No existe todavía. Workaround actual: `DELETE` + `POST` al editar (documentado en `recordatorioSpec.ts`).
- `PATCH /auth/me` — No existe. Bloquea que Perfil guarde nombre/carrera de verdad — el front solo puede simular el guardado o bloquear el campo.

---

## Reparto de tareas · 4 integrantes

Cada carril mantiene el dominio que ya venía llevando cada integrante en Sprint 2/3. Los tickets marcados con "← S4-XX" dependen de que otro carril mergee primero.

### Integrante 1 — Fundaciones · Auth & Infra (≈7d)

| ID | Prioridad | Días | Ticket | Dependencia |
|---|---|---|---|---|
| S4-01 | Alta | 2d | **Restaurar AuthProvider / useAuth** — Traer de vuelta `src/auth/` (AuthContext, RutaProtegida, AdminOnly) desde el commit `8110c7c` antes de que "estilos figma" lo borrara. Cablear `App.tsx` para usarlo en vez de `api/scope.ts`. | — |
| S4-02 | Alta | 1d | **Interceptor 401 global** — En `apiClient`: cualquier `401` limpia `miifts_token`/`miifts_usuario` y redirige a `/login` (§2.12), sin que cada pantalla lo maneje a mano. | ← S4-01 |
| S4-03 | Alta | 1.5d | **Registro + onboarding de carrera reales** — `RegistroScreen` → `POST /auth/registro`; `CarreraScreen` → `GET /materias/carreras` real (sacar el array `carreras` hardcodeado) + auto-login al terminar (§2.6, §2.11). | ← S4-01 |
| S4-04 | Alta | 1d | **Matar DEMO_MODE global** — Borrar `api/demo.ts` y el flag `DEMO_MODE` de los 6 `service.ts` que lo leen. Avisar al equipo antes de mergear: S4-12 y S4-18 dependen de este orden. | — |
| S4-05 | Media | 1.5d | **Dockerfile del front + compose** — Multi-stage: `node:22` build de Vite → `nginx:alpine` sirviendo `/dist`. `docker-compose.yml` que levante front + back + la base juntos con un `docker compose up`. Dejar Dockerfile de referencia para el back (FastAPI + Uvicorn) si ese repo todavía no tiene uno. | — |

### Integrante 2 — Catálogo · Shell responsive (≈6d)

| ID | Prioridad | Días | Ticket | Dependencia |
|---|---|---|---|---|
| S4-06 | Alta | 2d | **Shell responsive del App raíz** — Sacar el `maxWidth: 430` fijo de `App.tsx:668`. Bottom-nav en mobile, sidebar de navegación desde `md:`, contenido a ancho fluido. | — |
| S4-07 | Alta | 1.5d | **Responsive de /materias** — `MisMateriasScreen` + `MateriaCard`: grid de 1 columna en mobile → 2–3 desde `md:`/`lg:`. | ← S4-06 |
| S4-08 | Media | 1d | **Estado "Reprobada" según la nota** — `estado.ts` marca "Aprobada" para cualquier `nota_final`, sin mirar si aprueba. Definir el umbral con el equipo (¿≥4? ¿≥6?) y sumar el estado a `EstadoUI` + `estadoBadgeClasses`. | — |
| S4-09 | Alta | 0.5d | **Fix: el select de materia sale vacío** — Bug reportado por QA. `materiaUsuarioSpec` depende de `useMateriasDeCarrera(usuario.carrera_id)` — confirmar que el login real persiste un `carrera_id` válido y que esa carrera tiene materias cargadas en el backend. | — |
| S4-10 | Baja | 1d | **/admin/catalogo real (opcional)** — Fila opcional de §2.6. Si entra en el sprint: ABM contra `POST/PUT/DELETE /materias/carreras` y `/materias/` reales, sin mocks. Si no entra, decirlo explícito en planning. | — |

### Integrante 3 — Detalle de materia · Recordatorios (≈5d)

| ID | Prioridad | Días | Ticket | Dependencia |
|---|---|---|---|---|
| S4-11 | Alta | 1d | **Fix: guardar recordatorio no funciona** — Bug reportado por QA ("posible problema de localhost"). Reproducir con la consola/network real contra el backend levantado y arreglar donde corresponda — no se encontró el bug por lectura estática de `recordatorioSpec.ts`. | — |
| S4-12 | Media | 1d | **Sacar demo.ts de materia-detalle** — Borrar `features/materia-detalle/demo.ts` y su rama `DEMO_MODE` en `service.ts`. | ← S4-04 |
| S4-13 | Media | 1.5d | **Responsive de /materias/:id** — Secciones Correlativas / Recursos / Recordatorios: 1 columna en mobile, 2 columnas desde `lg:`. | ← S4-06 |
| S4-14 | Baja | 1d | **Coordinar PATCH /recordatorios/{id} con backend** — Gap documentado en §1.7. Mientras no exista, probar a fondo el workaround actual (`DELETE`+`POST`) y dejar un comentario claro de por qué está así. | — |
| S4-15 | Baja | 0.5d | **Borrar DetalleScreen muerto** — En `App.tsx`, el mock viejo de detalle (`DetalleScreen`, usa `materiasInit`) sigue como fallback cuando no hay `materiaIdSeleccionada`. Sacarlo del todo. | — |

### Integrante 4 — Perfil · Convenios · UX (≈5d)

| ID | Prioridad | Días | Ticket | Dependencia |
|---|---|---|---|---|
| S4-16 | Alta | 0.5d | **Bloquear el cambio de carrera en Perfil** — Bug reportado por QA. El `<select>` de carrera es editable y "Guardar cambios" es 100% cosmético (no hay `PATCH /auth/me`). Pasarlo a solo lectura hasta que ese endpoint exista — no mentir con un "✓ Guardado" falso. | — |
| S4-17 | Alta | 1d | **Fix: Convenios no trae datos** — Bug reportado por QA. El código de `convenios/service.ts` pega bien a `/convenios/` y `/talentotech/` públicos — validar contra el backend real si hay datos cargados o si el fetch falla en silencio. | — |
| S4-18 | Media | 1d | **Sacar hardcode de convenios/service.ts** — Arrays `universidades` y `talentoTech` usados como fallback de `DEMO_MODE` — limpiar junto con S4-04. | ← S4-04 |
| S4-19 | Media | 1d | **Borrar recursosInit / recordatoriosInit** — Últimos arrays muertos del import de Figma en `App.tsx`. Confirmar que ninguna pantalla los sigue usando antes de borrar. | — |
| S4-20 | Media | 1.5d | **Responsive de Inicio / Recordatorios / Convenios / Perfil** — Grids adaptables en las 4 pantallas; ninguna debe depender del frame fijo de 430px que saca S4-06. | ← S4-06 |

---

## Definición de terminado del sprint

- [ ] `grep -r "DEMO_MODE" src` no devuelve nada.
- [ ] Cero archivos `demo.ts` en `src/`.
- [ ] `App.tsx` sin `materiasInit`, `recursosInit`, `recordatoriosInit` ni `carreras`.
- [ ] La app se ve y se usa bien en 375px, 768px y 1440px de ancho.
- [ ] `docker compose up` levanta front + back + base sin pasos manuales.
- [ ] Los 6 bugs reportados por QA en la ronda anterior, cerrados o re-clasificados como gap de backend.

---

*reparto de tareas · sprint4_front.md — generado a partir de INTEGRACION_FRONT.md + auditoría de dev@fbf69d6*
