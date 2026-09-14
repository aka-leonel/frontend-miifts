# Sprint Front - miIFTS

**Objetivo:** front funcional del MVP contra la API existente, siguiendo
`docs/INTEGRACION_FRONT.md` (contexto del proyecto + contrato de la API + arquitectura del
front: arquetipos, componentes, `<FormModal>`, tokens de Tailwind, del mock de Figma al código).

> **Stack:** Vite + React + TypeScript + React Router + TanStack Query + **Tailwind** (dark fijo).
> **Base URL dev:** `VITE_API_URL=http://localhost:8000`. CORS ya acepta `:5173`.
> **Modelos:** `npm run gen:api` (`openapi-typescript`). No tipear las respuestas a mano.
> **Un solo pop-up:** todo formulario es `<FormModal>` + `fieldSpec` (`docs/INTEGRACION_FRONT.md` §2.9).

### Capas (igual que el back: repository → service → router)

```
src/api/          apiClient (fetch + Authorization + parseo ApiError + 401)   ← ya hecho
src/api/types.ts  alias de dominio sobre schema.d.ts generado                 ← ya hecho
src/features/<x>/
  service.ts      funciones puras tipadas, 1 por endpoint (sin React): getMisMaterias(), createCursada()...
  hooks.ts        TanStack Query encima de service.ts: useMisMaterias(), useCrearCursada()...
  <Componentes>.tsx
```

Reglas: los componentes usan **hooks**, no `service.ts` ni `apiClient` directo.
Los `fieldSpec` (`submit.create/update`) llaman a funciones de `service.ts`.
Cada integrante escribe el `service.ts` + `hooks.ts` de **sus** features, más los tipos
chicos de vista/formulario que necesite (los de dominio ya están generados).

---

## ✅ Ya entregado (Fundaciones — no rehacer)

- `src/api/`: `schema.d.ts` generado, `types.ts` con alias, `client.ts` (`apiClient` +
  `Authorization` + parseo `ApiError` + efecto global `401 → logout`).
- `src/auth/`: `AuthProvider` / `useAuth` (`{ usuario, token, login, register, logout }`
  en `localStorage`), `<RutaProtegida>`.
- Tailwind con los **tokens del design system** (`bg #111218`, `card #1A1B23`,
  `surface2 #2A2B36`, `primary #8C7DFF`, `secondary #B87EED`, `accent #CFFF5E`,
  `ok #3FB950`, texto `#E8E8F0 / #9A9AB0`; radios `card 14 / btn 10 / pill 20`; Inter;
  `<html class="dark">`).
- `AppShell` + `BottomTabs` (5: Inicio · Materias · Recordat. · Convenios · Perfil).
- Onboarding: `/login`, `/registro`, `/onboarding/carrera`.
- Primitivos base (Tier 0): `Button`, `Field`, `TextInput`, `Select`, `NumberInput`,
  `Switch`, `Chip`, `Card`, `Modal`, `Tabs`, `IconButton`.
- `features/catalogo/`: `getCarreras()`, `useCarreras()`.

> Si algo de esto falta o está a medias, se completa antes de arrancar las tareas de abajo.

---

## 🧩 Módulos compartidos — un dueño, los demás importan

Nadie duplica ni pisa archivos: cada módulo tiene **un dueño** que lo escribe completo; el
resto lo importa. Si necesitás algo que "le toca" a otro módulo, se lo pedís al dueño.

| Módulo | Dueño | Lo consumen también |
|--------|-------|---------------------|
| `components/FormModal` + `EntityForm` | **Int. 1** | 2, 3, 4 |
| `components/` kit UX (`ListState`, `Paginador`, `EmptyState`, `ErrorState`, `Skeleton`, `ConfirmDialog`, `Toaster`/`useToast`, `useApiForm`) | **Int. 1** | 2, 3, 4 |
| `features/catalogo/` — `getMateriasDeCarrera(id)` (además de `getCarreras`, ya hecho) | **Int. 2** amplía | Int. 2 |
| `features/materias/` — `service.ts`/`hooks.ts` (mis materias, promedio, cursada CRUD) + `MateriaCard`, `ByteWidget`, `PromedioCard`, `estadoLabel`, `materiaUsuarioSpec` | **Int. 2** | Int. 3 (`materiaUsuarioSpec`) |
| `features/materia-detalle/` — `getMateria`, `getCorrelativas` + `CorrelativaItem` | **Int. 3** | — |
| `features/recursos/` — `service.ts`/`hooks.ts` + `RecursoCard` + `recursoSpec` | **Int. 3** | — |
| `features/recordatorios/` — `service.ts`/`hooks.ts` (`getRecordatorios(filtros)`, crear, borrar) + `RecordatorioCard` + `recordatorioSpec` | **Int. 4** | Int. 3 (sección por materia), Int. 2 (próximos en Inicio) |
| `features/convenios/` — `getConvenios`, `getTalentoTech` + hooks | **Int. 1** | — |
| `features/perfil/` — `getAuthMe`, `updateAuthMe` + hooks + `PerfilHeader` | **Int. 4** | — |

`GET /recordatorios/` es el único endpoint que usan dos pantallas (agenda de Int. 4 y
sección por materia de Int. 3): **una sola** `features/recordatorios/`, dueño Int. 4, con
`getRecordatorios(filtros)` que cubre los dos casos.

---

## 📊 Tareas


Integrante 4
Perfil · Convenios · UX
≈5d
S4-16
Alta
0.5d
Bloquear el cambio de carrera en Perfil
Bug reportado por QA. El <select> de carrera es editable y "Guardar cambios" es 100% cosmético (no hay PATCH /auth/me). Pasarlo a solo lectura hasta que ese endpoint exista — no mentir con un "✓ Guardado" falso.
S4-17
Alta
1d
Fix: Convenios no trae datos
Bug reportado por QA. El código de convenios/service.ts pega bien a /convenios/ y /talentotech/ públicos — validar contra el backend real si hay datos cargados o si el fetch falla en silencio.
S4-18
Media
1d
Sacar hardcode de convenios/service.ts
Arrays universidades y talentoTech usados como fallback de DEMO_MODE — limpiar junto con S4-04.
← S4-04
S4-19
Media
1d
Borrar recursosInit / recordatoriosInit
Últimos arrays muertos del import de Figma en App.tsx. Confirmar que ninguna pantalla los sigue usando antes de borrar.
S4-20
Media
1.5d
Responsive de Inicio / Recordatorios / Convenios / Perfil
Grids adaptables en las 4 pantallas; ninguna debe depender del frame fijo de 430px que sac

---

## 🔌 Dependencias del backend (pedir a Sprint 2)

| Falta | Para | Workaround mientras tanto |
|-------|------|---------------------------|
| `PATCH /recordatorios/{id}` + schema `RecordatorioUpdate` | Botón "editar" de recordatorio (Int. 4 / Int. 3) | `DELETE` + `POST` (cambia el `id`) |
| `PATCH /auth/me` con `{ nombre?, carrera_id? }` | Editar perfil (Int. 4) | Campos solo visuales |

---



### Git Flow (repo del front)
```bash
git checkout main && git pull
git checkout -b feature/tu-nombre-tarea
git commit -m "feat: descripción clara"
git push -u origin feature/tu-nombre-tarea
# PR → main, review de ≥1 compañero
```
