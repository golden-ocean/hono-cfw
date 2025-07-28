import { create_router } from "@/lib/create_app";
import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { requestId } from "hono/request-id";
import { rate_limiter_middleware } from "./rate_limiter_middleware";
import { register_vars_middleware } from "./register_vars_middleware";

export const hono_middleware = create_router()
  .use(requestId())
  .use(cors())
  .use(csrf())
  // .use(compress()) // Cloudflare Workers compressed automatically
  // .use(etag())
  // .use(cache({ cacheName: "hono_cache" }))
  .use(logger())
  .use(prettyJSON())
  .use(contextStorage())
  .use(register_vars_middleware())
  .use(rate_limiter_middleware());
