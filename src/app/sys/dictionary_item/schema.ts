import { GlobalConstants, StatusEnum } from "@/constant/system";
import {
  base_mixin,
  created_mixin,
  updated_mixin,
} from "@/db/helpers/columns.helper";
import { index, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import {
  InferInput,
  InferOutput,
  cuid2,
  enum as enumType,
  maxLength,
  minLength,
  number,
  object,
  omit,
  optional,
  partial,
  pick,
  pipe,
  required,
  string,
  transform,
  trim,
} from "valibot";

export const dictionary_item_table = sqliteTable(
  "sys_dictionary_item",
  {
    dictionary_id: text("dictionary_id")
      .notNull()
      .default(GlobalConstants.RootID),
    label: text("label", { length: 32 }).notNull().default(""),
    value: text("value", { length: 64 }).notNull().default(""),
    color: text("color", { length: 32 }).default(""),
    ...base_mixin,
    ...created_mixin,
    ...updated_mixin,
  },
  (table) => [
    unique("sys_dict_item_dictionary_id_label_unique").on(
      table.dictionary_id,
      table.label
    ),
    unique("sys_dict_item_dictionary_id_value_unique").on(
      table.dictionary_id,
      table.value
    ),
    index("sys_dictionary_item_status_idx").on(table.status),
    index("sys_dictionary_item_dictionary_id_idx").on(table.dictionary_id),
  ]
);

export const schema = object({
  id: pipe(string(), cuid2("ID 格式错误")),
  dictionary_id: optional(
    pipe(string(), cuid2("字典ID 格式错误")),
    GlobalConstants.RootID
  ),
  label: pipe(
    string(),
    minLength(2, "字典选项名称长度不能小于2"),
    maxLength(32, "字典选项名称长度不能大于32"),
    trim()
  ),
  value: pipe(
    string(),
    minLength(2, "字典选项编码长度不能小于2"),
    maxLength(32, "字典选项编码长度不能大于32"),
    trim()
  ),
  color: optional(pipe(string(), trim())),
  sort: optional(number()),
  status: optional(enumType(StatusEnum)),
  remark: optional(
    pipe(string(), trim(), maxLength(255, "备注长度不能超过255个字符"))
  ),
});

export const insert_schema = required(partial(omit(schema, ["id"])), [
  "dictionary_id",
  "label",
  "value",
]);
export const update_schema = required(partial(schema), [
  "id",
  "dictionary_id",
  "label",
  "value",
]);
export const delete_schema = required(pick(schema, ["id"]), ["id"]);
export const query_schema = object({
  ...partial(pick(schema, ["label", "value", "remark", "status"])).entries,
  ...object({
    current: optional(pipe(string(), transform(Number)), "1"),
    pageSize: optional(pipe(string(), transform(Number)), "10"),
  }).entries,
});
export type DictionaryItemType = InferOutput<typeof schema>;
export type QueryInput = InferOutput<typeof query_schema>;
export type CreateInput = InferInput<typeof insert_schema>;
export type UpdateInput = InferInput<typeof update_schema>;
export type DeleteInput = InferInput<typeof delete_schema>;
