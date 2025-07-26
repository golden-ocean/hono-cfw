import type { ICache } from "./type";

export const kv_store = (client: KVNamespace): ICache => ({
  get: async (key: string) => {
    return await client.get(key);
  },
  set: async (key: string, value: string, ttl = 60) => {
    return await client.put(key, value, { expirationTtl: ttl });
  },
  delete: async (key: string) => {
    return await client.delete(key);
  },
  exist: async (key: string) => {
    return (await client.get(key)) !== null;
  },
  // clear: async () => {
  //   return await cache.clear();
  // },
  // mget: async (keys: string[]) => {
  //   return await client.get(keys);
  // },
  // mset: async (
  //   items: { key: string; value: string; ttl?: number | undefined }[]
  // ) => {
  //   throw new Error("Function not implemented.");
  // },
});
