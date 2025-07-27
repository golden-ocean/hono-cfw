import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ValiError } from "valibot";

export const error_middleware: ErrorHandler = (err, c) => {
  const request_id = c.get("requestId");
  const host = c.req.header("host");
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        code: err.status,
        message: err.message,
        trace_id: request_id,
        host,
      },
      err.status
    );
  }
  if (err instanceof ValiError) {
    const messages = err.issues.map((issue) => issue.message);
    return c.json(
      {
        success: false,
        code: 400,
        message: messages,
        trace_id: request_id,
        host,
      },
      400
    );
  }

  if (err instanceof Error) {
    return c.json(
      {
        success: false,
        code: 500,
        message: err.message,
        trace_id: request_id,
        host,
      },
      500
    );
  }
  return c.json(
    {
      success: false,
      code: 500,
      message: "Unknown error",
      trace_id: request_id,
      host,
    },
    500
  );
};
