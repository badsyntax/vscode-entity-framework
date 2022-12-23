import type { TreeItem } from './TreeItem';

export class TreeItemCache<TCache extends TreeItem[]> {
  private readonly cache = new Map<string, TCache>();

  public set(id: string, value: TCache) {
    this.cache.set(id, value);
  }

  public get(id: string): TCache | undefined {
    return this.cache.get(id);
  }

  public clear(id: string) {
    this.cache.delete(id);
  }

  public clearAll() {
    this.cache.clear();
  }
}
