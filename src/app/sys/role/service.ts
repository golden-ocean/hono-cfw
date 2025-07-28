import type { AppEnv } from "@/lib/create_app";
import { and, count, eq, like, ne, or, sql } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { HTTPException } from "hono/http-exception";
import { position_role_table } from "../position_role/schema";
import { role_permission_table } from "../role_permission/schema";
import { RoleConstants } from "./constants";
import {
  role_table,
  type CreateInput,
  type DeleteInput,
  type QueryInput,
  type RoleType,
  type UpdateInput,
} from "./schema";

export const find_all = async () => {
  const client = getContext<AppEnv>().var.client;
  const list = await client
    .select({
      id: role_table.id,
      name: role_table.name,
      code: role_table.code,
      type: role_table.type,
      sort: role_table.sort,
      status: role_table.status,
      remark: role_table.remark,
    })
    .from(role_table);
  return list;
};

export const find_page = async (params: QueryInput) => {
  const client = getContext<AppEnv>().var.client;
  const { current, pageSize, name, code, status, remark } = params;
  const conditions = [
    name ? like(role_table.name, `%${name}%`) : undefined,
    code ? like(role_table.code, `%${code}%`) : undefined,
    status ? eq(role_table.status, status) : undefined,
    remark ? like(role_table.remark, `%${remark}%`) : undefined,
  ].filter(Boolean);
  const where = conditions.length > 0 ? or(...conditions) : undefined;
  const list_prepared = client
    .select({
      id: role_table.id,
      name: role_table.name,
      code: role_table.code,
      type: role_table.type,
      sort: role_table.sort,
      status: role_table.status,
      remark: role_table.remark,
    })
    .from(role_table)
    .where(where)
    .orderBy(role_table.sort)
    .limit(pageSize)
    .offset((current - 1) * pageSize)
    .prepare();

  const total_prepared = client
    .select({ count: count() })
    .from(role_table)
    .where(where)
    .prepare();

  const list = await list_prepared.all();
  const total = await total_prepared.get();

  return {
    data: list,
    total: total?.count ?? 0,
  };
};

export const insert = async (input: CreateInput) => {
  const client = getContext<AppEnv>().var.client;
  const { name, code } = input;
  const duplicates = await validation_fields({
    name,
    code,
  } as RoleType);
  if (duplicates.length > 0) {
    return RoleConstants.CreatedFail;
  }
  const rows = await client
    .insert(role_table)
    .values({
      name: input.name,
      code: input.code,
      sort: input.sort,
      status: input.status,
      remark: input.remark,
      // created_by: input.created_by,
    })
    .returning();
  if (rows.length === 0) {
    return RoleConstants.CreatedFail;
  }
  return RoleConstants.CreatedSuccess;
};

export const modify = async (input: UpdateInput) => {
  const client = getContext<AppEnv>().var.client;
  const { name, code, id } = input;
  const duplicates = await validation_fields({
    name,
    code,
    id,
  } as RoleType);

  if (duplicates.length > 0) {
    return RoleConstants.UpdatedFail;
  }
  const rows = await client
    .update(role_table)
    .set(input)
    .where(eq(role_table.id, input.id))
    .returning();
  if (rows.length === 0) {
    return RoleConstants.UpdatedFail;
  }
  return RoleConstants.UpdatedSuccess;
};

export const remove = async (input: DeleteInput) => {
  const client = getContext<AppEnv>().var.client;
  const { id } = input;
  // 检查岗位和角色的关联
  const { exists_position } = await client.get<{ exists_position: boolean }>(
    sql`SELECT EXISTS (
      SELECT 1 FROM ${position_role_table}
      WHERE ${position_role_table.role_id} = ${id}
    ) as exists_position`
  );
  if (exists_position) {
    throw new HTTPException(400, {
      message: RoleConstants.ErrorExistPosition,
    });
  }
  // 检查角色和权限关系
  const { exists_permission } = await client.get<{
    exists_permission: boolean;
  }>(
    sql`SELECT EXISTS (
      SELECT 1 FROM ${role_permission_table}
      WHERE ${role_permission_table.role_id} = ${id}
    ) as exists_permission`
  );
  if (exists_permission) {
    throw new HTTPException(400, {
      message: RoleConstants.ErrorExistPermission,
    });
  }
  // 事务删除
  const changes = await client.transaction(async (tx) => {
    // 删除角色和权限关联
    await tx
      .delete(role_permission_table)
      .where(eq(role_permission_table.role_id, id));
    // 删除角色和岗位关联
    await tx
      .delete(position_role_table)
      .where(eq(position_role_table.role_id, id));
    // 删除角色
    const rows = await tx
      .delete(role_table)
      .where(eq(role_table.id, id))
      .returning();
    return rows.length > 0;
  });
  if (!changes) {
    return RoleConstants.DeletedFail;
  }
  return RoleConstants.DeletedSuccess;
};

const validation_fields = async (e: RoleType) => {
  const client = getContext<AppEnv>().var.client;
  const { name, code, id } = e;
  const conditions = [
    name ? eq(role_table.name, name) : undefined,
    code ? eq(role_table.code, code) : undefined,
  ];
  let where = or(...conditions);
  if (id) {
    where = and(ne(role_table.id, id), where);
  }
  const duplicates = await client
    .select({
      id: role_table.id,
      name: role_table.name,
      code: role_table.code,
    })
    .from(role_table)
    .where(where)
    .limit(1);

  if (duplicates.length > 0) {
    if (duplicates[0].code == code) {
      throw new HTTPException(400, {
        message: RoleConstants.ErrorCodeRepeat,
      });
    }
    if (duplicates[0].name == name) {
      throw new HTTPException(400, {
        message: RoleConstants.ErrorNameRepeat,
      });
    }
  }
  return duplicates;
};
