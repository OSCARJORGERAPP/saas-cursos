# AGENTS.md — Especificaciones Técnicas: SaaS de Cursos

Guía de especificación para agentes de código y desarrolladores. Este documento es la fuente de verdad del diseño; ante dudas, prevalece sobre suposiciones.

## 1. Visión general

SaaS para gestionar y consumir contenidos de cursos. Dos roles: **admin** (mantiene contenidos) y **student** (consume y deja feedback). Contenidos en Markdown con soporte para videos de YouTube, PDFs e imágenes.

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15+ (App Router) con TypeScript estricto |
| Base de datos | MongoDB con driver nativo `mongodb` (sin Mongoose ni Prisma) |
| Autenticación | Magic link por email, sesiones con cookie httpOnly firmada |
| Email (dev) | MailHog (SMTP en `localhost:1025`, UI en `http://localhost:8025`) |
| Markdown | `react-markdown` + `remark-gfm`, con componente custom para embeds de YouTube |
| Estilos | Tailwind CSS; aplicar la skill `frontend-design` para landing y páginas |
| Testing | Vitest (unitario/integración) + Playwright (e2e, opcional) |

Base de datos: `saas-cursos`. Conexión vía `MONGODB_URI` (default `mongodb://localhost:27017`).

## 3. Estructura del proyecto

```
src/
  app/
    (public)/            # landing, login, verificación de magic link
    (student)/courses/   # listado y consumo de cursos
    (admin)/admin/       # CRUD de cursos/secciones/recursos, moderación de feedback
    api/                 # route handlers (auth, feedback, etc.)
  lib/
    db.ts                # singleton de conexión MongoDB
    auth.ts              # sesiones, magic links
    mailer.ts            # envío SMTP a MailHog
    ordering.ts          # lógica de numeración/orden
  components/            # UI compartida (Header con logo+QR, MarkdownRenderer, etc.)
scripts/
  seed.ts                # seed de datos
public/images/           # OmniSys.png (logo) y qr.png (QR)
```

## 4. Modelo de datos (colecciones MongoDB)

### users
```ts
{ _id, email: string (único), name: string, role: 'admin' | 'student', createdAt: Date }
```

### magic_links
```ts
{ _id, email, token: string (único, aleatorio ≥32 bytes), expiresAt: Date (15 min), usedAt: Date | null }
```
Índice TTL sobre `expiresAt`. Un token es de un solo uso.

### sessions
```ts
{ _id, userId: ObjectId, token: string, expiresAt: Date (30 días) }
```

### courses
```ts
{ _id, title, slug (único), description, order: number, published: boolean, createdAt, updatedAt }
```

### sections
```ts
{ _id, courseId: ObjectId, title, order: number, createdAt, updatedAt }
```

### resources
```ts
{ _id, sectionId: ObjectId, courseId: ObjectId, title, content: string (Markdown),
  order: number, createdAt, updatedAt }
```

### feedback
```ts
{ _id, resourceId: ObjectId, userId: ObjectId, rating: 1-5 | null, comment: string, createdAt }
```
Índice compuesto `{ resourceId, createdAt }`.

## 5. Numeración y ordenamiento (requisito clave)

- Cursos, secciones y recursos tienen un campo `order: number`.
- Se asigna con **huecos**: el primer elemento recibe `1000`, cada nuevo elemento al final recibe `máx + 1000`.
- **Intercalar**: al insertar entre A y B, `order = (A.order + B.order) / 2`. Si la diferencia es < 1, ejecutar una renumeración local de la lista (reasignar múltiplos de 1000).
- El **número visible** al usuario (1, 2, 3…; 1.1, 1.2…) se calcula en tiempo de lectura según la posición ordenada, nunca se persiste.
- Centralizar esta lógica en `src/lib/ordering.ts` con tests unitarios.

## 6. Autenticación con magic link

Flujo:
1. `POST /api/auth/magic-link` con `{ email }` → si el usuario existe (o se autoregistra como student), genera token, guarda en `magic_links` y envía email vía MailHog con enlace `/auth/verify?token=...`.
2. `GET /auth/verify?token=` → valida token (existe, no usado, no expirado), lo marca usado, crea sesión y setea cookie `session` (httpOnly, sameSite=lax, secure en prod).
3. `POST /api/auth/logout` → elimina sesión y cookie.

Autorización:
- Rutas `/admin/**` y sus APIs: solo `role === 'admin'` (verificar en servidor, no solo en middleware).
- Rutas de cursos y feedback: requieren sesión válida.
- Landing y login: públicas.

## 7. Funcionalidad por rol

