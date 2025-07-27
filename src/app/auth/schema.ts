import {
  InferInput,
  boolean,
  maxLength,
  minLength,
  object,
  optional,
  pipe,
  required,
  string,
  trim,
} from "valibot";

export const schema = object({
  username: pipe(string(), trim(), minLength(2), maxLength(64)),
  password: pipe(string(), trim(), minLength(6), maxLength(64)),
  remember: optional(boolean(), false),
});

export const login_schema = required(schema, ["username", "password"]);
export type LoginInput = InferInput<typeof login_schema>;

// export const jwt_schema = object({
//   sub: pipe(string(), cuid2()),
//   username: string(),
//   position_id: optional(pipe(string(), cuid2()), GlobalConstants.RootID),
//   iss: optional(pipe(string(), trim()), "hono-cfw"),
//   exp: number(),
//   iat: number(),
// });
// export type JWTPayload = InferInput<typeof jwt_schema>;
export type AccessTokenPayload = {
  sub: string;
  username: string;
  position_id: string;
  jti: string;
  nbf: number;
  iat: number;
  exp: number;
};
export type RefreshTokenPayload = {
  staff_id: string;
  access_jti: string;
};
