export const kv_store = (cache: KVNamespace) => ({
  get: async (key: string) => {
    return await cache.get(key);
  },
  set: async (key: string, value: string, ttl = 60) => {
    return await cache.put(key, value, { expirationTtl: ttl });
  },
  delete: async (key: string) => {
    return await cache.delete(key);
  },
  exist: async (key: string) => {
    return (await cache.get(key)) !== null;
  },
  list: async (prefix: string) => {
    const res = await cache.list({ prefix });
    return res.keys;
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
