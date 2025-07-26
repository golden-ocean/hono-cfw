import { env } from "cloudflare:workers";
import { sign, verify } from "hono/jwt";
import { JWTPayload } from "hono/utils/jwt/types";
import { generate_id } from "./id";

// jwt token 生成
export const generate_access_token = async (payload: JWTPayload) => {
  const access_secret = env.JWT_SECRET;
  const now = Math.floor(Date.now() / 1000);
  const token = await sign(
    {
      ...payload,
      iss: "hono-cfw",
      iat: now,
      exp: now + 60 * 1,
    },
    access_secret,
    "HS256"
  );
  return token;
};

// 验证access token
export const verify_access_token = async (token: string) => {
  const access_secret = env.JWT_SECRET;
  const decode_payload = await verify(token, access_secret, "HS256");
  return decode_payload;
};

export const generate_refresh_token = async (payload: Record<string, any>) => {
  const refresh_secret = env.JWT_REFRESH_SECRET;
  const token = await sign(payload, refresh_secret, "HS256");
  return token;
};

// 验证refresh token
export const verify_refresh_token = async (token: string) => {
  const refresh_secret = env.JWT_REFRESH_SECRET;
  const decode_payload = await verify(token, refresh_secret, "HS256");
  return decode_payload;
};

// // refresh token 生成
// // 使用随机字符串
// export const generate_refresh_token = async (
//   payload: Record<string, any>,
//   secret: string
// ) => {
//   const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3; // 3天
//   // 创建哈希
//   const encoder = new TextEncoder();
//   const data = encoder.encode(payload + secret);
//   const hashBuffer = await crypto.subtle.digest("SHA-256", data);
//   const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
//   const token = `${hash}.${exp}`;
//   return token;
// };

// 验证refresh token
// export const verify_refresh_token = async (token: string) => {
//   const refresh_secret = env.JWT_REFRESH_SECRET;
//   const parts = token.split(".");
//   if (parts.length !== 2) return false;

//   const [_, exp] = parts;
//   const expire_time = new Date(parseInt(exp) * 1000);
//   if (expire_time < new Date()) return false;
//   const verify_token = await generate_refresh_token(payload, refresh_secret);
//   return verify_token === token;
// };

export const generate_tokens = async (payload: JWTPayload) => {
  const access_token = await generate_access_token(payload);
  const refresh_token = await generate_refresh_token({
    sub: payload.sub,
    jti: generate_id(),
    iat: payload.iat,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  });
  return {
    access_token,
    refresh_token,
  };
};
