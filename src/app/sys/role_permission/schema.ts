import { created_mixin } from "@/db/helpers/columns.helper";
import { index, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const role_permission_table = sqliteTable(
  "sys_role_permission",
  {
    role_id: text("role_id").notNull(),
    permission_id: text("permission_id").notNull(),
    ...created_mixin,
  },
  (table) => [
    primaryKey({
      name: "role_permission_pk",
      columns: [table.role_id, table.permission_id],
    }),
    index("sys_role_permission_role_idx").on(table.role_id),
    index("sys_role_permission_permission_idx").on(table.permission_id),
  ]
);
