import { create_router } from "@/lib/create_app";
import { OK } from "@/lib/result";
import { sValidator } from "@hono/standard-validator";
import { env } from "cloudflare:workers";
import { Context } from "hono";
import { deleteCookie, getCookie, setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { AuthConstants } from "./constants";
import { login_schema } from "./schema";
import * as service from "./service";

export const handler = create_router()
  .get("/me", async (c) => {
    const list = await c.var.cache.list("refresh_token:");
    // await Promise.all(
    //   list.map(async (item) => {
    //     await c.var.cache.delete(item.name);
    //   })
    // );
    console.log("list:", list);
    return c.text("hello world");
  })
  .post("/login", sValidator("json", login_schema), async (c) => {
    const validated = c.req.valid("json");
    const res = await service.login(c.var.client, c.var.cache, validated);
    cookie_set_refresh_token(c, res.refresh_token);
    return c.json(OK(res));
  })
  .post("/logout", async (c) => {
    const refresh_token = getCookie(c, "refresh_token");
    if (!refresh_token) {
      throw new HTTPException(403, {
        message: AuthConstants.ErrorRefreshTokenNotExist,
      });
    }
    const res = await service.logout(c.var.cache, refresh_token);
    // 清除客户端 Cookie
    deleteCookie(c, "refresh_token");
    return c.json(OK(res));
  })
  .post("/refresh", async (c) => {
    const refresh_token = getCookie(c, "refresh_token");
    console.log("refresh_token:", refresh_token);
    if (!refresh_token) {
      throw new HTTPException(403, {
        message: AuthConstants.ErrorRefreshTokenNotExist,
      });
    }
    const res = await service.refresh(c.var.client, c.var.cache, refresh_token);
    return c.json(OK(res));
  });

const cookie_set_refresh_token = (c: Context, refresh_token: string) => {
  setSignedCookie(c, "refresh_token", env.SIGNED_COOKIE_SECRET, refresh_token, {
    httpOnly: true,
    path: "/auth",
    secure: true,
    sameSite: "strict",
    maxAge: env.JWT_REFRESH_TOKEN_EXPIRED_TIME,
  });
};
