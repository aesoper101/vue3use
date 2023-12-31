import type { RegistryItem } from './interface';

export class Registry<T extends RegistryItem> {
  private ordered: T[] = [];
  private byId = new Map<string, T>();
  private initialized = false;

  constructor(private init?: () => T[]) {
    this.init = init;
  }

  setInit = (init: () => T[]) => {
    if (this.initialized) {
      throw new Error('Registry already initialized');
    }
    this.init = init;
  };

  getIfExists(id: string | undefined): T | undefined {
    if (!this.initialized) {
      this.initialize();
    }

    if (id) {
      return this.byId.get(id);
    }

    return undefined;
  }

  /**
   * 初始化
   * Initialize the registry
   */
  private initialize() {
    if (this.init) {
      for (const ext of this.init()) {
        this.register(ext);
      }
    }
    this.sort();
    this.initialized = true;
  }

  /**
   * 获取
   * Get the registry item by ID
   */
  get(id: string): T {
    const v = this.getIfExists(id);
    if (!v) {
      throw new Error(`"${id}" not found in: ${this.list().map((v) => v.id)}`);
    }
    return v;
  }

  /**
   * 根据ID返回值列表，如果未指定，则返回所有值
   * Return a list of values by ID, or all values if not specified
   */
  list(ids?: string[]): T[] {
    if (!this.initialized) {
      this.initialize();
    }

    if (ids) {
      const found: T[] = [];
      for (const id of ids) {
        const v = this.getIfExists(id);
        if (v) {
          found.push(v);
        }
      }
      return found;
    }

    return this.ordered.slice();
  }

  /**
   * 判断是否为空注册表
   * Return true if the registry is empty
   */
  isEmpty(): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    return this.ordered.length === 0;
  }

  register(ext: T) {
    if (this.byId.has(ext.id)) {
      throw new Error('Duplicate Key:' + ext.id);
    }

    this.byId.set(ext.id, ext);
    this.ordered.push(ext);

    if (ext.aliasIds) {
      for (const alias of ext.aliasIds) {
        if (!this.byId.has(alias)) {
          this.byId.set(alias, ext);
        }
      }
    }

    if (this.initialized) {
      this.sort();
    }
  }

  find(predicate: (value: T, index: number, obj: T[]) => boolean): T[] {
    return this.ordered.slice().filter(predicate);
  }

  remove(id: string) {
    const item = this.byId.get(id);
    if (item) {
      this.byId.delete(id);
      const index = this.ordered.indexOf(item);
      if (index > -1) {
        this.ordered.splice(index, 1);
      }
    }
  }

  private sort() {
    // TODO sort the list
  }
}
