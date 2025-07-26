import { create_router } from "@/lib/create_app";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { register_vars_middleware } from "./register_vars_middleware";

export const hono_middleware = create_router()
  .use(cors())
  .use(csrf())
  .use(requestId())
  // .use(compress()) // Cloudflare Workers compressed automatically
  // .use(etag())
  // .use(cache({ cacheName: "hono_cache" }))
  .use(logger())
  .use(prettyJSON())
  .use(register_vars_middleware());
