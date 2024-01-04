export type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;

export const isTruthy = <T>(value: T): value is Truthy<T> => {
  return Boolean(value);
};

export type Falsy<T> = T extends false | '' | 0 | null | undefined ? T : never;

export const isFalsy = <T>(value: T): value is Falsy<T> => !isTruthy(value);
