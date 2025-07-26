import type { DB } from "@/db";
import { and, count, eq, like, ne, or } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { dictionary_table } from "../dictionary/schema";
import { DictionaryItemConstants } from "./constants";
import {
  dictionary_item_table,
  type CreateInput,
  type DeleteInput,
  type DictionaryItemType,
  type QueryInput,
  type UpdateInput,
} from "./schema";

export const find_page = async (client: DB, params: QueryInput) => {
  const { current, pageSize, label, value, status, remark } = params;
  const conditions = [
    label ? like(dictionary_item_table.label, `%${label}%`) : undefined,
    value ? like(dictionary_item_table.value, `%${value}%`) : undefined,
    status ? eq(dictionary_item_table.status, status) : undefined,
    remark ? like(dictionary_item_table.remark, `%${remark}%`) : undefined,
  ].filter(Boolean);

  const where = conditions.length > 0 ? or(...conditions) : undefined;

  const list_prepared = client
    .select({
      id: dictionary_item_table.id,
      label: dictionary_item_table.label,
      value: dictionary_item_table.value,
      color: dictionary_item_table.color,
      sort: dictionary_item_table.sort,
      status: dictionary_item_table.status,
      remark: dictionary_item_table.remark,
    })
    .from(dictionary_item_table)
    .where(where)
    .orderBy(dictionary_item_table.sort)
    .limit(pageSize)
    .offset((current - 1) * pageSize)
    .prepare();

  const total_prepared = client
    .select({ count: count() })
    .from(dictionary_item_table)
    .where(where)
    .prepare();

  const list = await list_prepared.all();
  const total = await total_prepared.get();

  return {
    data: list,
    total: total?.count ?? 0,
  };
};

export const insert = async (client: DB, input: CreateInput) => {
  const { label, value, dictionary_id } = input;
  const duplicates = await validation_fields(client, {
    label,
    value,
  } as DictionaryItemType);
  if (duplicates.length > 0) {
    return DictionaryItemConstants.CreatedFail;
  }
  // 新增的时候需要判断下字典是否存在
  const dict = await client
    .select({
      id: dictionary_table.id,
    })
    .from(dictionary_table)
    .where(eq(dictionary_table.id, dictionary_id));
  if (dict.length == 0) {
    return DictionaryItemConstants.ErrorDictionaryNotExist;
  }
  const rows = await client
    .insert(dictionary_item_table)
    .values({
      dictionary_id: input.dictionary_id,
      label: input.label,
      value: input.value,
      color: input.color,
      sort: input.sort,
      status: input.status,
      remark: input.remark,
      // created_by: input.created_by,
    })
    .returning();
  if (rows.length === 0) {
    return DictionaryItemConstants.CreatedFail;
  }
  return DictionaryItemConstants.CreatedSuccess;
};

export const modify = async (client: DB, input: UpdateInput) => {
  const { label, value, id } = input;
  const duplicates = await validation_fields(client, {
    label,
    value,
    id,
  } as DictionaryItemType);

  if (duplicates.length > 0) return DictionaryItemConstants.UpdatedFail;
  const rows = await client
    .update(dictionary_item_table)
    .set(input)
    .where(eq(dictionary_item_table.id, input.id))
    .returning();
  if (rows.length === 0) {
    return DictionaryItemConstants.UpdatedFail;
  }
  return DictionaryItemConstants.UpdatedSuccess;
};

export const remove = async (client: DB, input: DeleteInput) => {
  const { id } = input;
  const rows = await client
    .delete(dictionary_item_table)
    .where(eq(dictionary_item_table.id, id))
    .returning();

  if (rows.length === 0) {
    return DictionaryItemConstants.DeletedFail;
  }
  return DictionaryItemConstants.DeletedSuccess;
};

const validation_fields = async (client: DB, e: DictionaryItemType) => {
  const { label, value, id, dictionary_id } = e;
  const conditions = [
    label ? eq(dictionary_item_table.label, label) : undefined,
    value ? eq(dictionary_item_table.value, value) : undefined,
  ];
  let where = or(...conditions);
  if (id) {
    where = and(
      ne(dictionary_item_table.id, id),
      eq(dictionary_item_table.dictionary_id, dictionary_id),
      where
    );
  }
  const duplicates = await client
    .select({
      id: dictionary_item_table.id,
      label: dictionary_item_table.label,
      value: dictionary_item_table.value,
    })
    .from(dictionary_item_table)
    .where(where)
    .limit(1);

  if (duplicates.length > 0) {
    if (duplicates[0].label == label) {
      throw new HTTPException(400, {
        message: DictionaryItemConstants.ErrorLabelRepeat,
      });
    }
    if (duplicates[0].value == value) {
      throw new HTTPException(400, {
        message: DictionaryItemConstants.ErrorValueRepeat,
      });
    }
  }
  return duplicates;
};
