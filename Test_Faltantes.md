# Tests Posteriores al Sprint 7 (`Test_Faltantes.md`)

Este documento detalla los tests unitarios e integrales que **se omitieron deliberadamente** durante la suite actual para evitar retrabajo, pérdida de tiempo y fallos de compatibilidad, debido a que los módulos correspondientes están siendo modificados activamente en el **Sprint 7** (según `SPRINT7-BACK.MD`).

Una vez finalizado e integrado el Sprint 7 en dichos módulos, se deberá proceder con el desarrollo de los tests detallados a continuación.

---

## 1. Módulo de Materias y Flujo de Cursada (`src/features/materias/`, `src/features/materia-detalle/`)

**Motivo de postergación:** El Sprint 7 modifica sustancialmente el modal de agregar materia, la visibilidad de notas, el cálculo de progreso y agrega el flujo de recursar. Testear esto ahora implicaría reescribir las pruebas de inmediato.

### Tests pendientes:
- **Modal de Agregar Materia:**
  - Verificar que al agregar una materia por primera vez solo muestre el selector de MATERIA y el estado "ESTÁS CURSANDO".
- **Detalle de Materia (`MateriaDetalleScreen`):**
  - Verificar que las notas (NOTA 1, NOTA 2 y FINAL) se muestren exclusivamente al ingresar al detalle de la materia.
  - Verificar el comportamiento de la card interactiva al hacer clic en el signo de pregunta (`?`) (manejo de parcial único y cómputo al pasar a no cursando).
- **Cálculo de Progreso:**
  - Verificar que el porcentaje de avance y el widget de Byte calculen el progreso sobre el **TOTAL de materias de la carrera** y no solo sobre las materias en curso.
- **Flujo de "Recursar":**
  - Verificar que el botón "Recursar" aparezca únicamente en materias desaprobadas al editar.
  - Verificar que al hacer clic abra el modal de cursada y muestre el toast de confirmación (`¿Seguro que vas a recursar? Se borran las notas viejas y pasa a cursando`).

---

## 2. Módulo de Recordatorios y Notificaciones Push (`src/features/recordatorios/`)

**Motivo de postergación:** Incorpora Service Workers, permisos de notificaciones push del navegador (`pushManager.subscribe()`) e infraestructura backend/frontend completamente nueva.

### Tests pendientes:
- **Suscripción Push:**
  - Verificar la solicitud de permisos al usuario mediante un gesto y la correcta llamada a la suscripción con `pushManager.subscribe()`.
- **Indicador de Pendientes:**
  - Verificar que el círculo indicador aparezca en el icono de recordatorios cuando existan recordatorios pendientes.
- **Gestión de Recordatorios:**
  - Verificar la correcta renderización de tarjetas de recordatorios y su vinculación con materias específicas.

---

## 3. Módulo de Administración y Catálogo (`src/features/catalogo-admin/`, `src/features/convenios/`)

**Motivo de postergación:** El panel admin se ampliará para incluir el ABM de correlatividades y convenios, modificando la estructura de `AdminCatalogoScreen`.

### Tests pendientes:
- **Panel de Administración (`AdminCatalogoScreen`):**
  - Verificar la protección de ruta por rol (`admin`).
  - Verificar la correcta administración de carreras, materias por carrera, correlatividades (alta y baja) y convenios.
- **Correcciones Visuales:**
  - Verificar que el ícono de calendario en `RecordatorioCard` sea visible y accesible correctamente.

---

## Recomendación de Ejecución

Se recomienda abordar la implementación de estos tests en un **Sprint de QA/Refactoring posterior al cierre del Sprint 7**, una vez que los contratos de API y componentes UI queden estabilizados.
