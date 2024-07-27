import type {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import type { AxiosAuthRefreshOptions } from 'axios-auth-refresh';
import type { Observable } from 'rxjs';
import type { Ref } from 'vue';

export interface RxjsAxiosRequestConfig extends AxiosRequestConfig {
  [key: string]: any;
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
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
}

export interface RequestInterceptor {
  onFulfilled?: (
    value: InternalAxiosRequestConfig,
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  onRejected?: (error: any) => any;
}

export interface ResponseInterceptor {
  onFulfilled?: (
    value: AxiosResponse,
  ) => AxiosResponse | Promise<AxiosResponse>;
  onRejected?: (error: any) => any;
}

export interface RxjsAxiosAPI {
  request<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;

  request<T = any>(
    config: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;

  get<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;

  get<T = any>(config: RxjsAxiosRequestConfig): Observable<AxiosResponse<T>>;

  delete<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;

  delete<T = any>(config: RxjsAxiosRequestConfig): Observable<AxiosResponse<T>>;

  head<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;

  head<T = any>(config: RxjsAxiosRequestConfig): Observable<AxiosResponse<T>>;

  post<T = any, D = any>(
    url: string,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;

  post<T = any>(config: RxjsAxiosRequestConfig): Observable<AxiosResponse<T>>;

  put<T = any, D = any>(
    url: string,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;

  put<T = any>(config: RxjsAxiosRequestConfig): Observable<AxiosResponse<T>>;

  patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;

  patch<T = any>(config: RxjsAxiosRequestConfig): Observable<AxiosResponse<T>>;

  getUri(config?: RxjsAxiosRequestConfig): string;

  options<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;

  options<T = any>(
    config: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;

  postForm<T = any, D = any>(
    url: string,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;

  postForm<T = any>(
    config: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;

  putForm<T = any, D = any>(
    url: string,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;

  putForm<T = any>(
    config: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;

  patchForm<T = any, D = any>(
    url: string,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;

  patchForm<T = any>(
    config: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;
}
