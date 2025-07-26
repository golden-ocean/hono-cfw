import type { DB } from "@/db";
import { count, eq, like, or } from "drizzle-orm";
import { OperationLogConstants } from "./constants";
import {
  operation_log_table,
  type CreateInput,
  type DeleteInput,
  type QueryInput,
} from "./schema";

export const find_page = async (client: DB, params: QueryInput) => {
  const { method, path, user_agent, content, ip_address, current, pageSize } =
    params;
  const conditions = [
    method ? like(operation_log_table.method, `%${method}%`) : undefined,
    path ? like(operation_log_table.path, `%${path}%`) : undefined,
    user_agent
      ? like(operation_log_table.user_agent, `%${user_agent}%`)
      : undefined,
    content ? like(operation_log_table.content, `%${content}%`) : undefined,
    ip_address
      ? like(operation_log_table.ip_address, `%${ip_address}%`)
      : undefined,
  ].filter(Boolean);
  const where = conditions.length > 0 ? or(...conditions) : undefined;
  const list_prepared = client
    .select()
    .from(operation_log_table)
    .where(where)
    .orderBy(operation_log_table.created_at)
    .limit(pageSize)
    .offset((current - 1) * pageSize)
    .prepare();

  const total_prepared = client
    .select({ count: count() })
    .from(operation_log_table)
    .where(or(...conditions))
    .prepare();

  const list = await list_prepared.all();
  const total = await total_prepared.all();

  return {
    data: list,
    total: total[0].count,
  };
};

export const insert = async (client: DB, input: CreateInput) => {
  const _ = await client.insert(operation_log_table).values({
    method: input.method,
    path: input.path,
    user_agent: input.user_agent,
    content: input.content,
    ip_address: input.ip_address,
    // created_by: input.created_by,
  });
  return OperationLogConstants.CreatedSuccess;
};

export const remove = async (client: DB, input: DeleteInput) => {
  const { id } = input;
  const [entity] = await client
    .delete(operation_log_table)
    .where(eq(operation_log_table.id, id))
    .returning({ id: operation_log_table.id });

  if (!entity) {
    return OperationLogConstants.DeletedFail;
  }
  return OperationLogConstants.DeletedSuccess;
};
