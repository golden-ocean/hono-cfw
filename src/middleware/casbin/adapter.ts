import type { DBStore } from "@/db";
import { Adapter, Model } from "casbin";

export class CasbinAdapter implements Adapter {
  private client: DBStore;
  constructor(client: DBStore) {
    this.client = client;
  }
  loadPolicy(model: Model): Promise<void> {
    throw new Error("Method not implemented.");
  }
  savePolicy(model: Model): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  addPolicy(sec: string, ptype: string, rule: string[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  removePolicy(sec: string, ptype: string, rule: string[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  removeFilteredPolicy(
    sec: string,
    ptype: string,
    fieldIndex: number,
    ...fieldValues: string[]
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
