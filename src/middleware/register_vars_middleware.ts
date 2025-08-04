import cache from "@/cache";
import client from "@/db";
import type { AppEnv } from "@/lib/create_app";
import { createMiddleware } from "hono/factory";

export const register_vars_middleware = () =>
  createMiddleware<AppEnv>(async (c, next) => {
    const { path, method } = c.req;
    console.log(path, method);
    c.set("client", client(c.env.DB));
    c.set("cache", cache(c.env.KV));
    await next();
  });
