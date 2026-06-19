# RETROSPECTIVA — Errores, soluciones y lecciones aprendidas

Registro de los problemas encontrados durante el desarrollo y cómo se resolvieron.

## 1. `create-next-app` rechaza directorios con archivos existentes

**Error**: al scaffoldear en el directorio del proyecto, `create-next-app` abortó porque ya existían `PROMPT.md` y `AGENTS.md` ("contains files that could conflict").

**Solución**: mover temporalmente los `.md` fuera del directorio, ejecutar el scaffold y restaurarlos. Ojo: `create-next-app` genera su propio `AGENTS.md` stub, así que hubo que restaurar el nuestro con sobrescritura (`Move-Item -Force`).

**Lección**: scaffoldear primero y documentar después, o usar un directorio limpio.

## 2. Cookie de sesión con `Secure` sobre HTTP en producción local

**Error**: el flujo de magic link funcionaba (token válido, redirect 307 a `/admin` con `Set-Cookie`), pero la sesión "se perdía" y el usuario volvía a `/login`. La causa: la cookie se marcaba `Secure` porque `npm start` corre con `NODE_ENV=production`, y los clientes HTTP la descartan sobre `http://localhost`.

**Solución**: basar el flag `secure` en el esquema de `APP_URL` (`appUrl.startsWith("https://")`) en lugar de `NODE_ENV`. Así una build de producción probada localmente sobre HTTP funciona, y en un despliegue real con HTTPS la cookie sigue siendo segura.

**Lección**: `NODE_ENV === "production"` no implica HTTPS; el flag `Secure` debe derivarse de la URL pública real.

## 3. Token corrupto al extraerlo del email (quoted-printable)

**Error**: al automatizar el test E2E, el token extraído del cuerpo del email de MailHog venía corrupto (`3Ddd254...` y cortado). El cuerpo HTML está codificado en quoted-printable: `=` se codifica como `=3D` y las líneas largas se cortan con `=\r\n`.

**Solución**: decodificar quoted-printable antes de extraer el token (eliminar los soft line breaks `=\r\n` y reemplazar `=3D` por `=`).

**Lección**: los cuerpos MIME de MailHog no son texto plano; cualquier parsing automatizado debe decodificar la codificación de transferencia.

## 4. Falso negativo verificando la numeración jerárquica en HTML

**Error**: el chequeo E2E de la numeración `1.1.1` fallaba aunque la página la mostraba bien. React intercala nodos comentario (`<!-- -->`) entre expresiones JSX adyacentes, así que el HTML contiene `1.<!-- -->1.<!-- -->1`.

**Solución**: quitar los comentarios HTML antes de aplicar la regex de verificación.

**Lección**: nunca asumir que el HTML server-rendered de React es texto contiguo; verificar contra el DOM o normalizar primero.

## 5. Conflicto de permisos al sobrescribir archivos generados

**Error**: el `page.tsx` y `README.md` generados por `create-next-app` no podían sobrescribirse directamente con el flujo de trabajo del agente (requieren lectura previa).

**Solución**: eliminar los archivos generados y crear los nuevos desde cero.

**Lección**: menor fricción si se identifican de antemano los archivos del scaffold que se van a reemplazar por completo.

## 6. Lint con errores menores tras la primera pasada

**Error**: `npm run lint` falló por un `let` que nunca se reasignaba en un test (`prefer-const`) y una directiva `eslint-disable` innecesaria en `db.ts`.

**Solución**: `npx eslint --fix .` los corrigió automáticamente.

**Lección**: correr lint temprano y a menudo; la mayoría de estos errores se autocorrigen.

## 7. Mejora de la interfaz de edición de recursos (ResourceEditor)

**Mejora implementada**: interfaz mejorada para insertar contenido multimedia en recursos (videos YouTube, Google Docs/Sheets/Slides, PDFs, imágenes, código, tablas).

**Componentes creados**:
- `ResourceEditor.tsx`: Client Component con:
  - Barra de herramientas con 9 botones para insertar contenido
  - Editor Markdown y vista previa en tabs
  - Inserción automática de sintaxis Markdown al hacer clic
- `markdown-helpers.ts`: funciones para generar sintaxis Markdown correcta
- Extensión de `MarkdownRenderer.tsx`: soporte para embeber automáticamente Google Docs/Sheets/Slides, PDFs, etc.

**Lección**: separar la lógica de generación de sintaxis Markdown en funciones reutilizables hace el código más mantenible y testeable. La inserción automática en el cursor mejora significativamente la UX.

## Decisiones de diseño que funcionaron bien

- **Orden con huecos (múltiplos de 1000) + punto medio** para intercalar: simple, sin renumeraciones masivas, y la numeración visible (1, 1.1, 1.1.1) se calcula al renderizar.
- **Server Actions para el CRUD de admin** en lugar de APIs REST: menos código, validación con zod en el servidor igual de estricta.
- **Tests de integración contra MongoDB real** (base `saas-cursos-test`): detectan problemas reales del driver (tipos, índices, cascadas) que un mock ocultaría.
- **`getDb()` como singleton global**: evita agotar conexiones con el hot-reload de Next.js.
- **ResourceEditor con botones para insertar contenido**: interfaz intuitiva que reduce fricción al crear recursos con multimedia.
