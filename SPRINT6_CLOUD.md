# Sprint 6 · Cloud & Infraestructura miIFTS

**Endurecer el despliegue en AWS, cerrar la deuda técnica encontrada al operarlo, y dejarlo documentado y reproducible.**

Los sprints anteriores (S4/S5) se enfocaron en frontend. En paralelo, y por fuera de un sprint formal, se armó y se empezó a operar el despliegue en **AWS Academy Learner Lab** (EC2 + RDS desacoplado + S3), con cuatro scripts (`etapa_1` a `etapa_4`). Al ponerlo en uso real aparecieron varios bugs y vacíos operativos que no estaban contemplados — este es el primer sprint que los toma formalmente como backlog, en vez de resolverlos "al pasar" en la terminal.

## Objetivos

- **🧯 Cerrar la deuda encontrada al operar el despliegue** — bugs ya identificados (y algunos ya resueltos de forma ad-hoc) que hay que dejar prolijos en el repo, con su causa documentada para que no se repitan.
- **⏸️ Formalizar el ciclo pausar/reanudar** — hoy la única forma de "no gastar créditos" es destruir todo con `etapa_4` (irreversible, borra la base). Falta un camino intermedio versionado en el repo.
- **🔒 Primeras mejoras de seguridad** — el despliegue actual prioriza costo y simplicidad por sobre seguridad (HTTP plano, password hardcodeada, RDS en subred pública). Este sprint no lo lleva a nivel productivo, pero cierra las mejoras de bajo costo/alto impacto.
- **📄 Documentar la arquitectura** — el README explica *cómo* correr los scripts, pero no *por qué* se eligió esta arquitectura ni sus trade-offs, ni un runbook de troubleshooting de los bugs ya encontrados.

**Meta:** 11 tickets · S6-01 → S6-11 · 1 integrante (rol Cloud/DevOps) · Base: rama `db_rds` de `mi_ifts_deployment`

---

## Auditoría: qué se encontró al operar el despliegue (previo a este sprint)

Bugs y vacíos detectados en uso real de `etapa_1` a `etapa_4`, antes de que existiera un sprint formal de cloud. `✅` ya resuelto de forma ad-hoc (falta consolidar en el repo/documentar), `🟡` mitigado parcialmente, `❌` no arrancado.

| Hallazgo | Estado | Detalle |
|---|---|---|
| `etapa_4`: pipe roto en la detección de RDS/Subnet Group | ✅ | `\vert{}` en vez de `\|` en el `if` de las secciones 1 y 2 — el `if` nunca se cumplía y esos recursos quedaban sin borrar. Corregido usando el código de salida del `describe-*` en vez de `grep`. |
| `etapa_1`: `RDS Endpoint: None` | ✅ | Typo de casing en el `--query` (`DbInstances` en vez de `DBInstances`, JMESPath es case-sensitive) — el endpoint nunca se capturaba y el backend terminaba apuntando a un host inexistente (`@None:5432`). Corregido, y se agregó una validación que corta la etapa si `DB_HOST` sale vacío o `"None"`. |
| `etapa_2`: no valida que el backend haya conectado realmente a la base | 🟡 | El chequeo actual solo confirma que `curl` a `/` devuelve algún código HTTP, no que `seed.py` haya corrido contra RDS con éxito. Con el bug del `DB_HOST` de arriba, el script igual reportaba "ETAPA 2 COMPLETADA" (S6-03). |
| Sin forma de "pausar" el entorno sin destruir la base | ✅ | Se armaron `etapa_5_pausar.sh` / `etapa_6_reanudar.sh` (detienen EC2 y RDS sin borrar nada) — faltan sumarlos formalmente al repo y al README (S6-05). |
| Falso positivo de "IGW huérfano" | ✅ | El Internet Gateway de la VPC *default* de la región aparecía en `check_orphans.sh` sin aclarar que no es de miIFTS. Se agregó detección automática (compara contra `IsDefault` de la VPC) — falta incorporar el script al repo (S6-06). |
| Sin forma de detectar recursos huérfanos con otro nombre | ✅ | Se armó `check_orphans.sh`, que no depende del tag `miifts` — falta sumarlo al repo (S6-06). |
| IP pública de la EC2 sin Elastic IP | ❌ | Cada `stop`/`start` (manual o del futuro `etapa_6_reanudar`) le asigna una IP nueva a la instancia, lo que rompe `VITE_API_URL` del frontend ya compilado (S6-04). |
| Password de RDS hardcodeada en texto plano (`postgrespassword`) | ❌ | Vive en el script y en el `.env` remoto sin ningún gestor de secretos. |
| Backend en HTTP plano + `CORS_ORIGINS=*` | ❌ | Aceptable para un lab, documentado como deuda pero nunca escrito explícitamente en el repo. |
| RDS en subredes públicas (aunque solo alcanzable por el SG del backend) | ❌ | Se eligió así para no pagar un NAT Gateway — es un trade-off consciente, pero no está documentado como tal. |
| Coordinación entre etapas vía archivo de shell (`~/miifts-ids.sh`) | ❌ | Sin ningún tipo de validación de esquema — es justamente el punto por el que pasaron desapercibidos los dos bugs de arriba. No se resuelve este sprint (implicaría migrar a Terraform/IaC), pero queda anotado como riesgo conocido. |

---

## Tareas del sprint

### Área A — Corrección y robustez de los scripts existentes (≈2d)

