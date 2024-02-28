import type { AppEvent } from './interface';

export function createAppEvent<T>(name: string, payload?: T): AppEvent<T> {
  if (payload === undefined) {
    return { name };
  }
  return { name, payload };
}
