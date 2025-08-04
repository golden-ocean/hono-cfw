import { env } from "cloudflare:workers";
import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import { AlgorithmTypes } from "hono/utils/jwt/jwa";

export const jwt_middleware = () =>
  createMiddleware(async (c, next) => {
    const { path, method } = c.req;
    const is_whitelist = jwt_whitelist.some((item) => {
      return item.path === path && item.method.includes(method);
    });
    if (is_whitelist) {
      return next();
    }
    const jwt_middleware = jwt({
      secret: env.JWT_ACCESS_SECRET,
      alg: AlgorithmTypes.HS256,
    });
    return jwt_middleware(c, next);
  });

// todo 设置jwt中间件
// 通过path和method来判断是否需要jwt验证
const jwt_whitelist = [
  {
    path: "/auth/login",
    method: ["POST"],
  },
  {
    path: "/auth/refresh",
    method: ["POST"],
  },
  {
    path: "/auth/logout",
    method: ["POST"],
  },
];
