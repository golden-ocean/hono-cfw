import { env } from "cloudflare:workers";
import { jwt } from "hono/jwt";
import { AlgorithmTypes } from "hono/utils/jwt/jwa";

export const jwt_middleware = () =>
  jwt({
    secret: env.JWT_SECRET,
    alg: AlgorithmTypes.HS256,
  });
