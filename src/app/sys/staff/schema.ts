import { GenderEnum, GlobalConstants, StatusEnum } from "@/constant/system";
import {
  base_mixin,
  created_mixin,
  updated_mixin,
} from "@/db/helpers/columns.helper";
import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
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
  picklist,
  pipe,
  required,
  string,
  transform,
  trim,
} from "valibot";

export const staff_table = sqliteTable(
  "sys_staff",
  {
    username: text("username", { length: 64 }).notNull().unique(),
    password: text("password", { length: 64 }).notNull(),
    password_updated_at: integer("created_at", { mode: "number" })
      .notNull()
      .default(sql`(unixepoch())`),
    salt: text("salt", { length: 64 }).notNull().default(""),
    staff_no: text("staff_no", { length: 32 }).notNull().default(""),
    name: text("name", { length: 32 }).notNull().default(""),
    email: text("email", { length: 128 }).notNull().unique(),
    mobile: text("mobile", { length: 32 }).notNull().unique(),
    avatar: text("avatar", { length: 256 }),
    gender: text("gender", {
      enum: [GenderEnum.Unknown, GenderEnum.Male, GenderEnum.Female],
    })
      .notNull()
      .default(GenderEnum.Unknown),
    organization_id: text("organization_id").default(GlobalConstants.RootID),
    position_id: text("position_id"),
    work_status: text("work_status"),
    data_scope: text("data_scope"),
    ...base_mixin,
    ...created_mixin,
    ...updated_mixin,
  },
  (table) => [
    index("sys_staff_username_idx").on(table.username),
    index("sys_staff_email_idx").on(table.email),
    index("sys_staff_mobile_idx").on(table.mobile),
    index("sys_staff_status_idx").on(table.status),
    index("sys_staff_organization_id_idx").on(table.organization_id),
  ]
);

export const schema = object({
  id: pipe(string(), cuid2("ID 格式错误")),
  username: pipe(
    string(),
    minLength(2, "用户名称长度不能小于2"),
    maxLength(64, "用户名称长度不能大于64"),
    trim()
  ),
  password: pipe(
    string(),
    minLength(6, "密码长度不能小于6"),
    maxLength(64, "密码长度不能大于64"),
    trim()
  ),
  salt: pipe(string(), maxLength(64, "长度不能大于64"), trim()),
  staff_no: pipe(string(), maxLength(64, "长度不能大于32"), trim()),
  name: optional(
    pipe(
      string(),
      minLength(2, "用户姓名长度不能小于2"),
      maxLength(32, "用户姓名长度不能大于32"),
      trim()
    )
  ),
  gender: optional(
    picklist([GenderEnum.Unknown, GenderEnum.Male, GenderEnum.Female])
  ),
  email: pipe(string(), email("邮箱格式错误"), trim()),
  mobile: pipe(string(), trim()),
  avatar: pipe(string(), trim()),
  work_status: pipe(string(), trim()),
  organization_id: optional(pipe(string(), cuid2("组织ID格式错误"))),
  position_id: optional(pipe(string(), cuid2("岗位ID格式错误"))),
  sort: optional(number()),
  status: optional(enumType(StatusEnum)),
  remark: optional(
    pipe(string(), trim(), maxLength(255, "备注长度不能超过255个字符"))
  ),
});
export const insert_schema = required(partial(omit(schema, ["id", "salt"])), [
  "username",
  "password",
  "email",
  "mobile",
]);
export const update_schema = required(partial(schema), [
  "id",
  "username",
  "email",
  "mobile",
]);
export const delete_schema = required(pick(schema, ["id"]), ["id"]);
export const query_schema = object({
  ...partial(
    pick(schema, [
      "username",
      "name",
      "email",
      "gender",
      "mobile",
      "organization_id",
      "position_id",
      "status",
      "remark",
    ])
  ).entries,
  ...object({
    current: optional(pipe(string(), transform(Number)), "1"),
    pageSize: optional(pipe(string(), transform(Number)), "10"),
  }).entries,
});

export type StaffType = InferOutput<typeof schema>;
export type QueryInput = InferOutput<typeof query_schema>;
export type CreateInput = InferInput<typeof insert_schema>;
export type UpdateInput = InferInput<typeof update_schema>;
export type DeleteInput = InferInput<typeof delete_schema>;
