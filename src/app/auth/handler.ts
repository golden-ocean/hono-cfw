import { create_router } from "@/lib/create_app";
import { OK } from "@/lib/result";
import { jwt_middleware } from "@/middleware/jwt_middleware";
import { sValidator } from "@hono/standard-validator";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { AuthConstants } from "./constants";
import { login_schema } from "./schema";
import * as service from "./service";

export const handler = create_router()
  .get("/me", jwt_middleware(), async (c) => {
    return c.text("hello world");
  })
  .post("/login", sValidator("json", login_schema), async (c) => {
    const validated = c.req.valid("json");
    const res = await service.login(c.var.client, c.var.cache, validated);
    setCookie(c, "refresh_token", res.refresh_token, {
      httpOnly: true,
      path: "/auth/refresh",
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });
    return c.json(OK(res));
  })
  .post("/logout", jwt_middleware(), async (c) => {
    const payload = c.get("jwtPayload");
    if (!payload) {
      throw new HTTPException(403, {
        message: AuthConstants.ErrorJwtPayloadNotExist,
      });
    }
    const refresh_token = getCookie(c, "refresh_token");
    if (!refresh_token) {
      throw new HTTPException(403, {
        message: AuthConstants.ErrorRefreshTokenNotExist,
      });
    }
    const res = await service.logout(c.var.cache, refresh_token);
    deleteCookie(c, "refresh_token");
    return c.json(OK(res));
  })
  .post("/refresh", async (c) => {
    const refresh_token = getCookie(c, "refresh_token");
    if (!refresh_token) {
      throw new HTTPException(403, {
        message: AuthConstants.ErrorRefreshTokenNotExist,
      });
    }
    const res = await service.refresh(c.var.client, c.var.cache, refresh_token);
    setCookie(c, "refresh_token", res.refresh_token, {
      httpOnly: true,
      path: "/auth/refresh",
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });
    return c.json(OK(res));
  });
