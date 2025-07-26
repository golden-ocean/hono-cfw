import { GlobalConstants, StatusEnum } from "@/constant/system";
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

export const position_table = sqliteTable(
  "sys_position",
  {
    name: text("name", { length: 32 }).notNull().unique(),
    code: text("code", { length: 64 }).notNull().unique(),
    organization_id: text("organization_id")
      .notNull()
      .default(GlobalConstants.RootID),
    ...base_mixin,
    ...created_mixin,
    ...updated_mixin,
  },
  (table) => [
    index("sys_position_status_idx").on(table.status),
    index("sys_position_organization_id_idx").on(table.organization_id),
  ]
);

export const schema = object({
  id: pipe(string(), cuid2("ID 格式错误")),
  name: pipe(
    string(),
    minLength(2, "职位名称长度不能小于2"),
    maxLength(32, "职位名称长度不能大于32"),
    trim()
  ),
  code: pipe(
    string(),
    minLength(2, "职位编码长度不能小于2"),
    maxLength(32, "职位编码长度不能大于32"),
    trim()
  ),
  organization_id: optional(pipe(string(), cuid2())),
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
export const update_schema = required(partial(schema), [
  "id",
  "name",
  "code",
  "organization_id",
]);
export const delete_schema = required(pick(schema, ["id"]), ["id"]);
export const query_schema = object({
  ...partial(pick(schema, ["name", "code", "status", "remark"])).entries,
  ...object({
    current: optional(pipe(string(), transform(Number)), "1"),
    pageSize: optional(pipe(string(), transform(Number)), "10"),
  }).entries,
});
export type PositionType = InferOutput<typeof schema>;
export type QueryInput = InferOutput<typeof query_schema>;
export type CreateInput = InferInput<typeof insert_schema>;
export type UpdateInput = InferInput<typeof update_schema>;
export type DeleteInput = InferInput<typeof delete_schema>;
