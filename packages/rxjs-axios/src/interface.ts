import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { Observable } from 'rxjs';

export interface RxjsAxiosRequestConfig extends AxiosRequestConfig {
  getResponse?: boolean;
}

export interface RxjsAxiosAPI {
  request<T = any>(config: AxiosRequestConfig): Observable<AxiosResponse<T>>;
  request<T = any>(
    config: AxiosRequestConfig,
    options: { getResponse: true },
  ): Observable<T>;

  get<T = any>(url: string, config?: RxjsAxiosRequestConfig): Observable<T>;
  get<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig & { getResponse: true },
  ): Observable<AxiosResponse<T>>;

  delete<T = any>(url: string, config?: RxjsAxiosRequestConfig): Observable<T>;
  delete<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig & { getResponse: true },
  ): Observable<AxiosResponse<T>>;

  head<T = any>(url: string, config?: RxjsAxiosRequestConfig): Observable<T>;
  head<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig & { getResponse: true },
  ): Observable<AxiosResponse<T>>;

  post<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig,
  ): Observable<T>;
  post<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig & { getResponse: true },
  ): Observable<AxiosResponse<T>>;

  put<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig,
  ): Observable<T>;
  put<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig & { getResponse: true },
  ): Observable<AxiosResponse<T>>;

  patch<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig,
  ): Observable<T>;
  patch<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig & { getResponse: true },
  ): Observable<AxiosResponse<T>>;

  getUri(config?: RxjsAxiosRequestConfig): string;
}
