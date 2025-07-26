import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ValiError } from "valibot";

export const error_middleware: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        code: err.status,
        message: err.message,
        trace_id: c.env?.requestId,
        host: c.env?.HOST,
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
        trace_id: c.env?.requestId,
        host: c.env?.HOST,
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
        trace_id: c.env?.requestId,
        host: c.env?.HOST,
      },
      500
    );
  }
  return c.json(
    {
      success: false,
      code: 500,
      message: "Unknown error",
      trace_id: c.env?.requestId,
      host: c.env?.HOST,
    },
    500
  );
};
