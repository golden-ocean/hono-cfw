import { GlobalConstants } from "@/constant/system";
import type { DBStore } from "@/db";
import { and, eq, like, ne, or, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { role_permission_table } from "../role_permission/schema";
import { PermissionConstants } from "./constants";
import {
  permission_table,
  type CreateInput,
  type DeleteInput,
  type PermissionType,
  type QueryInput,
  type UpdateInput,
} from "./schema";

export const find_tree = async (client: DBStore, params: QueryInput) => {
  const list = await find_all(client, params);
  return build_tree(list);
};

export const find_all = async (client: DBStore, params: QueryInput) => {
  const { name, method, type, status, remark } = params;
  const conditions = [
    name ? like(permission_table.name, `%${name}%`) : undefined,
    method ? eq(permission_table.method, method) : undefined,
    type ? eq(permission_table.type, type) : undefined,
    status ? eq(permission_table.status, status) : undefined,
    remark ? like(permission_table.remark, `%${remark}%`) : undefined,
  ].filter(Boolean);
  const where = conditions.length > 0 ? or(...conditions) : undefined;
  const list_prepared = client
    .select({
      id: permission_table.id,
      parent_id: permission_table.parent_id,
      name: permission_table.name,
      icon: permission_table.icon,
      path: permission_table.path,
      code: permission_table.code,
      component: permission_table.component,
      type: permission_table.type,
      method: permission_table.method,
      visible: permission_table.visible,
      sort: permission_table.sort,
      status: permission_table.status,
      remark: permission_table.remark,
    })
    .from(permission_table)
    .where(where)
    .orderBy(permission_table.sort)
    .prepare();
  const list = await list_prepared.all();
  return list;
};

export const insert = async (client: DBStore, input: CreateInput) => {
  const { name } = input;
  const duplicates = await validation_fields(client, {
    name,
  } as PermissionType);
  if (duplicates.length > 0) {
    return PermissionConstants.CreatedFail;
  }
  const rows = await client
    .insert(permission_table)
    .values({
      parent_id: input.parent_id,
      name: input.name,
      icon: input.icon,
      path: input.path,
      code: input.code,
      component: input.component,
      type: input.type,
      method: input.method,
      visible: input.visible,
      sort: input.sort,
      status: input.status,
      remark: input.remark,
      // created_by: input.created_by,
    })
    .returning();
  if (rows.length === 0) {
    return PermissionConstants.CreatedFail;
  }
  return PermissionConstants.CreatedSuccess;
};

export const modify = async (client: DBStore, input: UpdateInput) => {
  // 不能修改为自己的子节点
  if (input.parent_id == input.id) {
    throw new HTTPException(400, {
      message: PermissionConstants.ErrorPidCantEqSelfAndChildId,
    });
  }
  const { name, id } = input;
  const duplicates = await validation_fields(client, {
    name,
    id,
  } as PermissionType);
  if (duplicates.length > 0) return PermissionConstants.UpdatedFail;
  const rows = await client
    .update(permission_table)
    .set(input)
    .where(eq(permission_table.id, input.id))
    .returning();
  if (rows.length === 0) {
    return PermissionConstants.UpdatedFail;
  }
  return PermissionConstants.UpdatedSuccess;
};

export const remove = async (client: DBStore, input: DeleteInput) => {
  const { id } = input;
  // 检查是否是系统权限
  // 检查是否有子权限
  const { exists_children } = await client.get<{ exists_children: boolean }>(
    sql`SELECT EXISTS (
      SELECT 1 FROM ${permission_table}
      WHERE ${permission_table.parent_id} = ${id}
    ) as exists_children`
  );
  if (exists_children) {
    throw new HTTPException(400, {
      message: PermissionConstants.ErrorExistChildren,
    });
  }
  // 检查是否有角色关联
  const { exists_role } = await client.get<{ exists_role: boolean }>(
    sql`SELECT EXISTS (
      SELECT 1 FROM ${role_permission_table}
      WHERE ${role_permission_table.permission_id} = ${id}
    ) as exists_role`
  );
  if (exists_role) {
    throw new HTTPException(400, {
      message: PermissionConstants.ErrorExistRole,
    });
  }
  // 事务删除
  const changes = await client.transaction(async (tx) => {
    // 先删除中间表,防止冗余
    await tx
      .delete(role_permission_table)
      .where(eq(role_permission_table.permission_id, id));
    // 删除权限
    const rows = await tx
      .delete(permission_table)
      .where(eq(permission_table.id, id))
      .returning();
    return rows.length > 0;
  });
  if (!changes) {
    return PermissionConstants.DeletedFail;
  }
  return PermissionConstants.DeletedSuccess;
};

const validation_fields = async (client: DBStore, e: PermissionType) => {
  const { name, id } = e;
  const conditions = [name ? eq(permission_table.name, name) : undefined];
  let where = or(...conditions);
  if (id) {
    where = and(ne(permission_table.id, id), where);
  }
  const duplicates = await client
    .select({
      id: permission_table.id,
      name: permission_table.name,
    })
    .from(permission_table)
    .where(where)
    .limit(1);

  if (duplicates.length > 0) {
    if (duplicates[0].name == name) {
      throw new HTTPException(400, {
        message: PermissionConstants.ErrorNameRepeat,
      });
    }
  }
  return duplicates;
};

const build_tree = (flatList: PermissionType[]): PermissionType[] => {
  const nodeMap = new Map<string, PermissionType>();
  const roots: PermissionType[] = [];
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
