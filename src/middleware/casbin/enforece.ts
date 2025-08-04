import * as position_service from "@/app/sys/position/service";
import * as role_service from "@/app/sys/role/service";

import { DBStore } from "@/db";
import { newEnforcer, newModelFromString } from "casbin";

const model_conf = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && keyMatch2(r.obj, p.obj) && r.act == p.act || r.sub == "rootid000000000000000000"
`;

export const casbin_enforece = async (client: DBStore) => {
  const m = newModelFromString(model_conf);
  const e = await newEnforcer(m);

  const group_position_role = await position_service
    .find_position_role_all(client)
    .then((res) => res.map((item) => [item.position_id, item.role_id]));
  e.addGroupingPolicies(group_position_role);

  const policy_role_permission = await role_service
    .find_role_permission_all(client)
    .then((res) =>
      res.map((item) => [
        item.role_id,
        item.permission_id,
        item.path,
        item.method,
      ])
    );
  e.addPolicies(policy_role_permission);

  return e;
};
