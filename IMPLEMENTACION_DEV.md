# Guía de Integración en la Rama `dev` (`IMPLEMENTACION_DEV.md`)

Este documento detalla el procedimiento para integrar la rama **`feature/test`** en la rama **`dev`** del proyecto frontend (`frontend-miifts`), identificando los posibles fallos de compatibilidad y cómo resolverlos de manera efectiva.

---

## 1. Pasos para Integrar `feature/test` en `dev`

1. **Actualizar la rama `dev`:**
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Traer y fusionar la rama de tests:**
   ```bash
   git merge feature/test --no-ff -m "Merge branch 'feature/test' into dev: Test suite integration"
   ```

3. **Reinstalar dependencias para asegurar sincronización:**
   ```bash
   npm install
   ```

4. **Ejecutar la validación de pruebas:**
   ```bash
   npm run test:run
   ```

---

## 2. Posibles Fallos de Compatibilidad y su Resolución

Durante la integración en `dev`, pueden surgir los siguientes escenarios de incompatibilidad y sus respectivas soluciones:

### Fallo 1: Conflictos de Peer Dependencies con React 19 en `npm install`
- **Causa:** `@testing-library/react` o `vitest` pueden reportar advertencias o bloqueos si la versión de React (`^19.0.0`) exige resoluciones estrictas de `react-dom`.
- **Solución:** 
  - Asegurarse de utilizar versiones compatibles instaladas en este PR (`@testing-library/react@^16.3.3`, `vitest@^5.0.2`).
  - Si el gestor de paquetes bloquea la instalación por peer dependencies, ejecutar:
    ```bash
    npm install --legacy-peer-deps
    ```

### Fallo 2: Conflictos de Merge en `package.json`
- **Causa:** Si en la rama `dev` se agregaron o actualizaron dependencias concurrentemente, al fusionar con `feature/test` se producirá un conflicto en `package.json`.
- **Solución:**
  - Al resolver el conflicto en el editor, **mantener ambas secciones**: las dependencias de producción existentes en `dev` y las nuevas `devDependencies` añadidas para testing (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@testing-library/user-event`).

### Fallo 3: Errores de Tipado en TypeScript (`tsconfig.json`)
- **Causa:** El entorno de Vitest (`globals: true`) o `@testing-library/jest-dom` pueden requerir definiciones de tipos globales que TypeScript no detecte si `tsconfig` no incluye los tipos o el archivo `setup.ts`.
- **Solución:**
  - Verificar que `vitest.config.ts` apunte correctamente a `src/test/setup.ts`.
  - Si TypeScript arroja errores en los tests sobre matchers del DOM (`toBeInTheDocument`), asegurarse de que `src/test/setup.ts` importe `import '@testing-library/jest-dom'`.

### Fallo 4: Colisiones con Módulos Modificados por el Sprint 7 en `dev`
- **Causa:** La rama `dev` puede contener avances del **Sprint 7** (módulos de materias, detalle, recordatorios push o panel admin) descritos en `SPRINT7-BACK.MD`.
- **Solución:**
  - Los tests implementados en esta rama (`feature/test`) **fueron diseñados exclusivamente sobre módulos estables** (`apiClient`, `storage`, componentes UI compartidos, `useToast`, `useApiForm`, `ConveniosScreen`, `PerfilScreen`) y no tocan ningún archivo de los módulos sujetos al Sprint 7.
  - Por lo tanto, no deberían existir fallos funcionales ni de compilación cruzada. Si se desean implementar pruebas para los nuevos flujos del Sprint 7, consultar las directrices en **`Test_Faltantes.md`**.
