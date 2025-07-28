import { kv_store } from "./kv";
import { ICache } from "./type";

const cache = (kv: KVNamespace) => kv_store(kv);

export type CacheStore = ICache;

export default cache;