| ID | Prioridad | Días | Ticket | Dependencia |
|---|---|---|---|---|
| S6-01 | Alta | 0.5d | **Commitear los fixes de `etapa_1` y `etapa_4`** — el fix del `--query 'DBInstances...'` (con validación de `DB_HOST` vacío/`None`) y el fix del pipe roto en `etapa_4` (secciones RDS y DB Subnet Group), hoy solo aplicados de forma manual en CloudShell. | — |
| S6-02 | Media | 0.5d | **Lint básico de los scripts en cada cambio** — correr `bash -n` sobre los cuatro (seis, con pausar/reanudar) scripts antes de cada commit/PR, para no volver a mergear un typo de sintaxis silencioso como el de `\vert{}`. | ← S6-01 |
| S6-03 | Alta | 1d | **`etapa_2` debe verificar la conexión real a RDS, no solo que la API responda** — hoy el `curl` a `/` puede dar `200` aunque el backend nunca haya logrado hablar con la base (fue justo lo que ocultó el bug de `DB_HOST=None`). Agregar un chequeo explícito post-`seed.py` (ej. exit code del `docker exec`, o un endpoint de healthcheck que sí toque la DB) que corte la etapa con error claro si falla. | — |

### Área B — Ciclo pausar/reanudar y control de costos (≈2.5d)

| ID | Prioridad | Días | Ticket | Dependencia |
|---|---|---|---|---|
| S6-04 | Alta | 0.5d | **Asociar una Elastic IP a la EC2 en `etapa_1`** — evita que `PUBLIC_IP` cambie en cada `stop`/`start`, que es justo lo que rompe `VITE_API_URL` al usar `etapa_6_reanudar`. Actualizar `etapa_4_cleanup.sh` para liberarla al destruir todo (una EIP sin asociar también cobra). | — |
| S6-05 | Alta | 1d | **Sumar `etapa_5_pausar.sh` / `etapa_6_reanudar.sh` al repo** — documentarlos en el README junto a las etapas 1-4, aclarando la limitación de RDS (se reactiva sola a los 7 días de estar detenida) y, una vez resuelto S6-04, confirmar que ya no hace falta re-correr `etapa_3` tras reanudar. | ← S6-04 |
| S6-06 | Media | 0.5d | **Sumar `check_orphans.sh` al repo** — como script de verificación a correr después de `etapa_4`, con la detección de VPC/IGW default ya incorporada para no generar falsos positivos. | — |
| S6-07 | Baja | 0.5d | **Checklist de "fin de sesión de laboratorio"** en el README: correr `check_orphans.sh` y decidir entre `etapa_4` (destruye todo, incluida la base) o `etapa_5_pausar` (conserva datos, sigue generando costo de storage). | ← S6-05, S6-06 |

### Área C — Seguridad de bajo costo/alto impacto (≈2d)

| ID | Prioridad | Días | Ticket | Dependencia |
|---|---|---|---|---|
| S6-08 | Media | 1d | **Sacar la contraseña de RDS del script** — pasarla por variable de entorno o prompt interactivo en `etapa_1` en vez de tenerla hardcodeada (`postgrespassword`) tanto en el script local como en el `.env` que se genera en la EC2. AWS Secrets Manager queda fuera de alcance (requiere permisos de IAM que el Learner Lab no da), pero sacarla del código fuente sí es viable. | — |
| S6-09 | Baja | 1d | **Acotar `CORS_ORIGINS` al dominio real del frontend** en vez de `*`, una vez que la URL de S3 (o de un futuro CloudFront) sea estable. | — |

### Área D — Documentación de arquitectura (≈1.5d)

| ID | Prioridad | Días | Ticket | Dependencia |
|---|---|---|---|---|
| S6-10 | Media | 1d | **Sección de arquitectura en el README** — diagrama actualizado (EC2 + RDS desacoplado + S3), y por qué se eligió sobre alternativas (ECS/Fargate, serverless, Elastic Beanstalk, ASG+ALB), con sus ventajas/desventajas explícitas: sin HA, sin auto scaling, RDS en subred pública por costo, sin TLS. | — |
| S6-11 | Baja | 0.5d | **Runbook de troubleshooting** — sección nueva en el README con los síntomas y causas de los bugs ya encontrados (`RDS Endpoint: None` → casing de `DBInstances`; recursos no borrados por `etapa_4` → pipe roto; `UnauthorizedOperation` en `CreateVpc` → lab detenido/expirado), para que el próximo que lo pise no tenga que rediagnosticarlo desde cero. | ← S6-01 |

---

## Definición de terminado del sprint

- [ ] Los fixes de `etapa_1` (endpoint RDS) y `etapa_4` (pipe roto) están commiteados en `db_rds`, no solo aplicados a mano en CloudShell.
- [ ] `etapa_2` corta con error claro si el backend no logra conectar realmente a RDS (no solo si no responde HTTP).
- [ ] La EC2 tiene Elastic IP asociada; `etapa_4` la libera al destruir todo.
- [ ] `etapa_5_pausar.sh` y `etapa_6_reanudar.sh` están en el repo y documentados en el README.
- [ ] `check_orphans.sh` está en el repo y no genera falsos positivos con recursos default de la región.
- [ ] La contraseña de RDS no está hardcodeada en el script ni versionada en texto plano.
- [ ] El README tiene una sección de arquitectura (con alternativas consideradas) y un runbook de troubleshooting.
- [ ] `check_orphans.sh` corrido al cierre del sprint no muestra nada fuera de lo esperado.

---

*reparto de tareas · sprint6_cloud.md — generado a partir de SPRINT5_FRONT.md + auditoría del despliegue AWS en `db_rds`*
