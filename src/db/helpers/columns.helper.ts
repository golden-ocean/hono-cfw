import { StatusEnum } from "@/constant/system";
import { generate_id } from "@/lib/id";
import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";

export const base_mixin = {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generate_id()),
  status: text("status", { enum: [StatusEnum.Enable, StatusEnum.Disable] })
    .notNull()
    .default(StatusEnum.Enable),
  sort: integer("sort").notNull().default(1000),
  remark: text("remark").notNull().default(""),
};

export const created_mixin = {
  created_at: integer("created_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`),
  created_by: text("created_by"),
};

export const updated_mixin = {
  updated_at: integer("updated_at", { mode: "number" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`),
  updated_by: text("updated_by"),
};

export const deleted_mixin = {
  deleted_at: integer("deleted_at", { mode: "number" }),
};

export const version_mixin = {
  version: integer("version")
    .default(0)
    .$onUpdate(() => sql`(version + 1)`),
};
