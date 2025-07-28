import { create_app } from "./lib/create_app";
import { error_middleware } from "./middleware/error_middleware";
import { hono_middleware } from "./middleware/hono_middleware";
import { not_found_route } from "./route/not_found_route";
import { private_routes } from "./route/private_route";
import { public_routes } from "./route/public_route";

const app = create_app();
// 注册中间件
app.route("/", hono_middleware);
// 注册路由
app.route("/", public_routes);
app.route("/", private_routes);
app.notFound(not_found_route);
// 全局错误
app.onError(error_middleware);

export default app;
// export default {
//   port: 3000,
//   hostname: "0.0.0.0",
//   fetch: app.fetch,
// };
