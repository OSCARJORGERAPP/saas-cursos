# PROMPT — SaaS de Gestión de Contenidos de Cursos

## Objetivo

Construir un SaaS para mantener y consumir contenidos de cursos, con Next.js y MongoDB nativo.

## Roles

- **Admin**: crea, edita, elimina y reordena cursos, secciones y recursos. Modera feedback.
- **Student**: navega los cursos publicados, consume los recursos y deja feedback en cada recurso.

## Modelo de contenido

- Un **curso** contiene varias **secciones**; cada sección contiene varios **recursos**.
- Los recursos son archivos **Markdown** que pueden referenciar videos (YouTube), PDFs, imágenes y enlaces externos.
- Cursos, secciones y recursos están **numerados** para definir la secuencia de estudio. La numeración debe permitir **intercalar** nuevos elementos sin renumerar los existentes (usar claves de orden fraccionales o con huecos, p. ej. 10, 20, 30).

## Autenticación

- Login por **magic link** enviado por email (sin contraseñas).
- En desarrollo, los emails se capturan con **MailHog**.
- El rol (admin/student) se asigna en la base de datos.

## Persistencia

- **MongoDB nativo** (driver oficial, sin ORM/ODM). Base de datos: `saas-cursos`.

## Feedback

- Cada student puede dejar feedback (comentario y/o calificación) en cada recurso; el feedback queda asociado al recurso y al usuario.

## Datos de ejemplo (seed)

- Script de seed con cursos, secciones y recursos realistas, incluyendo videos de YouTube embebidos en el Markdown, usuarios admin y students de prueba.

## UI / Branding

- Usar **frontend-design** para lograr páginas profesionales y una **landing page** atractiva.
- Logo principal: copiar `D:\OmniSys\public\images\OmniSys.png` al proyecto (`public/images/`).
- Código QR: copiar `C:\Users\ojrap\Desktop\OmniSys.png` al proyecto.
- Ambas imágenes deben ir dimensionadas y ubicadas en la **parte superior central de cada página**.

## Calidad

- Incluir **testing** automatizado (unitario y de integración como mínimo).
- Documentar los **errores encontrados durante el desarrollo y sus soluciones** (en RETROSPECTIVA.md).

## Documentación entregable

- `AGENTS.md` — especificaciones técnicas y guía para agentes de código.
- `QUICKSTART.md` — puesta en marcha rápida.
- `README.md` — descripción general del proyecto.
- `RETROSPECTIVA.md` — errores, soluciones y lecciones aprendidas.

## Stack

- **Next.js** (App Router, TypeScript).
- **MongoDB** nativo.
- **MailHog** para emails en desarrollo.
