import { casbin } from "@hono/casbin";
import { jwtAuthorizer } from "@hono/casbin/helper";
import { newEnforcer } from "casbin";

const claimMapping = {
  position_id: "position_id",
};

export const casbinMiddleware = () =>
  casbin({
    newEnforcer: newEnforcer("./model.conf", "../config/policy.csv"),
    authorizer: (c, e) => jwtAuthorizer(c, e, claimMapping),
  });
