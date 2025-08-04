import type {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "@/app/auth/schema";
import { CacheStore } from "@/cache";
import { env } from "cloudflare:workers";
import { sign, verify } from "hono/jwt";

// jwt token 生成
export const generate_access_token = async (payload: AccessTokenPayload) => {
  const access_secret = env.JWT_ACCESS_SECRET;
  const now = Math.floor(Date.now() / 1000);
  const token = await sign(
    {
      ...payload,
      iss: "hono-cfw",
      nbf: now,
      iat: now,
      exp: now + env.JWT_ACCESS_TOKEN_EXPIRED_TIME,
    },
    access_secret,
    "HS256"
  );
  return token;
};

// 验证access token
export const verify_access_token = async (token: string) => {
  const access_secret = env.JWT_ACCESS_SECRET;
  const decode_payload = await verify(token, access_secret, "HS256");
  return decode_payload;
};

// refresh token 生成
export const generate_refresh_token = async (
  cache: CacheStore,
  payload: AccessTokenPayload
) => {
  const refresh_secret = env.JWT_REFRESH_SECRET;
  const issued_at = Date.now();
  // 创建哈希
  const encoder = new TextEncoder();
  const data = encoder.encode(payload.sub + refresh_secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  const token = `${payload.sub}.${hash}.${issued_at}`;
  // 缓存refresh token
  await cache_set_refresh_token(cache, payload.sub, issued_at, {
    staff_id: payload.sub,
    access_jti: payload.jti,
  });
  // 删除旧的refresh token
  // await delete_overflow_refresh_token(cache, payload.sub);
  return token;
};

// 验证refresh token
export const verify_refresh_token = async (
  token: string
): Promise<{
  valid: boolean;
  sub: string;
  issued_at: number;
}> => {
  const parts = token.split(".");
  const [sub, hash, issued_at_string] = parts;
  console.log(parts);
  const issued_at = parseInt(issued_at_string);
  if (parts.length !== 3) return { valid: false, sub, issued_at };
  if (
    isNaN(issued_at) ||
    issued_at + env.JWT_REFRESH_TOKEN_EXPIRED_TIME * 1000 < Date.now()
  )
    return { valid: false, sub, issued_at };
  // 创建hash
  const refresh_secret = env.JWT_REFRESH_SECRET;
  const encoder = new TextEncoder();
  const data = encoder.encode(sub + refresh_secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const expected_hash = btoa(
    String.fromCharCode(...new Uint8Array(hashBuffer))
  );
  if (hash !== expected_hash) return { valid: false, sub, issued_at };
  return { valid: true, sub, issued_at };
};

export const generate_tokens = async (
  cache: CacheStore,
  payload: AccessTokenPayload
) => {
  const access_token = await generate_access_token(payload);
  const refresh_token = await generate_refresh_token(cache, payload);
  return {
    access_token,
    refresh_token,
  };
};

export const cache_set_refresh_token = async (
  cache: CacheStore,
  sub: string,
  issued_at: number,
  payload: RefreshTokenPayload
) => {
  await cache.set(
    `refresh_token:${sub}:${issued_at}`,
    JSON.stringify(payload),
    env.JWT_REFRESH_TOKEN_EXPIRED_TIME
  );
  // 删除多余的refresh token
  // await delete_overflow_refresh_token(cache, sub);
};

export const delete_overflow_refresh_token = async (
  cache: CacheStore,
  sub: string
) => {
  const exist_list = await cache.list(`refresh_token:${sub}:`);
  if (exist_list.length > env.JWT_REFRESH_TOKEN_MAX_COUNT) {
    const sorted = exist_list
      .map((key) => {
        const parts = key.name.split(":");
        const [, , issued_at_string] = parts;
        const issued_at = parseInt(issued_at_string);
        return { key: key.name, issued_at };
      })
      .sort((a, b) => a.issued_at - b.issued_at);

    await Promise.all(
      sorted
        .slice(0, sorted.length - env.JWT_REFRESH_TOKEN_MAX_COUNT)
        .map((item) => cache.delete(item.key))
    );
  }
};
