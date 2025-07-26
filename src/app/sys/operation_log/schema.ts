import { base_mixin, created_mixin } from "@/db/helpers/columns.helper";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  InferInput,
  InferOutput,
  cuid2,
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

export const operation_log_table = sqliteTable(
  "sys_operation_log",
  {
    method: text("method").default(""),
    path: text("path").default(""),
    content: text("content").notNull().default(""),
    ip_address: text("ip_address", { length: 64 }).default(""),
    user_agent: text("user_agent", { length: 256 }).default(""),
    duration: integer("duration").default(0),
    error_message: text("error_message").default(""),
    ...base_mixin,
    ...created_mixin,
  },
  (table) => [
    index("created_at_idx").on(table.created_at),
    index("created_by_idx").on(table.created_by),
  ]
);

export const schema = object({
  id: pipe(string(), cuid2("ID 格式错误")),
  method: pipe(string(), trim()),
  path: pipe(string(), trim()),
  content: pipe(string(), trim()),
  ip_address: pipe(string(), trim()),
  user_agent: pipe(string(), trim()),
  duration: optional(number()),
  error_message: optional(string()),
});
export const insert_schema = required(partial(omit(schema, ["id"])), [
  "method",
  "path",
  "content",
  "ip_address",
  "user_agent",
]);
export const delete_schema = required(pick(schema, ["id"]), ["id"]);
export const query_schema = object({
  ...partial(
    pick(schema, ["method", "path", "content", "user_agent", "ip_address"])
  ).entries,
  ...object({
    current: optional(pipe(string(), transform(Number)), "1"),
    pageSize: optional(pipe(string(), transform(Number)), "10"),
  }).entries,
});
export type OperationLogType = InferOutput<typeof schema>;
export type QueryInput = InferOutput<typeof query_schema>;
export type CreateInput = InferInput<typeof insert_schema>;
export type DeleteInput = InferInput<typeof delete_schema>;
