import type { DBStore } from "@/db";
import { and, count, eq, like, ne, or, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { dictionary_item_table } from "../dictionary_item/schema";
import { DictionaryConstants } from "./constants";
import {
  dictionary_table,
  type CreateInput,
  type DeleteInput,
  type DictionaryType,
  type ParamInput,
  type QueryInput,
  type UpdateInput,
} from "./schema";

export const find_by_code = async (client: DBStore, param: ParamInput) => {
  const res_prepared = client
    .select({
      dictionary_id: dictionary_item_table.dictionary_id,
      label: dictionary_item_table.label,
      value: dictionary_item_table.value,
      color: dictionary_item_table.color,
      status: dictionary_item_table.status,
    })
    .from(dictionary_item_table)
    .innerJoin(
      dictionary_table,
      eq(dictionary_table.id, dictionary_item_table.dictionary_id)
    )
    .where(eq(dictionary_table.code, param.code))
    .prepare();
  const res = await res_prepared.all();
  return res;
};

export const find_page = async (client: DBStore, params: QueryInput) => {
  const { current, pageSize, name, code, status, remark } = params;
  const conditions = [
    name ? like(dictionary_table.name, `%${name}%`) : undefined,
    code ? like(dictionary_table.code, `%${code}%`) : undefined,
    status ? eq(dictionary_table.status, status) : undefined,
    remark ? like(dictionary_table.remark, `%${remark}%`) : undefined,
  ].filter(Boolean);

  const where = conditions.length > 0 ? or(...conditions) : undefined;
  const list_prepared = client
    .select({
      id: dictionary_table.id,
      name: dictionary_table.name,
      code: dictionary_table.code,
      sort: dictionary_table.sort,
      status: dictionary_table.status,
      remark: dictionary_table.remark,
    })
    .from(dictionary_table)
    .where(where)
    .orderBy(dictionary_table.sort)
    .limit(pageSize)
    .offset((current - 1) * pageSize)
    .prepare();

  const total_prepared = client
    .select({ count: count() })
    .from(dictionary_table)
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
  const { name, code } = input;
  const duplicates = await validation_fields(client, {
    name,
    code,
  } as DictionaryType);
  if (duplicates.length > 0) {
    return DictionaryConstants.CreatedFail;
  }
  const rows = await client
    .insert(dictionary_table)
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
    return DictionaryConstants.CreatedFail;
  }
  return DictionaryConstants.CreatedSuccess;
};

export const modify = async (client: DBStore, input: UpdateInput) => {
  const { name, code, id } = input;
  const duplicates = await validation_fields(client, {
    name,
    code,
    id,
  } as DictionaryType);
  if (duplicates.length > 0) return DictionaryConstants.UpdatedFail;
  const rows = await client
    .update(dictionary_table)
    .set(input)
    .where(eq(dictionary_table.id, input.id))
    .returning();
  if (rows.length === 0) {
    return DictionaryConstants.UpdatedFail;
  }
  return DictionaryConstants.UpdatedSuccess;
};

export const remove = async (client: DBStore, input: DeleteInput) => {
  const { id } = input;
  // 检查是否有字典选项
  const { exists_items } = await client.get<{ exists_items: boolean }>(
    sql`SELECT EXISTS (
      SELECT 1 FROM ${dictionary_item_table}
      WHERE ${dictionary_item_table.dictionary_id} = ${id}
    ) as exists_items`
  );
  if (exists_items) {
    throw new HTTPException(400, {
      message: DictionaryConstants.ErrorExistChildren,
    });
  }
  const rows = await client
    .delete(dictionary_table)
    .where(eq(dictionary_table.id, id))
    .returning();

  if (rows.length === 0) {
    return DictionaryConstants.DeletedFail;
  }
  return DictionaryConstants.DeletedSuccess;
};

const validation_fields = async (client: DBStore, e: DictionaryType) => {
  const { name, code, id } = e;
  const conditions = [
    name ? eq(dictionary_table.name, name) : undefined,
    code ? eq(dictionary_table.code, code) : undefined,
  ];
  let where = or(...conditions);
  if (id) {
    where = and(ne(dictionary_table.id, id), where);
  }
  const duplicates = await client
    .select({
      id: dictionary_table.id,
      name: dictionary_table.name,
      code: dictionary_table.code,
    })
    .from(dictionary_table)
    .where(where)
    .limit(1);

  if (duplicates.length > 0) {
    if (duplicates[0].code == code) {
      throw new HTTPException(400, {
        message: DictionaryConstants.ErrorCodeRepeat,
      });
    }
    if (duplicates[0].name == name) {
      throw new HTTPException(400, {
        message: DictionaryConstants.ErrorNameRepeat,
      });
    }
  }
  return duplicates;
};
