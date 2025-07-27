// 缓存接口定义
export interface CacheStore {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
  exist: (key: string) => Promise<boolean>;
  list: (
    prefix: string
  ) => Promise<readonly { name: string; expiration?: number }[]>;

  // clear: () => Promise<void>;
  // mget: (keys: string[]) => Promise<Map<string, string | null>>;
  // mset: (
  //   items: Array<{ key: string; value: string; ttl?: number }>
  // ) => Promise<void>;
}
