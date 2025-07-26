import { handler as dictionary_handler } from "@/app/sys/dictionary/handler";
import { handler as dictionary_item_handler } from "@/app/sys/dictionary_item/handler";
import { handler as organization_handler } from "@/app/sys/organization/handler";
import { handler as permission_handler } from "@/app/sys/permission/handler";
import { handler as position_handler } from "@/app/sys/position/handler";
import { handler as role_handler } from "@/app/sys/role/handler";
import { handler as staff_handler } from "@/app/sys/staff/handler";
import { create_router } from "@/lib/create_app";
import { jwt_middleware } from "@/middleware/jwt_middleware";

const sys_routes = create_router()
  .use(jwt_middleware())
  .route("/position", position_handler)
  .route("/staff", staff_handler)
  .route("/role", role_handler)
  .route("/organization", organization_handler)
  .route("/permission", permission_handler)
  .route("/dictionary", dictionary_handler)
  .route("/dictionary/item", dictionary_item_handler);

export const private_routes = create_router().route("/sys", sys_routes);
