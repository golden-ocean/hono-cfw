import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/**/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  driver: "d1-http",
  // verbose: true,
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
  // dbCredentials: {
  //   url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/e0a0ca7677e5be65df8027450b1acdf7f7f30ad284f80ab267efa4ec8f8549bc.sqlite",
  // },
});