### Admin (`/admin`)
- CRUD completo de cursos, secciones y recursos.
- Reordenar (mover arriba/abajo o insertar entre) usando la lógica de §5.
- Publicar/despublicar cursos.
- Ver todo el feedback por recurso.
- **Editor de Markdown mejorado** con:
  - Barra de herramientas con botones para insertar contenido (YouTube, Google Docs/Sheets/Slides, PDF, imágenes, código, citas, tablas)
  - Editor y vista previa en tabs
  - Inserción automática de sintaxis Markdown al hacer clic en botones
  - Estado de guardado con spinner

### Student (`/courses`)
- Lista de cursos publicados, numerados.
- Vista de curso: secciones y recursos en orden, con numeración jerárquica (1.1, 1.2…).
- Vista de recurso: Markdown renderizado; los enlaces de YouTube se embeben como iframe; PDFs e imágenes se enlazan/muestran.
- Dejar feedback (rating 1–5 y comentario) en cada recurso; ver feedback propio y de otros.

## 8. UI / Branding

- Header común en **todas las páginas**: logo OmniSys y código QR, dimensionados y **centrados en la parte superior**.
  - Origen de imágenes (copiar al repo en `public/images/` durante el setup):
    - Logo: `D:\OmniSys\public\images\OmniSys.png`
    - QR: `C:\Users\ojrap\Desktop\OmniSys.png` (guardar como `qr.png`)
- Landing profesional: hero, propuesta de valor, listado de cursos destacados, CTA de login. Aplicar la skill `frontend-design`.
- Diseño responsive, accesible (contraste, semántica, focus visible).
- **Interfaz de administración**:
  - Editor de recursos con barra de herramientas intuitiva
  - Botones para insertar: YouTube (▶️), Google Docs (📄), Google Sheets (📊), Google Slides (🎬), PDF (📕), Imágenes (🖼️), Código (</>) , Citas (💬), Tablas (📋)
  - Vista en tabs (Editor / Vista previa)
  - El MarkdownRenderer embebe automáticamente los diferentes tipos de contenido en la vista del estudiante

## 9. Seed de datos (`scripts/seed.ts`, comando `npm run seed`)

- Limpia y repuebla la base `saas-cursos`.
- Crea: 1 admin (`admin@example.com`), 2+ students.
- 2–3 cursos con 2–4 secciones cada uno y 2–5 recursos por sección.
- Los recursos en Markdown deben incluir **videos reales de YouTube** (URLs embebibles), enlaces a PDFs e imágenes.
- Feedback de ejemplo en varios recursos.

## 10. Testing

- **Unitario** (Vitest): `ordering.ts` (intercalado, renumeración), validaciones, generación/expiración de tokens.
- **Integración**: APIs de auth (flujo magic link completo contra MongoDB de test), CRUD de contenidos, feedback, autorización por rol.
- Usar base de datos separada `saas-cursos-test`.
- Comando: `npm test`. Los tests deben pasar antes de dar por terminada cualquier tarea.

## 11. Variables de entorno (`.env.local`)

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=saas-cursos
SMTP_HOST=localhost
SMTP_PORT=1025
APP_URL=http://localhost:3000
SESSION_SECRET=<aleatorio>
```

## 12. Documentación obligatoria

- `README.md` — descripción, features, stack, capturas.
- `QUICKSTART.md` — requisitos (Node, MongoDB, MailHog), instalación, seed, ejecución, credenciales de prueba.
- `AGENTS.md` — este documento; mantener actualizado si el diseño cambia.
- `RETROSPECTIVA.md` — **registrar cada error encontrado durante el desarrollo junto con su causa y solución**, más lecciones aprendidas. Actualizarlo a medida que ocurren, no al final.

## 13. Convenciones para agentes

- TypeScript estricto; sin `any` salvo justificación.
- Validar entrada en todos los route handlers (zod o validación manual consistente).
- Toda escritura a MongoDB pasa por funciones en `src/lib/` — no usar el driver directamente desde componentes/páginas.
- Server Components por defecto; Client Components solo donde haya interactividad.
- Commits pequeños y descriptivos. Ejecutar `npm test` y `npm run build` antes de cerrar una tarea.

## 14. GitLab y GitHub
Una vez probado y aprobado, subir el proyecto a https://gitlab.codecrypto.academy/ojrapp/saas-cursos y a https://github.com/OSCARJORGERAPP/saas-cursos . Si no están creados los proyectos en cada repositorio, crearlos.
En particular en GitLab siempre aparecen errores pipeline de build y test. Hacer atención a eso.
Si aparecen los errores resolverlos de la manera más rápida o más sencilla.