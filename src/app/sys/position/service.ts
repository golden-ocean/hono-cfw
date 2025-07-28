import type { AppEnv } from "@/lib/create_app";
import { and, count, eq, like, ne, or, sql } from "drizzle-orm";
import { getContext } from "hono/context-storage";
import { HTTPException } from "hono/http-exception";
import { position_role_table } from "../position_role/schema";
import { staff_table } from "../staff/schema";
import { staff_position_table } from "../staff_position/schema";
import { PositionConstants } from "./constants";
import {
  position_table,
  type CreateInput,
  type DeleteInput,
  type PositionType,
  type QueryInput,
  type UpdateInput,
} from "./schema";

export const find_page = async (params: QueryInput) => {
  const client = getContext<AppEnv>().var.client;
  const { current, pageSize, name, code, status, remark } = params;
  const conditions = [
    name ? like(position_table.name, `%${name}%`) : undefined,
    code ? like(position_table.code, `%${code}%`) : undefined,
    status ? eq(position_table.status, status) : undefined,
    remark ? like(position_table.remark, `%${remark}%`) : undefined,
  ].filter(Boolean);
  const where = conditions.length > 0 ? or(...conditions) : undefined;
  const list_prepared = client
    .select({
      id: position_table.id,
      name: position_table.name,
      code: position_table.code,
      sort: position_table.sort,
      status: position_table.status,
      remark: position_table.remark,
    })
    .from(position_table)
    .where(where)
    .orderBy(position_table.sort)
    .limit(pageSize)
    .offset((current - 1) * pageSize)
    .prepare();

  const total_prepared = client
    .select({ count: count() })
    .from(position_table)
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
  } as PositionType);
  if (duplicates.length > 0) {
    return PositionConstants.CreatedFail;
  }
  const rows = await client
    .insert(position_table)
    .values({
      name: input.name,
      code: input.code,
      organization_id: input.organization_id ?? "",
      sort: input.sort,
      status: input.status,
      remark: input.remark,
      // created_by: input.created_by,
    })
    .returning();
  if (rows.length === 0) {
    return PositionConstants.CreatedFail;
  }
  return PositionConstants.CreatedSuccess;
};

export const modify = async (input: UpdateInput) => {
  const client = getContext<AppEnv>().var.client;
  const { name, code, id } = input;
  const duplicates = await validation_fields({
    name,
    code,
    id,
  } as PositionType);
  if (duplicates.length > 0) {
    return PositionConstants.UpdatedFail;
  }
  const rows = await client
    .update(position_table)
    .set(input)
    .where(eq(position_table.id, input.id))
    .returning();
  if (rows.length === 0) {
    return PositionConstants.UpdatedFail;
  }
  return PositionConstants.UpdatedSuccess;
};

export const remove = async (input: DeleteInput) => {
  const client = getContext<AppEnv>().var.client;
  const { id } = input;
  // 检查岗位是否有员工关联
  const { exists_staff } = await client.get<{ exists_staff: boolean }>(
    sql`SELECT EXISTS (
      SELECT 1 FROM ${staff_table}
      WHERE ${staff_table.position_id} = ${id}
    ) as exists_staff`
  );
  if (exists_staff) {
    throw new HTTPException(400, {
      message: PositionConstants.ErrorExistStaff,
    });
  }
  // 事务删除
  const changes = await client.transaction(async (tx) => {
    // 删除员工岗位中间表，防止冗余
    await tx
      .delete(staff_position_table)
      .where(eq(staff_position_table.position_id, id));
    // 删除岗位角色中间表，防止冗余
    await tx
      .delete(position_role_table)
      .where(eq(position_role_table.position_id, id));
    // 再删除岗位
    const rows = await tx
      .delete(position_table)
      .where(eq(position_table.id, id))
      .returning();
    return rows.length > 0;
  });
  if (!changes) {
    return PositionConstants.DeletedFail;
  }
  return PositionConstants.DeletedSuccess;
};

const validation_fields = async (e: PositionType) => {
  const client = getContext<AppEnv>().var.client;
  const { name, code, id } = e;
  const conditions = [
    name ? eq(position_table.name, name) : undefined,
    code ? eq(position_table.code, code) : undefined,
  ];
  let where = or(...conditions);
  if (id) {
    where = and(ne(position_table.id, id), where);
  }
  const duplicates = await client
    .select({
      id: position_table.id,
      name: position_table.name,
      code: position_table.code,
    })
    .from(position_table)
    .where(where)
    .limit(1);

  if (duplicates.length > 0) {
    if (duplicates[0].code == code) {
      throw new HTTPException(400, {
        message: PositionConstants.ErrorCodeRepeat,
      });
    }
    if (duplicates[0].name == name) {
      throw new HTTPException(400, {
        message: PositionConstants.ErrorNameRepeat,
      });
    }
  }
  return duplicates;
};
