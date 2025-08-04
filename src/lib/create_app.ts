import type { CacheStore } from "@/cache";
import cache from "@/cache";
import client from "@/db";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { createFactory } from "hono/factory";
import type { JwtVariables } from "hono/jwt";
import type { RequestIdVariables } from "hono/request-id";

export interface AppEnv {
  Bindings: {
    DB: D1Database;
    KV: KVNamespace;
    HONO_RATE_LIMITER: RateLimit;
  };
  Variables: JwtVariables &
    RequestIdVariables & {
      client: DrizzleD1Database;
      cache: CacheStore;
      // rateLimit: boolean;
    };
}

// const factory_with_vars = createFactory<AppEnv>({
//   initApp: (app) => {
//     app.use(async (c, next) => {
//       c.set("client", client);
//       await next();
//     });
//   },
// });

export const create_router = () => {
  const hono_app = new Hono<AppEnv>({
    strict: true,
  });
  // const hono_app = factory_with_vars.createApp({ strict: true });
  return hono_app;
  // const open_api_app = new OpenAPIHono<AppEnv>({
  //   strict: true,
  // });

  // return open_api_app;
};

export const create_app = () => {
  const factory_app = createFactory<AppEnv>({
    initApp: (app) => {
      app.use(async (c, next) => {
        c.set("client", client(c.env.DB));
        c.set("cache", cache(c.env.KV));
        await next();
      });
    },
  });
  const app = factory_app.createApp();
  return app;
};
