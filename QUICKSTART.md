# QUICKSTART — SaaS Cursos

## Requisitos

- **Node.js** 20+ (probado con 22)
- **MongoDB** corriendo en `localhost:27017`
- **MailHog** (en Windows: `scoop install mailhog`)

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar entorno

El archivo `.env.local` ya viene con valores por defecto para desarrollo local:

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=saas-cursos
SMTP_HOST=localhost
SMTP_PORT=1025
APP_URL=http://localhost:3000
SESSION_SECRET=dev-secret-cambiar-en-produccion
```

## 3. Arrancar MongoDB

```bash
# Windows (si está instalado como servicio):
net start MongoDB
# o
mongod

# macOS:
brew services start mongodb-community

# Linux (systemd):
sudo systemctl start mongodb
```

Verificá que esté corriendo:
```bash
mongosh  # conecta a localhost:27017
```

## 4. Levantar MailHog

```bash
mailhog
```

- SMTP: `localhost:1025`
- Interfaz web: http://localhost:8025

## 5. Cargar datos de ejemplo

```bash
npm run seed
```

Crea 3 cursos publicados con secciones, recursos (con videos de YouTube) y feedback, además de los usuarios:

| Email | Rol |
|---|---|
|admin@example.com  | admin |
| ana@example.com | student |
| bruno@example.com | student |

> ⚠️ El seed **borra** todos los datos previos de la base `saas-cursos`.

## 6. Ejecutar la app

```bash
npm run dev      # desarrollo, http://localhost:3000
# o
npm run build && npm start   # producción local
```

## 7. Ingresar

1. Abrí http://localhost:3000/login
2. Ingresá un email (p. ej. `admin@example.com`).
3. Abrí MailHog (http://localhost:8025) y hacé clic en el enlace del email recibido.
4. El admin entra a `/admin`; los students a `/courses`.

Cualquier email nuevo se autoregistra como **student**. Para promover a admin:

```js
// mongosh
use("saas-cursos");
db.users.updateOne({ email: "tu@email.com" }, { $set: { role: "admin" } });
```

## 8. Tests

```bash
npm test
```

Corre 35 tests (unitarios + integración). Los de integración usan la base `saas-cursos-test` y requieren MongoDB activo.

## Solución de problemas

- **No llega el email**: verificá que MailHog esté corriendo (`http://localhost:8025`).
- **Error de conexión a Mongo**: verificá `mongod` y el valor de `MONGODB_URI`.
- **El enlace mágico expiró**: pedí uno nuevo; duran 15 minutos y son de un solo uso.
