import type { AppEnv } from "@/lib/create_app";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";

// 可以设置多个速率限制，通过jwt获取，登录与否设置不同的速率限制
// 再根据是否付费，设置不同的速率限制
export const rate_limiter_middleware = () =>
  cloudflareRateLimiter<AppEnv>({
    rateLimitBinding: (c) => c.env.HONO_RATE_LIMITER,
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "", // Method to generate custom identifiers for clients.
  });
