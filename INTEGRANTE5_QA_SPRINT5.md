# QA Sprint 5 — Integrante 5 (S5-16, S5-17, S5-18, S5-19)

Rama: `Sprint5_Gus(int5)` (parte de `dev` @ `2767aab`). Backend real en
`http://localhost:8000` (Docker). Fecha: 2026-09-16.

---

## S5-16 · Regresión de los fixes de esta semana

Objetivo: confirmar contra el backend real que ninguno de los 4 bugs
cerrados en `68a43a5` / `3127f3a` / `17d6799` / `bf45064` / `dd2f7d5`
reapareció, y que el flujo de registro + alta de cursada funciona de
punta a punta.

**Verificación en dos capas** (no hay browser disponible en este entorno,
así que se combina lectura de código + requests reales contra la API):

### Código — el fix sigue en pie (no lo pisó ningún merge)

| Fix | Dónde se confirmó | Resultado |
|---|---|---|
| `apellido` en `Usuario`/`RegistroRequest` | `src/api/types.ts` | ✅ presente |
| `.env` apunta al backend, no a sí mismo | `VITE_API_URL=http://localhost:8000` | ✅ correcto |
| Loop de `React.StrictMode` en `CarreraScreen` | `grep loadedRef` → 0 resultados (solo queda mencionado en un comentario explicativo) | ✅ sigue sacado |
| Selector de materia bloqueado (`lockOnEdit`) | `EntityForm.tsx`/`FormModal.tsx` con `isEditing` | ✅ presente |
| Toast de contraseña débil inalcanzable | `puedeContinuar` en `App.tsx` ya no exige `!passwordDebil` | ✅ presente |

### API — flujo real de punta a punta

| Caso | Request | Resultado |
|---|---|---|
| Registro completo (nombre + apellido + password válida) | `POST /auth/registro` | **201** — usuario creado con `apellido` |
| Login con esa cuenta | `POST /auth/login` | **200** — token + usuario |
| Alta de cursada (lo que dispara el selector de materia arreglado) | `POST /materias/usuario` con el token | **201** — cursada creada, `estado: "cursando"` |
| Registro sin `apellido` (repro del bug viejo) | `POST /auth/registro` | **422** `apellido: Field required` — el backend lo sigue exigiendo, como se documentó |
| Registro con password sin número (repro del bug viejo) | `POST /auth/registro` | **422** `La contraseña debe incluir al menos una letra y un número` — regla intacta |

Build y typecheck también quedaron verdes salvo el único pendiente ya
documentado (`SidebarNav` sin conectar, S5-09):

```
npx tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 6.0
  → src/App.tsx(87,10): 'SidebarNav' is declared but its value is never read.
npm run build → ✓ built
```

**Conclusión S5-16: ✅ cerrado.** Ninguno de los 4 bugs reapareció; el
flujo de registro + alta de cursada funciona end-to-end contra el
backend real.

---

## S5-17 · Convenios/TalentoTech sin datos

```
GET /convenios/  → {"items":[],"total":0,"page":1,"per_page":20,"total_pages":0}
GET /talentotech/ → {"items":[],"total":0,"page":1,"per_page":20,"total_pages":0}
```

Sigue exactamente igual que la vez anterior que se probó: **200 OK, sin
datos**. El código del front (`convenios/service.ts`) pega bien a los
endpoints públicos — no hay nada para arreglar de este lado.

**Conclusión S5-17: reclasificado, no es bug de front.** Queda pendiente
que alguien confirme con el equipo de backend si van a sembrar
Convenios/TalentoTech antes de producción, o si el estado vacío es el
esperado — **no lo puedo resolver desde acá**, es una decisión/acción del
lado del backend. Anotado para que se hable en el próximo planning.

---

## S5-18 · QA de Perfil editable + Olvidé mi contraseña

**No ejecutable todavía.** Ninguna de las dos features existe en esta
rama:

```
grep -rn "PATCH /auth/me\|forgot\|reset-password" src/  →  0 implementaciones
                                                            (solo el comentario
                                                             de gap en PerfilScreen.tsx)
```

- Perfil editable (S5-05, Integrante 2): no arrancó.
- Olvidé mi contraseña (S5-12→15, Integrante 4): no arrancó.

**Conclusión S5-18: bloqueado por dependencia**, tal como marca la tabla
del sprint (`← S5-05, S5-14`). Re-tomar en cuanto esas ramas mergeen a
`dev` — dejo escrito acá mismo el plan de casos a correr cuando estén:

- Perfil: guardar nombre/apellido/email válido → se refleja sin
  recargar (S5-07); email duplicado → 409 por toast; campo vacío → 422
  mapeado con `useApiForm`; carrera sigue de solo lectura; **no debe
  existir ningún campo/botón de contraseña** (S5-08).
- Olvidé mi contraseña: email inexistente no debe revelar si existe o
  no; contraseña nueva con la misma regla que Registro (≥8, letra +
  número, confirmación); token vencido/inválido con mensaje claro, no
  un error genérico.

---

## S5-19 · Checklist final del sprint (estado real hoy)

| Ítem de la Definición de terminado | Estado | Nota |
|---|---|---|
| Logout (manual o 401) siempre termina en `login` | ❌ pendiente | S5-01/02, sin arrancar |
| `getMiUsuario()`/`DEMO_USUARIO` fuera de las pantallas | ❌ pendiente | Sigue en `App.tsx`, `MateriaDetalleScreen`, `InicioScreen`, `MisMateriasScreen` — S5-03 |
| Cero `demo.ts` en `src/` | ❌ pendiente | Siguen los 4 de siempre (`catalogo`, `materias`, `recordatorios`, `recursos`) — S5-04 |
| `SidebarNav` funcional desde `md:` | ❌ pendiente | Componente existe, sigue sin `<SidebarNav` en ningún render — S5-09 |
| 5 pantallas responsive en 375/768/1440 | ❌ pendiente | Recordatorios sigue sin contenedor ni grid — S5-10 |
| Perfil edita nombre/apellido/email, sin contraseña | ❌ pendiente | S5-05, sin arrancar |
| Olvidé mi contraseña completo o documentado bloqueado | 🟡 documentado | Ver S5-18 arriba: depende de que backend confirme el contrato (S5-12) |
| `tsc --noEmit` sin errores | 🟡 1 error esperado | El de `SidebarNav`, cae solo al resolver S5-09 |
| `docker compose up` levanta todo | ✅ | Verificado, `db` healthy y `api` responde `200` en `/health` |
| Regresión de los fixes de esta semana (S5-16) | ✅ | Ver arriba |

**Para Sprint 6 (si algo de esto no llega a cerrar en Sprint 5):**
Nada todavía — es demasiado pronto en el sprint para descartar tickets;
esta tabla es el punto de partida para que cada integrante la actualice
a medida que mergea. Re-correr esta misma checklist al final del sprint
antes de cerrarlo.

---

*QA Integrante 5 · Sprint 5 — evidencia para S5-16/S5-17/S5-18/S5-19.*
