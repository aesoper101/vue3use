export type OrNull<T> = T | null;

export type OrUndefined<T> = T | undefined;
export type OrNever<T> = T | never;
export type OrUnknown<T> = T | unknown;
export type Writable<T> = { -readonly [P in keyof T]: T[P] };

export type WritableArray<T> = T extends readonly any[] ? Writable<T> : T;

export type IfNever<T, Y = true, N = false> = [T] extends [never] ? Y : N;

export type IfUnknown<T, Y, N> = [unknown] extends [T] ? Y : N;

export type UnknownToNever<T> = IfUnknown<T, never, T>;

export type Nullable<T> = T | null | undefined;

export type Arrayable<T> = T | T[];

export type Awaitable<T> = Promise<T> | T;

export type Override<T, U> = Omit<T, keyof U> & U;

export type OverrideDeep<T, U> = T extends object
  ? Override<{ [K in keyof T]: OverrideDeep<T[K], U> }, U>
  : T;

export type AnyFunc<T = any> = (...args: any[]) => T;

export type Func = () => void;

export type KeyValue<T = any> = Record<string, T>;

export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

export type IsAny<T> = IfAny<T, true, false>;

export type IfEmpty<T, Y, N> = T extends never | '' | null | undefined ? Y : N;

export type IfExtends<T, X, Y, N> = T extends X ? Y : N;
