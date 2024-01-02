import { HttpClient } from './axios';
import type { RxjsAxiosOptions } from './interface';

export const createHttpClient = (createOptions?: RxjsAxiosOptions) => {
  const defaultOptions: RxjsAxiosOptions = {
    timeout: 2500,
  };

  return new HttpClient(Object.assign(defaultOptions, createOptions || {}));
};
