import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB ?? "saas-cursos";

declare global {
   
  var _mongoClient: MongoClient | undefined;
}

function getClient(): MongoClient {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
  }
  return global._mongoClient;
}

export async function getDb(): Promise<Db> {
  const client = getClient();
  await client.connect();
  return client.db(dbName);
}

export async function ensureIndexes(db: Db): Promise<void> {
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("magic_links").createIndex({ token: 1 }, { unique: true });
  await db.collection("magic_links").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("sessions").createIndex({ token: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("courses").createIndex({ slug: 1 }, { unique: true });
  await db.collection("sections").createIndex({ courseId: 1, order: 1 });
  await db.collection("resources").createIndex({ sectionId: 1, order: 1 });
  await db.collection("feedback").createIndex({ resourceId: 1, createdAt: -1 });
}
