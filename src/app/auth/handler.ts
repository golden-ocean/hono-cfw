import { create_router } from "@/lib/create_app";
import { OK } from "@/lib/result";
import { jwt_middleware } from "@/middleware/jwt_middleware";
import { sValidator } from "@hono/standard-validator";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { AuthConstants } from "./constants";
import { login_schema } from "./schema";
import * as service from "./service";

export const handler = create_router()
  .get("/me", jwt_middleware(), async (c) => {
    return c.text("hello world");
  })
  .get("/me123", async (c) => {
    await c.var.cache.set("123", "123232323");
    return c.text("hello world 123123");
  })
  .post("/login", sValidator("json", login_schema), async (c) => {
    const validated = c.req.valid("json");
    const res = await service.login(validated, c.var.client);
    setCookie(c, "refresh_token", res.refresh_token, {
      httpOnly: true,
      path: "/auth/refresh",
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });
    return c.json(OK(res));
  })
  .post("/refresh", async (c) => {
    const refresh_token = getCookie(c, "refresh_token");
    if (!refresh_token) {
      throw new HTTPException(401, {
        message: AuthConstants.ErrorRefreshTokenNotExist,
      });
    }
    const res = await service.refresh(refresh_token);
    setCookie(c, "refresh_token", res.refresh_token, {
      httpOnly: true,
      path: "/auth/refresh",
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });
    return c.json(OK(res));
  });
// .post("/logout", async (c) => {
//   const refresh_token = getCookie(c, "refresh_token");
//   if (!refresh_token) {
//     throw new HTTPException(401, {
//       message: AuthConstants.ErrorRefreshTokenNotExist,
//     });
//   }
//   const res = await service.logout(refresh_token);
//   return c.json(OK(res));
// });
