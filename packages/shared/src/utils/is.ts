export const isUndefined = (val: any): val is undefined => val === undefined;
export const isBoolean = (val: any): val is boolean => typeof val === 'boolean';
export const isNumber = (val: any): val is number => typeof val === 'number';

/**
 * Checks if value is numeric
 *
 * @param value - value to check, can be anything
 */
export const isNumeric = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

export const isString = (val: any): val is string => typeof val === 'string';

export function isFunction(obj: any): obj is (...args: any[]) => any {
  return typeof obj === 'function';
}

export function isObject(obj: any): obj is Record<string, any> {
  return obj !== null && typeof obj === 'object';
}
