import { create_router } from "@/lib/create_app";
import { OK } from "@/lib/result";
import { sValidator } from "@hono/standard-validator";
import {
  delete_schema,
  insert_schema,
  query_schema,
  update_schema,
} from "./schema";
import * as service from "./service";

export const handler = create_router()
  .get("/tree", sValidator("query", query_schema), async (c) => {
    const validated = c.req.valid("query");
    const data = await service.find_tree(c.var.client, validated);
    return c.json(OK(data));
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
