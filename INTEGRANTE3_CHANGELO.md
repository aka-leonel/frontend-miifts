# Changelog y Referencia de Integración - Integrante 3

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
