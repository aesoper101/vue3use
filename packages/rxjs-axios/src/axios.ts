import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  isAxiosError,
  isCancel,
} from 'axios';
import {
  Observable,
  type RetryConfig,
  catchError,
  map,
  retry,
  tap,
} from 'rxjs';

import type { RxjsAxiosAPI, RxjsAxiosRequestConfig } from './interface';

axios.defaults.headers.common['Content-Type'] = 'application/json';

// 通过uri, params, data, method 用qs生成一个唯一的key
function generateKey(uri: string, params: any, data: any, method: string) {
  // qs.stringify()
  return;
}

export interface RxjsAxiosOptions extends AxiosRequestConfig {
  retry?: RetryConfig;
  showRefreshToken?: (response: AxiosResponse) => boolean;
  refreshAccessToken?: <T = any>() => Observable<AxiosResponse<T> | T>;
  requestInterceptor?: RequestInterceptor;
  responseInterceptor?: ResponseInterceptor;
}

export type RequestInterceptor = (
  config: InternalAxiosRequestConfig,
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

export type ResponseInterceptor = (
  response: AxiosResponse,
) => AxiosResponse | Promise<AxiosResponse>;

enum RequestHeaders {
  HeaderDeviceID = 'X-Device-Id',
}

class RxjsAxios implements RxjsAxiosAPI {
  private _axiosInstance: AxiosInstance;
  private deviceID?: string | null = null;
  private _refreshTokenInProgress = false;

  constructor(private readonly options: RxjsAxiosOptions = { timeout: 2500 }) {
    this._axiosInstance = axios.create({
      ...options,
    });
    this.initGrafanaDeviceID().then();
    this._addRequestInterceptor(options?.requestInterceptor);
    this._addResponseInterceptor(options?.responseInterceptor);
  }

  private async initGrafanaDeviceID() {
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      this.deviceID = result.visitorId;
    } catch (error) {
      console.error(error);
    }
  }

  private _addRequestInterceptor(interceptor?: RequestInterceptor) {
    this._axiosInstance.interceptors.request.use(
      (config) => {
        if (this.deviceID) {
          config.headers.set(RequestHeaders.HeaderDeviceID, this.deviceID);
        }

        const _config = interceptor ? interceptor(config) : config;
        return _config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  private _addResponseInterceptor(interceptor?: ResponseInterceptor) {
    this._axiosInstance.interceptors.response.use(
      (value) => {
        return interceptor ? interceptor(value) : value;
      },
      (error) => {
        if (isCancel(error)) {
          console.log('Request canceled', error.message);
        } else {
          if (isAxiosError(error)) {
            console.log('AxiosError', error?.message);
          }

          return Promise.reject(AxiosError.from(error));
        }
      },
    );
    return this;
  }

  request<T = any>(config: AxiosRequestConfig): Observable<AxiosResponse<T>>;
  request<T = any>(
    config: AxiosRequestConfig,
    options: { getResponse: true },
  ): Observable<T>;
  request<T = any>(
    config: AxiosRequestConfig,
    options?: { getResponse: true },
  ): Observable<AxiosResponse<T> | T> {
    return this._request(config, options).pipe(
      retry(this.options.retry || { count: 0 }),
      tap((response) => {
        if (
          this.options.showRefreshToken &&
          this.options.showRefreshToken(response)
        ) {
          console.log('Refresh token');
          this._refreshTokenInProgress = true;
        }
      }),
      map((response) =>
        options?.getResponse === true ? response : response.data,
      ),
      catchError((err) => {
        throw AxiosError.from(err);
      }),
    );
  }

  private _request<T = any>(
    config: AxiosRequestConfig,
    options?: { getResponse: true },
  ): Observable<AxiosResponse<T> | T> {
    return new Observable<AxiosResponse<T> | T>((subscriber) => {
      const controller = new AbortController();
      const { signal } = controller;
      let abortable = true;

      const { signal: outerSignal } = config;
      if (outerSignal) {
        if (outerSignal.aborted) {
          controller.abort();
        } else {
          const outerSignalHandler = () => {
            if (!signal.aborted) {
              controller.abort();
            }
          };

          //@ts-ignore
          outerSignal.addEventListener('abort', outerSignalHandler);

          subscriber.add(() => {
            //@ts-ignore
            outerSignal.removeEventListener('abort', outerSignalHandler);
          });
        }
      } else {
        config.signal = signal;
      }

      const handleError = (err: any) => {
        abortable = false;
        subscriber.error(AxiosError.from(err));
      };

      this._axiosInstance
        .request<T>({ signal: signal, ...config })
        .then((response) => {
          abortable = false;
          subscriber.next(response);
          subscriber.complete();
        })
        .catch((err) => handleError(err));
      return () => {
        if (abortable) {
          controller.abort();
        }
      };
    });
  }

  get<T = any>(url: string, config?: RxjsAxiosRequestConfig): Observable<T>;
  get<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig & { getResponse: true },
  ): Observable<AxiosResponse<T>>;
  get<T = any>(
    url: string,
    config?:
      | RxjsAxiosRequestConfig
      | (RxjsAxiosRequestConfig & { getResponse: true }),
  ): Observable<AxiosResponse<T> | T> {
    const _config = config || {};
    return this.request<T>({ ..._config, url, method: 'GET' });
  }

  delete<T = any>(url: string, config?: RxjsAxiosRequestConfig): Observable<T>;
  delete<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig & { getResponse: true },
  ): Observable<AxiosResponse<T>>;
  delete<T = any>(
    url: string,
    config?:
      | RxjsAxiosRequestConfig
      | (RxjsAxiosRequestConfig & { getResponse: true }),
  ): Observable<AxiosResponse<T> | T> {
    const _config = config || {};
    return this.request<T>({ ..._config, url, method: 'DELETE' });
  }

  getUri(config?: RxjsAxiosRequestConfig): string {
    return this._axiosInstance.getUri(config);
  }

  head<T = any>(url: string, config?: RxjsAxiosRequestConfig): Observable<T>;
  head<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig & { getResponse: true },
  ): Observable<AxiosResponse<T>>;
  head<T = any>(
    url: string,
    config?:
      | RxjsAxiosRequestConfig
      | (RxjsAxiosRequestConfig & { getResponse: true }),
  ): Observable<AxiosResponse<T> | T> {
    const _config = config || {};
    return this.request<T>({ ..._config, url, method: 'HEAD' });
  }

  patch<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig,
  ): Observable<T>;
  patch<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig & {
      getResponse: true;
    },
  ): Observable<AxiosResponse<T>>;
  patch<T = any>(
    url: string,
    data?: any,
    config?:
      | RxjsAxiosRequestConfig
      | (RxjsAxiosRequestConfig & {
          getResponse: true;
        }),
  ): Observable<AxiosResponse<T> | T> {
    const _config = config || {};
    return this.request<T>({ ..._config, url, method: 'PATCH', data });
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig,
  ): Observable<T>;
  post<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig & {
      getResponse: true;
    },
  ): Observable<AxiosResponse<T>>;
  post<T = any>(
    url: string,
    data?: any,
    config?:
      | RxjsAxiosRequestConfig
      | (RxjsAxiosRequestConfig & {
          getResponse: true;
        }),
  ): Observable<AxiosResponse<T> | T> {
    const _config = config || {};
    return this.request<T>({ ..._config, url, method: 'POST', data });
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig,
  ): Observable<T>;
  put<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig & {
      getResponse: true;
    },
  ): Observable<AxiosResponse<T>>;
  put<T = any>(
    url: string,
    data?: any,
    config?:
      | RxjsAxiosRequestConfig
      | (RxjsAxiosRequestConfig & {
          getResponse: true;
        }),
  ): Observable<AxiosResponse<T> | T> {
    const _config = config || {};
    return this.request<T>({ ..._config, url, method: 'PUT', data });
  }
}

export { RxjsAxios };
