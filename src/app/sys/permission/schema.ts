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
  picklist,
  pipe,
  required,
  string,
  transform,
  trim,
} from "valibot";

export const permission_table = sqliteTable(
  "sys_permission",
  {
    parent_id: text("parent_id").notNull().default(GlobalConstants.RootID),
    name: text("name", { length: 32 }).notNull().unique(),
    code: text("code").notNull().default(""),
    icon: text("icon").notNull().default(""),
    path: text("path").notNull().default(""),
    component: text("component").notNull().default(""),
    type: text("type")
      .$type<"Category" | "Menu" | "Button" | "API">()
      .notNull()
      .default("Menu"),
    method: text("method")
      .$type<"GET" | "POST" | "PUT" | "PATCH" | "DELETE">()
      .notNull()
      .default("GET"),
    visible: text("visible")
      .$type<"Enable" | "Disable">()
      .notNull()
      .default("Enable"),
    ...base_mixin,
    ...created_mixin,
    ...updated_mixin,
  },
  (table) => [
    index("sys_permission_parent_id_idx").on(table.parent_id),
    index("sys_permission_type_idx").on(table.type),
    index("sys_permission_status_idx").on(table.status),
  ]
);

export const schema = object({
  id: pipe(string(), cuid2("ID 格式错误")),
  parent_id: optional(
    pipe(string(), cuid2("父级ID 格式错误")),
    GlobalConstants.RootID
  ),
  name: pipe(
    string(),
    minLength(2, "权限名称长度不能小于2"),
    maxLength(32, "权限名称长度不能大于32"),
    trim()
  ),
  icon: pipe(string(), trim()),
  path: pipe(string(), trim()),
  code: pipe(string(), trim()),
  component: pipe(string(), trim()),
  type: optional(picklist(["Category", "Menu", "Button", "API"]), "Category"),
  method: optional(picklist(["GET", "POST", "PUT", "PATCH", "DELETE"]), "GET"),
  visible: optional(picklist(["Enable", "Disable"]), "Enable"),
  sort: optional(number()),
  status: optional(enumType(StatusEnum)),
  remark: optional(
    pipe(string(), trim(), maxLength(255, "备注长度不能超过255个字符"))
  ),
});

export const insert_schema = required(partial(omit(schema, ["id"])), [
  "name",
  "type",
]);
export const update_schema = required(partial(schema), ["id", "name", "type"]);
export const delete_schema = required(pick(schema, ["id"]), ["id"]);
export const query_schema = object({
  ...partial(pick(schema, ["name", "method", "type", "remark", "status"]))
    .entries,
  ...object({
    current: optional(pipe(string(), transform(Number)), "1"),
    pageSize: optional(pipe(string(), transform(Number)), "10"),
  }).entries,
});

export type PermissionType = InferOutput<typeof schema> & {
  children?: PermissionType[];
};
export type QueryInput = InferOutput<typeof query_schema>;
export type CreateInput = InferInput<typeof insert_schema>;
export type UpdateInput = InferInput<typeof update_schema>;
export type DeleteInput = InferInput<typeof delete_schema>;
