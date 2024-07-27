import type { AxiosResponse } from 'axios';
import type { Observable } from 'rxjs';
import { HttpClient } from './axios';
import type {
  RxjsAxiosOptions,
  RxjsAxiosRequestConfig,
  RxjsReactiveResponse,
} from './interface';

export const createHttpClient = (createOptions?: RxjsAxiosOptions) => {
  const defaultOptions: RxjsAxiosOptions = {
    timeout: 2500,
  };

  return HttpClient.create(Object.assign({}, defaultOptions, createOptions));
};

let httpClient = createHttpClient();

export const setDefaultHttpClient = (client: HttpClient) => {
  httpClient = client;
};

export const getDefaultHttpClient = () => {
  return httpClient;
};

export function request<T = any>(
  url: string,
  config?: RxjsAxiosRequestConfig,
): RxjsReactiveResponse<T>;
export function request<T = any>(
  config: RxjsAxiosRequestConfig,
): Observable<AxiosResponse<T>>;
export function request<T = any>(
  url: string | RxjsAxiosRequestConfig,
  config?: RxjsAxiosRequestConfig,
): any {
  if (typeof url === 'string') {
    return httpClient.request<T>(url, config);
  }

  return httpClient.request<T>(url);
}

export function get<T = any>(
  url: string,
  config?: RxjsAxiosRequestConfig,
): RxjsReactiveResponse<T>;
export function get<T = any>(
  config: RxjsAxiosRequestConfig,
): Observable<AxiosResponse<T>>;
export function get<T = any>(
  url: string | RxjsAxiosRequestConfig,
  config?: RxjsAxiosRequestConfig,
): any {
  if (typeof url === 'string') {
    return httpClient.get<T>(url, config);
  }
  return httpClient.get<T>(url);
}

export function getUri(config?: RxjsAxiosRequestConfig): string {
  return httpClient.getUri(config);
}

export function head<T = any>(
  url: string,
  config?: RxjsAxiosRequestConfig,
): RxjsReactiveResponse<T>;
export function head<T = any>(
  config: RxjsAxiosRequestConfig,
): Observable<AxiosResponse<T>>;
export function head<T = any>(
  url: string | RxjsAxiosRequestConfig,
  config?: RxjsAxiosRequestConfig,
): any {
  if (typeof url === 'string') {
    return httpClient.head<T>(url, config);
  }
  return httpClient.head<T>(url);
}

export function patch<T = any, D = any>(
  url: string,
  data?: D,
  config?: RxjsAxiosRequestConfig,
): RxjsReactiveResponse<T>;
export function patch<T = any>(
  config: RxjsAxiosRequestConfig,
): Observable<AxiosResponse<T>>;
export function patch<T = any, D = any>(
  url: string | RxjsAxiosRequestConfig,
  data?: D,
  config?: RxjsAxiosRequestConfig,
): any {
  if (typeof url === 'string') {
    return httpClient.patch<T, D>(url, data, config);
  }
  return httpClient.patch<T>(url);
}

export function post<T = any, D = any>(
  url: string,
  data?: D,
  config?: RxjsAxiosRequestConfig,
): RxjsReactiveResponse<T>;
export function post<T = any>(
  config: RxjsAxiosRequestConfig,
): Observable<AxiosResponse<T>>;
export function post<T = any, D = any>(
  url: string | RxjsAxiosRequestConfig,
  data?: D,
  config?: RxjsAxiosRequestConfig,
): any {
  if (typeof url === 'string') {
    return httpClient.post<T, D>(url, data, config);
  }
  return httpClient.post<T>(url);
}

export function put<T = any, D = any>(
  url: string,
  data?: D,
  config?: RxjsAxiosRequestConfig,
): RxjsReactiveResponse<T>;
export function put<T = any>(
  config: RxjsAxiosRequestConfig,
): Observable<AxiosResponse<T>>;
export function put<T = any, D = any>(
  url: string | RxjsAxiosRequestConfig,
  data?: D,
  config?: RxjsAxiosRequestConfig,
): any {
  if (typeof url === 'string') {
    return httpClient.put<T, D>(url, data, config);
  }
  return httpClient.put<T>(url);
}

export function patchForm<T = any, D = any>(
  url: string,
  data?: D,
  config?: RxjsAxiosRequestConfig,
): RxjsReactiveResponse<T>;
export function patchForm<T = any>(
  config: RxjsAxiosRequestConfig,
): Observable<AxiosResponse<T>>;
export function patchForm<T = any, D = any>(
  url: string | RxjsAxiosRequestConfig,
  data?: D,
  config?: RxjsAxiosRequestConfig,
): any {
  if (typeof url === 'string') {
    return httpClient.patchForm<T, D>(url, data, config);
  }
  return httpClient.patchForm<T>(url);
}

export function postForm<T = any, D = any>(
  url: string,
  data?: D,
  config?: RxjsAxiosRequestConfig,
): RxjsReactiveResponse<T>;
export function postForm<T = any>(
  config: RxjsAxiosRequestConfig,
): Observable<AxiosResponse<T>>;
export function postForm<T = any, D = any>(
  url: string | RxjsAxiosRequestConfig,
  data?: D,
  config?: RxjsAxiosRequestConfig,
): any {
  if (typeof url === 'string') {
    return httpClient.postForm<T, D>(url, data, config);
  }
  return httpClient.postForm<T>(url);
}

export function putForm<T = any, D = any>(
  url: string,
  data?: D,
  config?: RxjsAxiosRequestConfig,
): RxjsReactiveResponse<T>;
export function putForm<T = any>(
  config: RxjsAxiosRequestConfig,
): Observable<AxiosResponse<T>>;
export function putForm<T = any, D = any>(
  url: string | RxjsAxiosRequestConfig,
  data?: D,
  config?: RxjsAxiosRequestConfig,
): any {
  if (typeof url === 'string') {
    return httpClient.putForm<T, D>(url, data, config);
  }

  return httpClient.putForm<T>(url);
}

export function options<T = any>(
  url: string,
  config?: RxjsAxiosRequestConfig,
): RxjsReactiveResponse<T>;
export function options<T = any>(
  config: RxjsAxiosRequestConfig,
): Observable<AxiosResponse<T>>;
export function options<T = any>(
  url: string | RxjsAxiosRequestConfig,
  config?: RxjsAxiosRequestConfig,
): any {
  if (typeof url === 'string') {
    return httpClient.options(url, config);
  }
  return httpClient.options(url);
}

export function del<T = any>(
  url: string,
  config?: RxjsAxiosRequestConfig,
): RxjsReactiveResponse<T>;
export function del<T = any>(
  config: RxjsAxiosRequestConfig,
): Observable<AxiosResponse<T>>;
export function del<T = any>(
  url: string | RxjsAxiosRequestConfig,
  config?: RxjsAxiosRequestConfig,
): any {
  if (typeof url === 'string') {
    return httpClient.delete<T>(url, config);
  }
  return httpClient.delete<T>(url);
}
