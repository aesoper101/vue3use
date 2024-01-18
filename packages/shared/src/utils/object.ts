import { isArray } from 'lodash';

import { isObject } from './is';

const prototypeHasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwnProperty(
  obj: any,
  key: string | number | symbol,
): boolean {
  return obj && prototypeHasOwnProperty.call(obj, key);
}

export function isPlainObject(value: any): value is any {
  if (!isObject(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return (
    proto === Object.prototype ||
    proto === null ||
    Object.getPrototypeOf(proto) === null
  );
}

export const isEmptyObject = (
  value: unknown,
): value is Record<string, never> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.keys(value).length === 0
  );
};

export function deepCloneWithoutNulls<T extends {}>(value: T): T {
  if (isArray(value)) {
    return value.map(deepCloneWithoutNulls) as unknown as T;
  }
  if (isPlainObject(value)) {
    return Object.keys(value).reduce((acc: any, key) => {
      const v = (value as any)[key];
      if (v != null) {
        acc[key] = deepCloneWithoutNulls(v);
      }
      return acc;
    }, {});
  }
  return value;
}

export function sortedDeepCloneWithoutNulls<T extends {}>(value: T): T {
  if (isArray(value)) {
    return value.map(sortedDeepCloneWithoutNulls) as unknown as T;
  }
  if (isPlainObject(value)) {
    return Object.keys(value)
      .sort()
      .reduce((acc: any, key) => {
        const v = (value as any)[key];
        if (v != null) {
          acc[key] = sortedDeepCloneWithoutNulls(v);
        }
        return acc;
      }, {});
  }
  return value;
}

export function deepCloneWithoutNonValues<T extends {}>(value: T): T {
  if (isArray(value)) {
    return value.map(deepCloneWithoutNonValues) as unknown as T;
  }
  if (isPlainObject(value)) {
    return Object.keys(value).reduce((acc: any, key) => {
      const v = (value as any)[key];
      if (v != null || v != undefined) {
        acc[key] = deepCloneWithoutNonValues(v);
      }
      return acc;
    }, {});
  }
  return value;
}

export function sortedDeepCloneWithoutNonValues<T extends {}>(value: T): T {
  if (isArray(value)) {
    return value.map(sortedDeepCloneWithoutNonValues) as unknown as T;
  }
  if (isPlainObject(value)) {
    return Object.keys(value)
      .sort()
      .reduce((acc: any, key) => {
        const v = (value as any)[key];
        if (v != null || v != undefined) {
          acc[key] = sortedDeepCloneWithoutNonValues(v);
        }
        return acc;
      }, {});
  }
  return value;
}
