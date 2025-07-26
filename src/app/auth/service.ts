import { GlobalConstants } from "@/constant/system";
import type { DB } from "@/db";
import { generate_tokens, verify_refresh_token } from "@/lib/jwt";
import { verify_password } from "@/lib/password";
import { eq } from "drizzle-orm";
import { staff_table } from "../sys/staff/schema";
import { AuthConstants } from "./constants";
import { LoginInput } from "./schema";

export const login = async (input: LoginInput, client: DB) => {
  const { username, password } = input;
  const prepared = client
    .select()
    .from(staff_table)
    .where(eq(staff_table.username, username))
    .prepare();
  const entity = await prepared.get();
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
  const payload = {
    sub: entity.id,
    username: entity.username,
    position_id: entity.position_id ?? GlobalConstants.RootID,
  };
  const tokens = await generate_tokens(payload);
  return tokens;
};

export const refresh = async (refresh_token: string) => {
  const payload = await verify_refresh_token(refresh_token);

  const tokens = await generate_tokens(payload);
  return tokens;
};
