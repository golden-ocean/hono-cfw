import { create_router } from "@/lib/create_app";
import { OK, OK_PAGE } from "@/lib/result";
import { sValidator } from "@hono/standard-validator";
import {
  delete_schema,
  insert_schema,
  param_schema,
  query_schema,
  update_schema,
} from "./schema";
import * as service from "./service";

export const handler = create_router()
  .get("/", sValidator("query", query_schema), async (c) => {
    const validated = c.req.valid("query");
    const { data, total } = await service.find_page(c.var.client, validated);
    return c.json(
      OK_PAGE(data, total, validated?.current, validated?.pageSize)
    );
  })
  .get("/:code", sValidator("param", param_schema), async (c) => {
    const validated = c.req.valid("param");
    const res = await service.find_by_code(c.var.client, validated);
    return c.json(OK(res));
  })
  .post("/", sValidator("json", insert_schema), async (c) => {
    const validated = c.req.valid("json");
    const res = await service.insert(c.var.client, validated);
    return c.json(OK(res));
  })
  .put("/", sValidator("json", update_schema), async (c) => {
    const validated = c.req.valid("json");
    const res = await service.modify(c.var.client, validated);
    return c.json(OK(res));
  })
  .delete("/", sValidator("json", delete_schema), async (c) => {
    const validated = c.req.valid("json");
    const res = await service.remove(c.var.client, validated);
    return c.json(OK(res));
  });
