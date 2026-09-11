# Changelog y Referencia de Integración — Integrantes 2 y 3

> **Protección de módulos:** Este doc es la fuente para que los agentes de Int.1/3/4 NO pisen el trabajo de Int.2 (y viceversa). Cada feature tiene un solo dueño (SPRINT2/3_FRONT.md § Módulos compartidos).

## 🚀 Implementaciones Realizadas (Integrante 2 — MATERIAS + INICIO) — 2026-09-11

**Estado:** COMPLETE · Validado por Tester (build vite 8 OK Node 23.10, tsc 0 errores en módulo) · `DEMO_MODE=true` operativo sin backend.

### Archivos entregados (dueño Int.2 — NO TOCAR sin coordinar)
```
src/features/catalogo/service.ts         → getMateriasDeCarrera(carreraId)  GET /materias/carrera/{id}  (dueño Int.2, ya existía, verificado)
src/features/catalogo/hooks.ts           → useMateriasDeCarrera(id)         (dueño Int.2)
src/features/catalogo/demo.ts            → demoMaterias + paginate          (dueño Int.2)
src/features/materias/service.ts         → getMisMaterias, getPromedio, create/update/deleteCursada (sin usuario_id)
src/features/materias/hooks.ts           → useMisMaterias, usePromedio, useCrear/Editar/BorrarCursada
src/features/materias/estado.ts          → estadoLabel(cursada), estadoBadgeClasses  (export para Int.3)
src/features/materias/materiaUsuarioSpec.ts → materiaUsuarioSpec({materias}) + materiaUsuarioInitial  (export para Int.3)
src/features/materias/MateriaCard.tsx    → presentacional cursada + Chip estado + notas + Editar/Borrar  (NUEVO)
src/features/materias/ByteWidget.tsx     → {aprobadas,total} → Dormido/Despierto/Entusiasta/Graduado + barra  (NUEVO)
src/features/materias/PromedioCard.tsx   → {promedio|null}  (existía, verificado)
src/features/materias/MisMateriasScreen.tsx → /materias lista paginada + chips filtro cliente + FAB FormModal  (refactor a MateriaCard/ByteWidget)
src/features/materias/InicioScreen.tsx   → / Panel con ByteWidget+PromedioCard+próximos useRecordatorios importado  (NUEVO)
src/features/materias/index.ts           → re-exports públicos (MateriaCard, ByteWidget, InicioScreen, estado, spec)
src/features/recordatorios/hooks.ts      → useRecordatorios(filtros) stub para desbloquear Inicio (dueño real Int.4, Int.2 solo creó stub si faltaba)
src/App.tsx                              → case inicio/materias ahora rutean a InicioReal/MisMateriasReal + BottomTabs
```

### Cómo consumir sin pisar (para Int.1/3/4 y sus agentes)

```ts
// ✅ Correcto — importar lo de Int.2
import { useMateriasDeCarrera } from "@/features/catalogo/hooks"; // select de carrera para spec
import { estadoLabel, useMisMaterias, usePromedio } from "@/features/materias/hooks";
import { materiaUsuarioSpec, materiaUsuarioInitial } from "@/features/materias/materiaUsuarioSpec";
import MateriaCard from "@/features/materias/MateriaCard";
import ByteWidget from "@/features/materias/ByteWidget";
import PromedioCard from "@/features/materias/PromedioCard";

// En Inicio (Int.2 ya lo hace) — Int.4 es dueño de recordatorios, Int.2 solo importa:
import { useRecordatorios } from "@/features/recordatorios/hooks"; // NO crear otro service/hooks de recordatorios
```

```ts
// 🚫 Prohibido para Int.1/3/4 (y sus agentes) — pisaría Int.2
// - No crear src/features/materias/service.ts|hooks.ts|estado.ts|MateriaCard|ByteWidget|PromedioCard
// - No crear src/features/catalogo/service.ts|hooks.ts (dueño Int.2 amplía getCarreras)
// - No duplicar materiaUsuarioSpec ni useMisMaterias/usePromedio
// - No modificar src/features/recordatorios/hooks.ts salvo Int.4 (si necesitás, coordinar PR)
// - No tocar src/features/materias/InicioScreen.tsx salvo bug crítico con review de Int.2
```

