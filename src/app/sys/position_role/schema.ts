import { created_mixin } from "@/db/helpers/columns.helper";
import { index, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const position_role_table = sqliteTable(
  "sys_position_role",
  {
    position_id: text("position_id").notNull(),
    role_id: text("role_id").notNull(),
    ...created_mixin,
  },
  (table) => [
    primaryKey({
      name: "position_role_pk",
      columns: [table.position_id, table.role_id],
    }),
    index("sys_position_role_position_idx").on(table.position_id),
    index("sys_position_role_role_idx").on(table.role_id),
  ]
);
