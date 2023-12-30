export const isUndefined = (val: any): val is undefined => val === undefined;
export const isBoolean = (val: any): val is boolean => typeof val === 'boolean';
export const isNumber = (val: any): val is number => typeof val === 'number';
export const isString = (val: any): val is string => typeof val === 'string';

export function isFunction(obj: any): obj is (...args: any[]) => any {
  return typeof obj === 'function';
}
export function isWindow(el: any): el is Window {
  return el === window;
}

export function isObject(obj: any): obj is Record<string, any> {
  return obj !== null && typeof obj === 'object';
}
