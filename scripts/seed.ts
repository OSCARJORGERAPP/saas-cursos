/**
 * Seed de datos para saas-cursos.
 * Uso: npm run seed
 * ¡Atención! Limpia las colecciones antes de poblar.
 */
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB ?? "saas-cursos";
const STEP = 1000;

interface SeedResource {
  title: string;
  content: string;
}
interface SeedSection {
  title: string;
  resources: SeedResource[];
}
interface SeedCourse {
  title: string;
  slug: string;
  description: string;
  published: boolean;
  sections: SeedSection[];
}

const courses: SeedCourse[] = [
  {
    title: "Introducción a JavaScript",
    slug: "introduccion-a-javascript",
    description:
      "Desde cero hasta dominar los fundamentos del lenguaje más usado de la web.",
    published: true,
    sections: [
      {
        title: "Primeros pasos",
        resources: [
          {
            title: "¿Qué es JavaScript?",
            content: `# ¿Qué es JavaScript?

JavaScript es el lenguaje de programación de la web. Corre en todos los navegadores y, gracias a Node.js, también en el servidor.

## Video introductorio

[JavaScript en 100 segundos](https://www.youtube.com/watch?v=DHjqpvDnNGE)

## Lectura recomendada

- [MDN: Qué es JavaScript](https://developer.mozilla.org/es/docs/Learn/JavaScript/First_steps/What_is_JavaScript)
- [PDF: Guía de estilo de JavaScript](https://google.github.io/styleguide/jsguide.html)

> **Tip:** practicá cada concepto en la consola del navegador (F12).`,
          },
          {
            title: "Variables y tipos de datos",
            content: `# Variables y tipos de datos

\`\`\`js
let nombre = "Ada";
const PI = 3.14159;
let activo = true;
\`\`\`

| Tipo | Ejemplo |
|------|---------|
| string | \`"hola"\` |
| number | \`42\` |
| boolean | \`true\` |
| object | \`{ a: 1 }\` |

## Video

[Variables en JavaScript](https://www.youtube.com/watch?v=W6NZfCO5SIk)`,
          },
          {
            title: "Funciones",
            content: `# Funciones

Las funciones son bloques reutilizables de código.

\`\`\`js
function saludar(nombre) {
  return \`Hola, \${nombre}!\`;
}

const sumar = (a, b) => a + b;
\`\`\`

## Video

[Funciones y arrow functions](https://www.youtube.com/watch?v=h33Srr5J9nY)`,
          },
        ],
      },
      {
        title: "El DOM y eventos",
        resources: [
          {
            title: "Manipulación del DOM",
            content: `# Manipulación del DOM

El DOM (Document Object Model) representa la página como un árbol de nodos.

\`\`\`js
const titulo = document.querySelector("h1");
titulo.textContent = "Nuevo título";
\`\`\`

## Video

[DOM Crash Course](https://www.youtube.com/watch?v=0ik6X4DJKCc)`,
          },
          {
            title: "Eventos",
            content: `# Eventos

\`\`\`js
boton.addEventListener("click", () => {
  console.log("¡Click!");
});
\`\`\`

## Video

[JavaScript Events](https://www.youtube.com/watch?v=XF1_MlZ5l6M)

![Diagrama de eventos](https://developer.mozilla.org/es/docs/Learn/JavaScript/Building_blocks/Events/show-video-form.png)`,
          },
        ],
      },
      {
        title: "Asincronía",
        resources: [
          {
            title: "Promesas y async/await",
            content: `# Promesas y async/await

\`\`\`js
async function obtenerDatos() {
  const res = await fetch("/api/datos");
  return res.json();
}
\`\`\`

## Video

[Async JS - Promises & Async Await](https://www.youtube.com/watch?v=PoRJizFvM7s)`,
          },
        ],
      },
    ],
  },
  {
    title: "Next.js y React desde cero",
    slug: "nextjs-y-react-desde-cero",
    description:
      "Construí aplicaciones web modernas con React, Server Components y el App Router de Next.js.",
    published: true,
    sections: [
      {
        title: "Fundamentos de React",
        resources: [
          {
            title: "Componentes y props",
            content: `# Componentes y props

\`\`\`tsx
function Saludo({ nombre }: { nombre: string }) {
  return <h1>Hola, {nombre}</h1>;
}
\`\`\`

## Video

[React en 100 segundos](https://www.youtube.com/watch?v=Tn6-PIqc4UM)`,
          },
          {
            title: "Estado con useState",
            content: `# Estado con useState

\`\`\`tsx
const [contador, setContador] = useState(0);
\`\`\`

## Video

[React Hooks explicados](https://www.youtube.com/watch?v=TNhaISOUy6Q)`,
          },
        ],
      },
      {
        title: "Next.js App Router",
        resources: [
          {
            title: "Rutas y layouts",
            content: `# Rutas y layouts

En el App Router, cada carpeta dentro de \`app/\` es una ruta. \`layout.tsx\` envuelve a sus hijos.

## Video

[Next.js en 100 segundos](https://www.youtube.com/watch?v=Sklc_fQBmcs)

## Documentación

- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)`,
          },
          {
            title: "Server Components y data fetching",
            content: `# Server Components

Por defecto, los componentes del App Router se renderizan en el servidor y pueden ser \`async\`.

\`\`\`tsx
export default async function Page() {
  const datos = await obtenerDatos();
  return <Lista datos={datos} />;
}
\`\`\`

## Video

[Server Components explicados](https://www.youtube.com/watch?v=TQQPAU21ZUw)`,
          },
        ],
      },
    ],
  },
  {
    title: "MongoDB para desarrolladores",
    slug: "mongodb-para-desarrolladores",
    description:
      "Modelado de datos, consultas, índices y agregaciones con el driver nativo de MongoDB.",
    published: true,
    sections: [
      {
        title: "Conceptos básicos",
        resources: [
          {
            title: "Documentos y colecciones",
            content: `# Documentos y colecciones

MongoDB almacena documentos BSON dentro de colecciones, sin esquema fijo.

\`\`\`js
await db.collection("usuarios").insertOne({ nombre: "Ada", edad: 36 });
\`\`\`

## Video

[MongoDB en 100 segundos](https://www.youtube.com/watch?v=-bt_y4Loofg)`,
          },
          {
            title: "Consultas y operadores",
            content: `# Consultas y operadores

\`\`\`js
await db.collection("usuarios").find({ edad: { $gte: 18 } }).toArray();
\`\`\`

| Operador | Significado |
|----------|-------------|
| \`$gte\` | mayor o igual |
| \`$in\` | dentro de un conjunto |
| \`$regex\` | expresión regular |

## Video

[MongoDB Crash Course](https://www.youtube.com/watch?v=ofme2o29ngU)`,
          },
        ],
      },
      {
        title: "Índices y rendimiento",
        resources: [
          {
            title: "Creación de índices",
            content: `# Creación de índices

\`\`\`js
await db.collection("usuarios").createIndex({ email: 1 }, { unique: true });
\`\`\`

Los índices aceleran las lecturas a costa de algo de escritura y espacio.

## Lectura

- [Documentación oficial de índices](https://www.mongodb.com/docs/manual/indexes/)`,
          },
        ],
      },
    ],
  },
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  console.log(`Limpiando base "${dbName}"…`);
  for (const c of ["users", "magic_links", "sessions", "courses", "sections", "resources", "feedback"]) {
    await db.collection(c).deleteMany({});
  }

  // Índices
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("magic_links").createIndex({ token: 1 }, { unique: true });
  await db.collection("magic_links").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("sessions").createIndex({ token: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("courses").createIndex({ slug: 1 }, { unique: true });
  await db.collection("sections").createIndex({ courseId: 1, order: 1 });
  await db.collection("resources").createIndex({ sectionId: 1, order: 1 });
  await db.collection("feedback").createIndex({ resourceId: 1, createdAt: -1 });

  // Usuarios
  const now = new Date();
  const admin = { _id: new ObjectId(), email: "admin@example.com", name: "Admin", role: "admin", createdAt: now };
  const student1 = { _id: new ObjectId(), email: "ana@example.com", name: "Ana", role: "student", createdAt: now };
  const student2 = { _id: new ObjectId(), email: "bruno@example.com", name: "Bruno", role: "student", createdAt: now };
  await db.collection("users").insertMany([admin, student1, student2]);
  console.log("Usuarios: admin@example.com, ana@example.com, bruno@example.com");

  // Contenidos
  const allResourceIds: ObjectId[] = [];
  let courseOrder = 0;
  for (const c of courses) {
    courseOrder += STEP;
    const courseId = new ObjectId();
    await db.collection("courses").insertOne({
      _id: courseId,
      title: c.title,
      slug: c.slug,
      description: c.description,
      order: courseOrder,
      published: c.published,
      createdAt: now,
      updatedAt: now,
    });
    let sectionOrder = 0;
    for (const s of c.sections) {
      sectionOrder += STEP;
      const sectionId = new ObjectId();
      await db.collection("sections").insertOne({
        _id: sectionId,
        courseId,
        title: s.title,
        order: sectionOrder,
        createdAt: now,
        updatedAt: now,
      });
      let resourceOrder = 0;
      for (const r of s.resources) {
        resourceOrder += STEP;
        const resourceId = new ObjectId();
        allResourceIds.push(resourceId);
        await db.collection("resources").insertOne({
          _id: resourceId,
          sectionId,
          courseId,
          title: r.title,
          content: r.content,
          order: resourceOrder,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    console.log(`Curso creado: ${c.title}`);
  }

  // Feedback de ejemplo
  const comments = [
    { userId: student1._id, rating: 5, comment: "¡Excelente explicación, muy clara!" },
    { userId: student2._id, rating: 4, comment: "Muy bueno, aunque me gustaría más ejemplos prácticos." },
    { userId: student1._id, rating: null, comment: "El video complementa muy bien el texto." },
  ];
  for (let i = 0; i < Math.min(6, allResourceIds.length); i++) {
    const c = comments[i % comments.length];
    await db.collection("feedback").insertOne({
      _id: new ObjectId(),
      resourceId: allResourceIds[i],
      userId: c.userId,
      rating: c.rating,
      comment: c.comment,
      createdAt: new Date(now.getTime() - i * 3600_000),
    });
  }
  console.log("Feedback de ejemplo creado.");

  await client.close();
  console.log("Seed completado ✔");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
