// import { AppEnv } from "@/lib/create_app";
// import { DurableObjectStore } from "@hono-rate-limiter/cloudflare";
// import { rateLimiter } from "hono-rate-limiter";
// import { createMiddleware } from "hono/factory";

// export const rate_limiter_middleware = () =>
//   createMiddleware<AppEnv>(async (c, next) => {
//     rateLimiter<AppEnv>({
//       windowMs: 15 * 60 * 1000, // 15 minutes
//       limit: 2, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
//       standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
//       keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "", // Method to generate custom identifiers for clients.
//       store: new DurableObjectStore({ namespace: c.env.RATE_LIMITER_CACHE }), // Here CACHE is your Durable Object Binding.
//     })(c, next);
//     await next();
//   });
