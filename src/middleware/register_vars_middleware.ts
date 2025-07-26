import cache from "@/cache";
import client from "@/db";
import type { AppBindings } from "@/lib/create_app";
import { createMiddleware } from "hono/factory";

export const register_vars_middleware = () =>
  createMiddleware<AppBindings>(async (c, next) => {
    c.set("client", client);
    c.set("cache", cache);
    await next();
  });
