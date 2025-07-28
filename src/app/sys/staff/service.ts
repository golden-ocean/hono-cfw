import type { DBStore } from "@/db";
import { generate_password } from "@/lib/password";
import { and, count, eq, like, ne, or } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { staff_position_table } from "../staff_position/schema";
import { StaffConstants } from "./constants";
import {
  staff_table,
  type CreateInput,
  type DeleteInput,
  type QueryInput,
  type StaffType,
  type UpdateInput,
} from "./schema";

export const find_by_username = async (client: DBStore, username: string) => {
  const prepared = client
    .select()
    .from(staff_table)
    .where(eq(staff_table.username, username))
    .prepare();
  const entity = await prepared.get();
  return entity;
};

export const find_by_id = async (client: DBStore, id: string) => {
  const prepared = client
    .select({
      id: staff_table.id,
      username: staff_table.username,
      position_id: staff_table.position_id,
      status: staff_table.status,
    })
    .from(staff_table)
    .where(eq(staff_table.id, id))
    .prepare();
  const entity = await prepared.get();
  return entity;
};

export const find_page = async (client: DBStore, params: QueryInput) => {
  const {
    current,
    pageSize,
    name,
    username,
    email,
    gender,
    mobile,
    organization_id,
    status,
    remark,
  } = params;
  const conditions = [
    name ? like(staff_table.name, `%${name}%`) : undefined,
    username ? like(staff_table.username, `%${username}%`) : undefined,
    email ? like(staff_table.email, `%${email}%`) : undefined,
    gender ? eq(staff_table.gender, gender) : undefined,
    mobile ? like(staff_table.mobile, `%${mobile}%`) : undefined,
    organization_id
      ? eq(staff_table.organization_id, organization_id)
      : undefined,
    status ? eq(staff_table.status, status) : undefined,
    remark ? like(staff_table.remark, `%${remark}%`) : undefined,
  ].filter(Boolean);
  const where = conditions.length > 0 ? or(...conditions) : undefined;
  const list_prepared = client
    .select({
      id: staff_table.id,
      username: staff_table.username,
      name: staff_table.name,
      email: staff_table.email,
      gender: staff_table.gender,
      mobile: staff_table.mobile,
      organization_id: staff_table.organization_id,
      avatar: staff_table.avatar,
      work_status: staff_table.work_status,
      sort: staff_table.sort,
      status: staff_table.status,
      remark: staff_table.remark,
    })
    .from(staff_table)
    .where(where)
    .orderBy(staff_table.sort)
    .limit(pageSize)
    .offset((current - 1) * pageSize)
    .prepare();

  const total_prepared = client
    .select({ count: count() })
    .from(staff_table)
    .where(where)
    .prepare();

  const list = await list_prepared.all();
  const total = await total_prepared.get();

  return {
    data: list,
    total: total?.count ?? 0,
  };
};

export const insert = async (client: DBStore, input: CreateInput) => {
  const { username, email, mobile } = input;
  const duplicates = await validation_fields(client, {
    username,
    email,
    mobile,
  } as StaffType);
  if (duplicates.length > 0) {
    return StaffConstants.CreatedFail;
  }
  const { hash, salt } = await generate_password(input.password ?? "123456");
  const rows = await client
    .insert(staff_table)
    .values({ ...input, password: hash, salt })
    .returning();
  if (rows.length === 0) {
    return StaffConstants.CreatedFail;
  }
  return StaffConstants.CreatedSuccess;
};

export const modify = async (client: DBStore, input: UpdateInput) => {
  const { username, email, mobile } = input;
  const duplicates = await validation_fields(client, {
    username,
    email,
    mobile,
  } as StaffType);
  if (duplicates.length > 0) return StaffConstants.UpdatedFail;

  const rows = await client
    .update(staff_table)
    .set(input)
    .where(eq(staff_table.id, input.id))
    .returning();
  if (rows.length === 0) {
    return StaffConstants.UpdatedFail;
  }
  return StaffConstants.UpdatedSuccess;
};

export const remove = async (client: DBStore, input: DeleteInput) => {
  const { id } = input;
  // 事务删除
  const changes = await client.transaction(async (tx) => {
    // 删除员工岗位关联
    await tx
      .delete(staff_position_table)
      .where(eq(staff_position_table.staff_id, id));
    // 删除员工
    const rows = await tx
      .delete(staff_table)
      .where(eq(staff_table.id, id))
      .returning();

    return rows.length > 0;
  });
  if (!changes) {
    return StaffConstants.DeletedFail;
  }
  return StaffConstants.DeletedSuccess;
};

const validation_fields = async (client: DBStore, e: StaffType) => {
  const { username, email, mobile, id } = e;
  const conditions = [
    username ? eq(staff_table.username, username) : undefined,
    email ? eq(staff_table.email, email) : undefined,
    mobile ? eq(staff_table.mobile, mobile) : undefined,
  ];
  let where = or(...conditions);
  if (id) {
    where = and(ne(staff_table.id, id), where);
  }
  const duplicates = await client
    .select({
      id: staff_table.id,
      username: staff_table.username,
      email: staff_table.email,
      mobile: staff_table.mobile,
    })
    .from(staff_table)
    .where(where)
    .limit(1);

  if (duplicates.length > 0) {
    if (duplicates[0].username == username) {
      throw new HTTPException(400, {
        message: StaffConstants.ErrorUsernameRepeat,
      });
    }
    if (duplicates[0].email == email) {
      throw new HTTPException(400, {
        message: StaffConstants.ErrorEmailRepeat,
      });
    }
    if (duplicates[0].mobile == mobile) {
      throw new HTTPException(400, {
        message: StaffConstants.ErrorMobileRepeat,
      });
    }
  }
  return duplicates;
};
