import { sValidator } from "@hono/standard-validator";
import type { ValidationTargets } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AnySchema } from "valibot";

export const StandardValidator = <
  TSchema extends AnySchema,
  TTarget extends keyof ValidationTargets = "json"
>(
  target: TTarget,
  schema: TSchema
) =>
  sValidator(target, schema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: result.error[0].message,
      });
    }
  });
