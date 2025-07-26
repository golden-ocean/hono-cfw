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
  email,
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
  trim,
} from "valibot";

export const organization_table = sqliteTable(
  "sys_organization",
  {
    parent_id: text("parent_id").notNull().default(GlobalConstants.RootID),
    name: text("name", { length: 32 }).notNull().unique(),
    code: text("code", { length: 64 }).notNull().unique(),
    contact: text("contact", { length: 32 }).notNull().default(""),
    phone: text("phone", { length: 32 }).notNull().default(""),
    email: text("email", { length: 128 }).notNull().default(""),
    ...base_mixin,
    ...created_mixin,
    ...updated_mixin,
  },
  (table) => [
    index("sys_organization_parent_idx").on(table.parent_id),
    index("sys_organization_status_idx").on(table.status),
  ]
);

export const schema = object({
  id: pipe(string(), cuid2("ID 格式错误")),
  parent_id: optional(
    pipe(string(), cuid2("父级 ID 格式错误")),
    GlobalConstants.RootID
  ),
  name: pipe(
    string(),
    minLength(2, "组织名称长度不能小于2"),
    maxLength(32, "组织名称长度不能大于32"),
    trim()
  ),
  code: pipe(
    string(),
    minLength(2, "组织编码长度不能小于2"),
    maxLength(64, "组织编码长度不能大于64"),
    trim()
  ),
  contact: optional(
    pipe(
      string(),
      minLength(2, "组织联系人长度不能小于2"),
      maxLength(32, "组织联系人长度不能大于32"),
      trim()
    )
  ),
  email: optional(pipe(string(), email("邮箱格式错误"), trim())),
  phone: optional(pipe(string(), trim())),
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
export const query_schema = partial(
  pick(schema, ["name", "code", "remark", "status"])
);

export type OrganizationType = InferOutput<typeof schema> & {
  children?: OrganizationType[];
};
export type QueryInput = InferOutput<typeof query_schema>;
export type CreateInput = InferOutput<typeof insert_schema>;
export type UpdateInput = InferInput<typeof update_schema>;
export type DeleteInput = InferInput<typeof delete_schema>;
