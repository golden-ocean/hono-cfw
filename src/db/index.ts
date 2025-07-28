import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

const client = (db: D1Database) => drizzle(db, { logger: true });

export type DBStore = DrizzleD1Database;

export default client;
