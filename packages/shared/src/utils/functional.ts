export function createSingleCallFunction<T extends Function>(
  this: unknown,
  fn: T,
  fnDidRunCallback?: () => void,
  ...args: any[]
): T {
  const _this = this;
  let didCall = false;
  let result: unknown;

  return function () {
    if (didCall) {
      return result;
    }

    didCall = true;
    if (fnDidRunCallback) {
      try {
        result = fn.apply(_this, args);
      } finally {
        fnDidRunCallback();
      }
    } else {
      result = fn.apply(_this, args);
    }

    return result;
  } as unknown as T;
}
