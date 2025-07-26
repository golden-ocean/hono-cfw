import { ICache } from "@/cache/type";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";

export interface AppBindings {
  Bindings: {
    DB: D1Database;
    KV: KVNamespace;
  };
  Variables: {
    client: DrizzleD1Database;
    cache: ICache;
  };
}

// const factory_with_vars = createFactory<AppBindings>({
//   initApp: (app) => {
//     app.use(async (c, next) => {
//       c.set("client", client);
//       await next();
//     });
//   },
// });

export const create_router = () => {
  const hono_app = new Hono<AppBindings>({
    strict: true,
  });
  // const hono_app = factory_with_vars.createApp({ strict: true });
  return hono_app;
  // const open_api_app = new OpenAPIHono<AppBindings>({
  //   strict: true,
  // });

  // return open_api_app;
};

export const create_app = () => {
  const app = create_router();
  return app;
};
