# SaaS Cursos — OmniSys

Plataforma SaaS para gestionar y consumir contenidos de cursos. Los administradores mantienen cursos, secciones y recursos en Markdown (con videos de YouTube, PDFs e imágenes); los estudiantes siguen la secuencia numerada de estudio y dejan feedback en cada recurso.

## Features

- **Dos roles**: `admin` (CRUD completo y moderación) y `student` (consumo y feedback).
- **Jerarquía de contenidos**: curso → secciones → recursos, con numeración secuencial visible (1, 1.1, 1.1.1) que permite intercalar elementos sin renumerar.
- **Recursos en Markdown** con embebido automático de videos de YouTube (los enlaces de YouTube se convierten en iframes), tablas, código y más.
- **Autenticación por magic link** (sin contraseñas), con emails capturados por MailHog en desarrollo.
- **Feedback por recurso**: rating 1–5 y comentario, asociado al usuario.
- **Landing profesional** con branding OmniSys (logo + QR en el header de todas las páginas).
- **Seed de datos** con 3 cursos reales y videos de YouTube.
- **Testing** unitario y de integración con Vitest (35 tests).

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript, Server Components y Server Actions)
- [MongoDB](https://www.mongodb.com/) con driver nativo (sin ORM) — base `saas-cursos`
- [Tailwind CSS 4](https://tailwindcss.com/)
- [MailHog](https://github.com/mailhog/MailHog) para emails en desarrollo
- [Vitest](https://vitest.dev/) para tests

## Puesta en marcha

Ver [QUICKSTART.md](QUICKSTART.md). Resumen:

```bash
npm install
npm run seed   # datos de ejemplo
npm run dev    # http://localhost:3000
```

Requiere MongoDB en `localhost:27017` y MailHog corriendo (`mailhog`).

## Usuarios de prueba (seed)

| Email | Rol |
|---|---|
| admin@example.com | admin |
| ana@example.com | student |
| bruno@example.com | student |

El login se hace pidiendo un magic link en `/login` y abriéndolo desde MailHog (http://localhost:8025).

## Estructura

```
src/app          # rutas (landing, login, courses, admin, api)
src/lib          # db, auth, mailer, ordering, content (acceso a datos)
src/components   # Header, MarkdownRenderer, FeedbackForm
scripts/seed.ts  # seed de datos
tests/           # unitarios + integración
```

## Documentación

- [AGENTS.md](AGENTS.md) — especificaciones técnicas.
- [QUICKSTART.md](QUICKSTART.md) — guía de instalación y ejecución.
- [RETROSPECTIVA.md](RETROSPECTIVA.md) — errores encontrados durante el desarrollo y sus soluciones.
