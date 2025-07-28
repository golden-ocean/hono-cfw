import type { AppEnv } from "@/lib/create_app";
import { generate_id } from "@/lib/id";
import { verify_password } from "@/lib/password";
import { getContext } from "hono/context-storage";
import { HTTPException } from "hono/http-exception";
import * as staff_service from "../sys/staff/service";
import { AuthConstants } from "./constants";
import {
  generate_access_token,
  generate_tokens,
  verify_refresh_token,
} from "./lib/jwt";
import { AccessTokenPayload, LoginInput, RefreshTokenPayload } from "./schema";

export const login = async (input: LoginInput) => {
  const cache = getContext<AppEnv>().var.cache;
  const { username, password } = input;
  const entity = await staff_service.find_by_username(username);
  if (!entity) {
    throw new Error(AuthConstants.ErrorUsernameNotExist);
  }
  const is_match = await verify_password(
    password,
    entity.salt,
    entity.password
  );
  if (!is_match) {
    throw new Error(AuthConstants.ErrorPasswordNotMatch);
  }
  // 获取用户的权限
  // 返回token
  const access_jti = generate_id();
  const payload = {
    sub: entity.id,
    username: entity.username,
    position_id: entity.position_id,
    jti: access_jti,
  } as AccessTokenPayload;
  const { access_token, refresh_token } = await generate_tokens(cache, payload);
  return {
    access_token,
    refresh_token,
  };
};

export const refresh = async (refresh_token: string) => {
  const cache = getContext<AppEnv>().var.cache;
  // 验证refresh token
  const { valid, sub, issued_at } = await verify_refresh_token(refresh_token);
  if (!valid) {
    throw new HTTPException(403, {
      message: AuthConstants.ErrorRefreshTokenNotExist,
    });
  }
  // 从缓存中获取payload
  const cached = await cache.get(`refresh_token:${sub}:${issued_at}`);
  if (!cached) {
    throw new HTTPException(403, {
      message: AuthConstants.ErrorRefreshTokenExpire,
    });
  }
  const payload: RefreshTokenPayload = JSON.parse(cached);
  // todo 可以比对ip，浏览器，设备等
  // 查询用户 防止用户状态职位等信息更改后依然可以使用
  const entity = await staff_service.find_by_id(payload.staff_id);
  if (!entity) {
    throw new HTTPException(403, {
      message: AuthConstants.ErrorUserNotExist,
    });
  }
  // 生成新的token
  const access_jti = generate_id();
  const access_payload = {
    sub: entity.id,
    username: entity.username,
    position_id: entity.position_id,
    jti: access_jti,
  } as AccessTokenPayload;

  const new_access_token = await generate_access_token(access_payload);
  return {
    access_token: new_access_token,
    refresh_token,
  };
};

export const logout = async (refresh_token: string) => {
  const cache = getContext<AppEnv>().var.cache;
  const [sub, _hash, issued_at_string] = refresh_token.split(".");
  await cache.delete(`refresh_token:${sub}:${issued_at_string}`);
  return AuthConstants.LogoutSuccess;
};
