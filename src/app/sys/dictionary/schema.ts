import { StatusEnum } from "@/constant/system";
import {
  base_mixin,
  created_mixin,
  updated_mixin,
} from "@/db/helpers/columns.helper";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
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

export const dictionary_table = sqliteTable(
  "sys_dictionary",
  {
    name: text("name", { length: 32 }).notNull().unique(),
    code: text("code", { length: 64 }).notNull().unique(),
    ...base_mixin,
    ...created_mixin,
    ...updated_mixin,
  },
  (table) => [index("sys_dictionary_status_idx").on(table.status)]
);

export const schema = object({
  id: pipe(string(), cuid2("ID 格式错误")),
  name: pipe(
    string(),
    minLength(2, "字典名称长度不能小于2"),
    maxLength(32, "字典名称长度不能大于32"),
    trim()
  ),
  code: pipe(
    string(),
    minLength(2, "字典编码长度不能小于2"),
    maxLength(32, "字典编码长度不能大于32"),
    trim()
  ),
  sort: optional(number()),
  status: optional(enumType(StatusEnum)),
  remark: optional(
    pipe(string(), trim(), maxLength(255, "备注长度不能超过255个字符"))
  ),
});
export const insert_schema = required(partial(omit(schema, ["id"])), [
  "name",
  "code",
]);
export const update_schema = required(partial(schema), ["id", "name", "code"]);
export const delete_schema = required(pick(schema, ["id"]), ["id"]);
export const query_schema = object({
  ...partial(pick(schema, ["name", "code", "remark", "status"])).entries,
  ...object({
    current: optional(pipe(string(), transform(Number)), "1"),
    pageSize: optional(pipe(string(), transform(Number)), "10"),
  }).entries,
});

export type DictionaryType = InferOutput<typeof schema>;
export type QueryInput = InferOutput<typeof query_schema>;
export type CreateInput = InferOutput<typeof insert_schema>;
export type UpdateInput = InferInput<typeof update_schema>;
export type DeleteInput = InferInput<typeof delete_schema>;

export const param_schema = required(pick(schema, ["code"]), ["code"]);
export type ParamInput = InferInput<typeof param_schema>;
