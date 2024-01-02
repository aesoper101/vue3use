import { HttpClient } from './axios';
import type { RxjsAxiosOptions } from './interface';

export const createHttpClient = (createOptions?: RxjsAxiosOptions) => {
  const defaultOptions: RxjsAxiosOptions = {
    timeout: 2500,
  };

  return new HttpClient(Object.assign(defaultOptions, createOptions || {}));
};

let httpClient = createHttpClient();

export const setDefaultHttpClient = (client: HttpClient) => {
  httpClient = client;
};

export const getDefaultHttpClient = () => {
  return httpClient;
};
