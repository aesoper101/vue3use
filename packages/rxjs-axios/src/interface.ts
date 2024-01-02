import type {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import type { AxiosAuthRefreshOptions } from 'axios-auth-refresh';
import type { Observable } from 'rxjs';

import type { Ref } from 'vue';

export interface RxjsAxiosRequestConfig extends AxiosRequestConfig {}

type True = true;
export interface ReactiveRequestOptions {
  isReactiveReturn: True;
}

export function isReactiveRequestOptions(
  options: any,
): options is ReactiveRequestOptions {
  return options && options.isReactiveReturn === true;
}

export interface RxjsReactiveResponse<T = any> {
  response: Ref<AxiosResponse<T> | undefined>;
  isLoading: Ref<boolean>;
  isFinished: Ref<boolean>;
  data: Ref<T | undefined>;
  error: Ref<Error | undefined>;
  isAborted: Ref<boolean>;
  abort: () => void;
}

export interface RxjsAxiosOptions
  extends AxiosRequestConfig,
    AxiosAuthRefreshOptions {
  refreshAccessToken?: <T = any>(
    response: AxiosResponse,
  ) => Observable<AxiosResponse<T>>;
  requestInterceptor?: RequestInterceptor;
  responseInterceptor?: ResponseInterceptor;
}

export type RequestInterceptor = (
  config: InternalAxiosRequestConfig,
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

export type ResponseInterceptor = (
  response: AxiosResponse,
) => AxiosResponse | Promise<AxiosResponse>;

export enum RequestHeaders {
  HeaderDeviceID = 'X-Device-Id',
}

export interface RxjsAxiosAPI {
  request<T = any>(
    config: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;

  get<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;

  delete<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;

  head<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;

  post<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;

  put<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;

  patch<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;

  getUri(config?: RxjsAxiosRequestConfig): string;

  transformResponseReactive<T = any>(
    response: () => Observable<AxiosResponse<T>>,
  ): RxjsReactiveResponse<T>;
}
