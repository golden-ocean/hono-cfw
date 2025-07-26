import { env } from "cloudflare:workers";
import { kv_store } from "./kv";

const cache = kv_store(env.KV);

export default cache;
