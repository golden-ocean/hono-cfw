import { handler as auth_handler } from "@/app/auth/handler";
import { create_router } from "@/lib/create_app";

export const public_routes = create_router().route("/auth", auth_handler);
