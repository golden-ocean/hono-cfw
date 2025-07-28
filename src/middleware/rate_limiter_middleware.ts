import type { AppEnv } from "@/lib/create_app";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";

export const rate_limiter_middleware = () =>
  cloudflareRateLimiter<AppEnv>({
    rateLimitBinding: (c) => c.env.RATE_LIMITER,
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "", // Method to generate custom identifiers for clients.
  });
