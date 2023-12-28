import { type Nullable, isString } from '@aesoper/shared';
import lodashGet from 'lodash.get';
import lodashHas from 'lodash.has';

import type {
  ConfigGetOptions,
  ConfigInterface,
  ConfigSetOptions,
} from './interface';

export class Config implements ConfigInterface {
  private readonly config: Record<string, any>;

  private waits = new Map<
    string,
    Array<{
      resolve: (data: any) => void;
      once?: boolean;
    }>
  >();

  constructor(config?: Record<string, any>) {
    this.config = config || {};
  }

  batchSet(config: Record<string, any>): void;
  batchSet(config: ConfigSetOptions[]): Promise<any>;
  batchSet(
    config: Record<string, any> | ConfigSetOptions[],
  ): void | Promise<any> {
    if (Array.isArray(config)) {
      const promiseList: Promise<any>[] = [];
      config.forEach((item) => {
        promiseList.push(this.set(item));
      });

      return Promise.all([...promiseList]);
    }

    Object.keys(config).forEach((key) => {
      this.set(key, config[key]);
    });
  }

  get<T = any>(key: string, defaultValue?: T): Nullable<T>;
  get<T = any>(options: ConfigGetOptions<T>): Promise<T>;
  get<T = any>(key: string | ConfigGetOptions<T>, defaultValue?: T): any {
    if (isString(key)) {
      return lodashGet(this.config, key, defaultValue);
    }

    const opts = key as ConfigGetOptions;

    return new Promise((resolve, reject) => {
      if (lodashHas(this.config, opts.key)) {
        const result = lodashGet(this.config, opts.key, opts.defaultValue);
        opts.success && opts.success(result);
        resolve(result);
      } else if (opts.wait) {
        // 一直等待直到获取到配置值为止
        this.setWait(
          opts.key,
          (data) => {
            opts.success && opts.success(data);
            resolve(data);
          },
          opts.waitOnce,
        );
      } else {
        const error = new Error(`${opts.key} cant not be found.`);
        opts.fail && opts.fail(error);
        reject(error);
      }
    })
      .catch((reason) => {
        return Promise.reject(reason);
      })
      .finally(() => opts.complete && opts.complete());
  }

  has(key: string): boolean {
    return lodashHas(this.config, key);
  }

  set<T = any>(key: string, value: T): T;
  set<T = any>(option: ConfigSetOptions<T>): Promise<T>;
  set<T = any>(key: string | ConfigSetOptions<T>, value?: T): any {
    if (isString(key)) {
      this.config.set(key, value);
      this.notifyGot(key);
      return value;
    }

    const opts = key as ConfigSetOptions;
    return new Promise((resolve) => {
      this.set(opts.key, opts.value);
      opts.success && opts.success(opts.value);
      resolve(opts.value);
    })
      .catch((reason) => {
        opts.fail && opts.fail(reason);
        return Promise.reject(reason);
      })
      .finally(() => {
        opts.complete && opts.complete();
      });
  }

  private notifyGot(key: string): void {
    let waits = this.waits.get(key);
    if (!waits) {
      return;
    }
    waits = waits.slice().reverse();
    let i = waits.length;
    while (i--) {
      waits[i].resolve(this.get(key));
      if (waits[i].once) {
        waits.splice(i, 1);
      }
    }
    if (waits.length > 0) {
      this.waits.set(key, waits);
    } else {
      this.waits.delete(key);
    }
  }

  private setWait(key: string, resolve: (data: any) => void, once?: boolean) {
    const waits = this.waits.get(key);
    if (waits) {
      waits.push({ resolve, once });
    } else {
      this.waits.set(key, [{ resolve, once }]);
    }
  }

  private delWait(key: string, fn: any) {
    const waits = this.waits.get(key);
    if (!waits) {
      return;
    }
    let i = waits.length;
    while (i--) {
      if (waits[i].resolve === fn) {
        waits.splice(i, 1);
      }
    }
    if (waits.length < 1) {
      this.waits.delete(key);
    }
  }
}
