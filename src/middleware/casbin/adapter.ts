import { CacheStore } from "@/cache";
import { DBStore } from "@/db";
import { Model } from "casbin";

export class SelfCasbinAdapter {
  private client: DBStore;
  private cache: CacheStore;
  private cacheKey = "casbin:policy";
  private cacheTtl = 60; // 缓存60秒

  constructor(client: DBStore, cache: CacheStore) {
    this.client = client;
    this.cache = cache;
  }

  async loadPolicy(model: Model) {
    // 先尝试从缓存读取
    const cached_policy = await this.cache.get(this.cacheKey);
    if (cached_policy) {
      return cached_policy;
    }
    const policy = await this.client.getPolicy();
    await this.cache.set(this.cacheKey, policy, this.cacheTtl);
    return policy;
  }
}
