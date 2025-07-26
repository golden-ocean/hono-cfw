import { created_mixin } from "@/db/helpers/columns.helper";
import { index, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const staff_position_table = sqliteTable(
  "sys_staff_position",
  {
    staff_id: text("staff_id").notNull(),
    position_id: text("position_id").notNull(),
    ...created_mixin,
  },
  (table) => [
    primaryKey({
      name: "staff_position_pk",
      columns: [table.staff_id, table.position_id],
    }),
    index("sys_staff_position_staff_idx").on(table.staff_id),
    index("sys_staff_position_position_idx").on(table.position_id),
  ]
);
