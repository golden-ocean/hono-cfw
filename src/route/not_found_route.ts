import type { NotFoundHandler } from "hono";

export const not_found_route: NotFoundHandler = (c) => {
  return c.json(
    {
      success: false,
      code: 404,
      message: "Not Found",
    },
    404
  );
};
