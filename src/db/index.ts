import { env } from "cloudflare:workers";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

const client = drizzle(env.DB, { logger: true });

export type DB = DrizzleD1Database;

export default client;