### Reglas de modificación
1. **Un dueño por módulo** (SPRINT § Módulos compartidos). Si tu tarea necesita algo de Int.2, **importalo**, no lo re-escribas. PR que toque `features/materias/*` o `features/catalogo/*` sin label `int2-review` será rechazado.
2. **FormModal/kit UX** son de Int.1 — Int.2 ya los consume, no los dupliques. Usa `spec.onError {409:'toast',422:'fields'}` existente.
3. **Recordatorios** son de Int.4 — Inicio de Int.2 solo hace `useRecordatorios({desde: hoyISO})` en lectura; si Int.4 cambia la key `['recordatorios']`, avisa para actualizar `InicioScreen`.
4. **Si necesitas fix urgente** en archivo de Int.2: abre issue, asigna a Int.2, y haz PR pequeño con `// FIX cross-int: motivo` + test/build local.

### Verificación
- Build: `npx vite build` OK (Node 23.10, 50 módulos, 74kB gzip) — ver `docs/context/testing.md §5`.
- Tsc: 0 errores en `features/materias/*` + `features/recordatorios/hooks.ts`.
- Criterios SPRINT §7.3 1-7 PASS.

---

# Changelog — Integrante 3 (original)

Este documento detalla las implementaciones realizadas para las funcionalidades de **Detalle de Materia** y **Recursos de Estudio**, y sirve como guía para la integración con el resto de los módulos del sprint.

## 🚀 Implementaciones Realizadas (Integrante 3)

Se ha estructurado la funcionalidad siguiendo el patrón de capas (`features/feature-name/service.ts`, `hooks.ts`, componentes).

### 1. Estructura de Módulos
- `src/features/materia-detalle/`: Lógica de detalle de materia y correlativas.
- `src/features/recursos/`: Lógica de gestión de recursos de estudio.

### 2. Servicios y Hooks (Placeholders)
Se han creado los archivos necesarios con promesas que retornan datos mockeados.
- **`materia-detalle/service.ts`**: `getMateria(id)`, `getCorrelativas(id)`.
- **`recursos/service.ts`**: `getRecursosDeMateria(materiaId)`, `createRecurso(body)`, `updateRecurso(id, body)`, `deleteRecurso(id)`.

### 3. Componentes UI
- **`CorrelativaItem`**: Visualización estándar para materias correlativas.
- **`RecursoCard`**: Card de recurso con lógica de *ownership* (acciones de editar/borrar solo para el dueño).
- **`recursoSpec`**: Especificación de formulario lista para usar en el `<FormModal>` compartido.
- **`MateriaDetalleScreen`**: Pantalla principal (`/materias/:id`).

---

## 🔗 Guía de Integración para el Equipo

Para finalizar la integración, los demás integrantes deben realizar las siguientes acciones en `src/features/materia-detalle/MateriaDetalleScreen.tsx`:

### 1. Integración de Recordatorios (Integrante 4)
Actualmente utilizamos `useRecordatoriosMock`. Se debe reemplazar por:
```typescript
// Reemplazar:
import { useRecordatorios } from '../recordatorios/hooks';
// Y utilizar el hook real con los parámetros correspondientes
```

### 2. Integración de Materia Usuario Spec (Integrante 2)
Actualmente utilizamos `materiaUsuarioSpecMock`. Se debe reemplazar por:
```typescript
// Reemplazar:
import { materiaUsuarioSpec } from '../materias/materiaUsuarioSpec';
// Y asignar esto al modal en el botón "Editar notas"
```

### 3. Integración de Auth Context (Integrante 1)
En `RecursoCard`, el `currentUserId` está hardcodeado a `1`. Se debe reemplazar por el ID real obtenido del contexto de autenticación:
```typescript
const { usuario } = useAuth(); // Importar de auth
// ...
<RecursoCard currentUserId={usuario?.id} ... />
```

---

*Nota: Los archivos marcados con `// TODO: INTEGRATION` en la carpeta `src/features/materia-detalle/` indican los puntos exactos de conexión futura.*
