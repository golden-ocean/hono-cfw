import { GlobalConstants } from "@/constant/system";
import type { DB } from "@/db";
import { and, eq, like, ne, or, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { position_table } from "../position/schema";
import { staff_table } from "../staff/schema";
import { OrganizationConstants } from "./constants";
import {
  organization_table,
  type CreateInput,
  type DeleteInput,
  type OrganizationType,
  type QueryInput,
  type UpdateInput,
} from "./schema";

export const find_tree = async (client: DB, params: QueryInput) => {
  const flatList = await find_all(client, params);
  return build_tree(flatList);
};

export const find_all = async (client: DB, params: QueryInput) => {
  const { name, code, status, remark } = params;
  const conditions = [
    name ? like(organization_table.name, `%${name}%`) : undefined,
    code ? like(organization_table.code, `%${code}%`) : undefined,
    status ? eq(organization_table.status, status) : undefined,
    remark ? like(organization_table.remark, `%${remark}%`) : undefined,
  ].filter(Boolean);
  const where = conditions.length > 0 ? or(...conditions) : undefined;
  const list_prepared = client
    .select({
      id: organization_table.id,
      parent_id: organization_table.parent_id,
      name: organization_table.name,
      code: organization_table.code,
      sort: organization_table.sort,
      status: organization_table.status,
      remark: organization_table.remark,
      contact: organization_table.contact,
      email: organization_table.email,
      phone: organization_table.phone,
    })
    .from(organization_table)
    .where(where)
    .orderBy(organization_table.sort)
    .prepare();

  const list = await list_prepared.all();
  return list;
};

export const insert = async (client: DB, input: CreateInput) => {
  const { name, code } = input;
  const duplicates = await validation_fields(client, {
    name,
    code,
  } as OrganizationType);
  if (duplicates.length > 0) {
    return OrganizationConstants.CreatedFail;
  }
  const rows = await client
    .insert(organization_table)
    .values({
      parent_id: input.parent_id,
      name: input.name,
      code: input.code,
      sort: input.sort,
      status: input.status,
      remark: input.remark,
      contact: input.contact,
      email: input.email,
      phone: input.phone,
      // created_by: input.created_by,
    })
    .returning();
  if (rows.length === 0) {
    return OrganizationConstants.CreatedFail;
  }
  return OrganizationConstants.CreatedSuccess;
};

export const modify = async (client: DB, input: UpdateInput) => {
  const { name, code, id } = input;
  const duplicates = await validation_fields(client, {
    name,
    code,
    id,
  } as OrganizationType);
  if (duplicates.length > 0) {
    return OrganizationConstants.UpdatedFail;
  }
  const rows = await client
    .update(organization_table)
    .set(input)
    .where(eq(organization_table.id, input.id))
    .returning();
  if (rows.length === 0) {
    return OrganizationConstants.UpdatedFail;
  }
  return OrganizationConstants.UpdatedSuccess;
};

export const remove = async (client: DB, input: DeleteInput) => {
  const { id } = input;
  // 检查是否有子组织
  const { exists_children } = await client.get<{ exists_children: boolean }>(
    sql`SELECT EXISTS (
      SELECT 1 FROM ${organization_table}
      WHERE ${organization_table.parent_id} = ${id}
    ) as exists_children`
  );
  if (exists_children) {
    throw new HTTPException(400, {
      message: OrganizationConstants.ErrorExistChildren,
    });
  }
  // 检查是否有关联员工
  const { exists_staff } = await client.get<{ exists_staff: boolean }>(
    sql`SELECT EXISTS (
      SELECT 1 FROM ${staff_table}
      WHERE ${staff_table.organization_id} = ${id}
    ) as exists_staff`
  );
  if (exists_staff) {
    throw new HTTPException(400, {
      message: OrganizationConstants.ErrorExistStaff,
    });
  }
  // 检查是否有关联岗位
  const { exists_position } = await client.get<{ exists_position: boolean }>(
    sql`SELECT EXISTS (
      SELECT 1 FROM ${position_table}
      WHERE ${position_table.organization_id} = ${id}
    ) as exists_position`
  );
  if (exists_position) {
    throw new HTTPException(400, {
      message: OrganizationConstants.ErrorExistPosition,
    });
  }

  const rows = await client
    .delete(organization_table)
    .where(eq(organization_table.id, id))
    .returning();

  if (rows.length === 0) {
    return OrganizationConstants.DeletedFail;
  }
  return OrganizationConstants.DeletedSuccess;
};

const validation_fields = async (client: DB, e: OrganizationType) => {
  const { name, code, id } = e;
  const conditions = [
    name ? eq(organization_table.name, name) : undefined,
    code ? eq(organization_table.code, code) : undefined,
  ].filter(Boolean);

  let where = or(...conditions);
  if (id) {
    where = and(ne(organization_table.id, id), where);
  }
  const duplicates = await client
    .select({
      id: organization_table.id,
      name: organization_table.name,
      code: organization_table.code,
    })
    .from(organization_table)
    .where(where)
    .limit(1);

  if (duplicates.length > 0) {
    if (duplicates[0].name == name) {
      throw new HTTPException(400, {
        message: OrganizationConstants.ErrorNameRepeat,
      });
    }
    if (duplicates[0].code == code) {
      throw new HTTPException(400, {
        message: OrganizationConstants.ErrorCodeRepeat,
      });
    }
  }
  return duplicates;
};

const build_tree = (flatList: OrganizationType[]): OrganizationType[] => {
  const nodeMap = new Map<string, OrganizationType>();
  const roots: OrganizationType[] = [];
  // 1. 先在 Map 里创建所有节点副本，并初始化 children
  for (const node of flatList) {
    // 避免修改原始 node，复制一份，确保 parent_id 有默认值，初始化 children
    nodeMap.set(node.id, {
      ...node,
      parent_id: node.parent_id ?? GlobalConstants.RootID,
      children: [],
    });
  }
  // 2. 构造树结构
  for (const node of nodeMap.values()) {
    const parent = nodeMap.get(node.parent_id);
    if (parent && node.id !== node.parent_id) {
      parent.children!.push(node);
    } else {
      // 找不到父节点 or 自引用错误 → 当作根节点
      roots.push(node);
    }
  }
  return roots;
};
