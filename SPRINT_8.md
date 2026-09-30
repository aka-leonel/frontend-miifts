# Sprint 8 — Reparto de tareas

Cuatro ideas puestas sobre la mesa para este sprint: un servicio de mail real para recuperar contraseña, nombre definitivo, logo, e investigar el código de ética profesional que le aplica a la carrera. Bastante más liviano que Sprint 7 — se puede repartir entre menos gente o sumarlo como carga extra a quienes ya vienen de otro frente.

**Escala de complejidad (puntos):** 1 = trivial · 2 = simple · 3 = media · 5 = compleja · 8 = grande.

| Persona | Foco | Puntos |
|---|---|---|
| A | Servicio de mail para recuperar contraseña | 10 |
| B | Nombre y logo | 10 |
| C | Código de ética profesional | 6 |

---

## Persona A — Servicio de mail para recuperar contraseña (10 pts)

El flujo de "olvidé mi contraseña" ya existe de punta a punta desde Sprint 5 (front completo: pantallas, validaciones, estados de error). Lo único que falta es que el mail se mande de verdad — hoy `AuthService._enviar_email_reset()` (`app/features/auth/service.py`) solo hace `logger.info(...)` con el link, no hay ningún proveedor conectado. Es 100% back.

| Tarea | Lado | Pts |
|---|---|---|
| Elegir proveedor de envío (SMTP con cuenta de Gmail/app-password para dev, o un transaccional con capa gratis tipo Resend/Brevo/SendGrid) y dar de alta la cuenta | Back | 2 |
| Variables de entorno nuevas (host/puerto/usuario/clave o API key) + sumarlas a `.env.example` | Back | 1 |
| Reemplazar el `logger.info` de `_enviar_email_reset()` por el envío real, usando el `link` que ya arma la función | Back | 3 |
| Plantilla del mail (asunto + cuerpo con el link; alcanza con texto plano, pasar a HTML si el logo de Persona B ya está listo) | Back | 2 |
| Manejar fallas de envío sin romper la respuesta genérica del endpoint ni filtrar si el mail existe (mismo criterio de seguridad ya documentado en el código) | Back | 1 |
| Probar el flujo end-to-end con un mail real: pedir el reset, recibirlo, entrar con el link y cambiar la contraseña | Back/QA | 1 |

**Orden sugerido**
1. Elegir proveedor y credenciales — todo lo demás depende de esto.
2. Variables de entorno.
3. Envío real + manejo de fallas (van juntos, es la misma función).
4. Plantilla del mail.
5. Prueba end-to-end al final, con todo integrado.

---

## Persona B — Nombre y logo (10 pts)

Hoy el proyecto se llama "miIFTS" en todos lados (título, ícono de la sidebar, prefijo de `localStorage`) pero nunca se decidió como nombre definitivo. El logo actual es un placeholder: un cuadrado con gradiente violeta genérico (`public/icons/icon-192.svg`, `icon-512.svg`, `badge-72.svg`).

| Tarea | Lado | Pts |
|---|---|---|
| Reunir propuestas de nombre y elegir uno definitivo (chequear que no choque con nada existente) | Producto | 2 |
| Si el nombre cambia: actualizarlo en `.figma/make/site.json` (`title`), `index.html`, y el logo de texto `mi`+`IFTS` en `App.tsx` (Login y Sidebar) | Front | 2 |
| Definir el concepto del logo, coherente con la paleta ya armada (violeta `--c-primary`/`--c-violet` + lime como acento) | Diseño | 3 |
| Producir el logo en los formatos que la app ya usa: favicon, íconos de PWA 192/512 y el ícono de notificaciones push (reemplaza los tres placeholders de `public/icons/`) | Diseño | 3 |

**Orden sugerido**
1. Nombre primero — el logo se diseña sabiendo qué texto/inicial va a llevar.
2. Concepto de logo.
3. Producción en los tres formatos.
4. Actualizar referencias en el código si el nombre cambió.

---

## Persona C — Código de ética profesional (6 pts)

Hoy la pantalla de Registro dice "Al registrarte aceptás los **términos y condiciones**" pero ese texto no lleva a ningún lado (`App.tsx`, `RegistroScreen`) — es un buen lugar para enganchar esto.

| Tarea | Lado | Pts |
|---|---|---|
| Confirmar qué colegio profesional le aplica a una Tecnicatura Superior en Informática en CABA — candidatos: COPITEC (Consejo Profesional de Ingeniería de Telecomunicaciones, Electrónica y Computación) o el Consejo Profesional de Ciencias Informáticas de CABA | Investigación | 2 |
| Leer el código completo y resumir los puntos relevantes para una app que maneja datos académicos de estudiantes (confidencialidad, responsabilidad profesional, honestidad en el manejo de la información) | Investigación | 2 |
| Redactar una sección corta de "Términos y ética profesional" (o similar) y enlazarla desde el texto de Registro que hoy no lleva a ningún lado | Front | 2 |

**Orden sugerido**
1. Confirmar el colegio profesional aplicable — sin esto no se puede avanzar.
2. Leer y resumir.
3. Redactar y enganchar en Registro al final.

---

## Puntos a definir

- **Proveedor de mail:** no hay decisión tomada. Con cuenta de Gmail + app-password alcanza para dev/demo; para algo más serio (y para no depender de una cuenta personal) conviene un transaccional con capa gratis. Definir antes de arrancar A.
- **Nombre definitivo:** si "miIFTS" se mantiene, la tarea de Persona B baja a solo el logo (8 pts en vez de 10) y se le puede sumar algo de A o C.
- **Quién diseña el logo:** las tareas de "concepto" y "producción" son de diseño gráfico, no de código — confirmar si hay alguien del equipo con esa habilidad o si conviene encargarlo/generarlo afuera.
- **Alcance de "código de ética":** si no hay un colegio profesional que aplique de forma directa a un título de IFTS (Tecnicatura, no un título de grado universitario), la alternativa es documentar principios generales (ACM, o el Código Ético y Deontológico de la Ingeniería Informática) en vez de uno específico argentino — a confirmar con la investigación de Persona C.

---

*reparto de tareas · sprint_8.md — mismo formato que SPRINT7-BACK.MD, a partir de las 4 ideas planteadas para el sprint*
