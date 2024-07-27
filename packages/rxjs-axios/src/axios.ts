import axios, {
  AxiosError,
  AxiosHeaders,
  isAxiosError,
  isCancel,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import qs from 'qs';
import { lastValueFrom, type Observable } from 'rxjs';
import { ref } from 'vue';
import {
  type RequestInterceptor,
  type ResponseInterceptor,
  type RxjsAxiosAPI,
  type RxjsAxiosOptions,
  type RxjsAxiosRequestConfig,
  type RxjsReactiveResponse,
} from './interface';

export class HttpClient implements RxjsAxiosAPI {
  private readonly _axiosInstance: AxiosInstance;
  private fetchMap: Map<string, RxjsAxiosRequestConfig> = new Map();

  constructor(private readonly _options: RxjsAxiosOptions = { timeout: 2500 }) {
    this._axiosInstance = axios.create({
      ..._options,
    });
    this._options?.requestInterceptors.forEach((interceptor) => {
      this._addRequestInterceptor(interceptor);
    });

    this._options?.responseInterceptors.forEach((interceptor) => {
      this._addResponseInterceptor(interceptor);
    });
    this.setRefreshTokenInterceptor();
  }

  static create(options: RxjsAxiosOptions = { timeout: 2500 }): RxjsAxiosAPI {
    return new HttpClient(options);
  }

  private setRefreshTokenInterceptor() {
    if (this._options?.refreshAccessToken) {
      createAuthRefreshInterceptor(
        this._axiosInstance,
        (response: AxiosResponse): Promise<any> => {
          return new Promise((resolve, reject) => {
            //@ts-ignore
            const refreshRequest = this._options.refreshAccessToken(response);
            lastValueFrom(refreshRequest)
              .then((res) => {
                resolve(res);
              })
              .catch((err) => {
                reject(err);
              });
          });
        },
        this._options,
      );
    }
  }

  /**
   * 添加请求拦截器,注意是先进后出
   * @private
   */
  private _addRequestInterceptor(interceptor?: RequestInterceptor) {
    this._axiosInstance.interceptors.request.use(
      (config) => {
        this.removePendingRequest(config);
        this.addPendingRequest(config);

        return interceptor && interceptor.onFulfilled
          ? interceptor.onFulfilled(config)
          : config;
      },
      (error) => {
        return interceptor && interceptor.onRejected
          ? interceptor.onRejected(error)
          : Promise.reject(AxiosError.from(error));
      },
    );
  }

  /**
   * 添加响应拦截器,注意是先进先出
   * @param interceptor
   * @private
   */
  private _addResponseInterceptor(interceptor?: ResponseInterceptor) {
    this._axiosInstance.interceptors.response.use(
      (value) => {
        this.removePendingRequest(value.config);
        return interceptor && interceptor.onFulfilled
          ? interceptor.onFulfilled(value)
          : value;
      },
      (error) => {
        this.removePendingRequest(error.config || {});
        if (isCancel(error)) {
          console.log('Request canceled', error.message);
        } else {
          if (isAxiosError(error)) {
            console.log('AxiosError', error?.message);
          }

          return interceptor && interceptor.onRejected
            ? interceptor.onRejected(error)
            : Promise.reject(AxiosError.from(error));
        }
      },
    );
    return this;
  }

  private generateKey(config: AxiosRequestConfig): string {
    const { method, url, data = {}, params = {} } = config;
    return [method, url, qs.stringify(data), qs.stringify(params)].join('&');
  }

  private removePendingRequest(config: AxiosRequestConfig) {
    const key = this.generateKey(config);
    if (this.fetchMap.has(key)) {
      const _abort = this.fetchMap.get(key)?._abort;
      _abort && _abort();
      this.fetchMap.delete(key);
    }
  }

  private addPendingRequest(config: AxiosRequestConfig) {
    const key = this.generateKey(config);
    this.fetchMap.set(key, config);
  }

  private _request<T = any>(
    config: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return new Observable<AxiosResponse<T>>((subscriber) => {
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

      config._abort = () => {
        if (!config.signal?.aborted) {
          controller.abort();
        }
      };

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

  private _reactiveRequest<T = any>(
    config: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T> {
    const _config = config || {};
    return this.transformResponseReactive<T>(() => this._request(_config));
  }

  request<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;
  request<T = any>(
    config: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;
  request<T = any>(
    url: string | RxjsAxiosRequestConfig,
    config?: RxjsAxiosRequestConfig,
  ): any {
    if (typeof url === 'string') {
      const _config = config || {};
      return this._reactiveRequest<T>({
        ..._config,
        url: url,
      });
    }

    return this._request<T>(url);
  }

  delete<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;
  delete<T = any>(config: RxjsAxiosRequestConfig): Observable<AxiosResponse<T>>;
  delete<T = any>(
    url: string | RxjsAxiosRequestConfig,
    config?: RxjsAxiosRequestConfig,
  ): any {
    if (typeof url === 'string') {
      const _config = config || {};
      return this._reactiveRequest<T>({
        ..._config,
        method: 'delete',
        url: url,
      });
    }
    return this._request<T>({
      ...url,
      method: 'delete',
    });
  }

  get<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;
  get<T = any>(config: RxjsAxiosRequestConfig): Observable<AxiosResponse<T>>;
  get<T = any>(
    url: string | RxjsAxiosRequestConfig,
    config?: RxjsAxiosRequestConfig,
  ): any {
    if (typeof url === 'string') {
      return this._reactiveRequest<T>(url, config);
    }
    return this._request<T>(url);
  }

  getUri(config?: RxjsAxiosRequestConfig): string {
    return this._axiosInstance.getUri(config);
  }

  head<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;
  head<T = any>(config: RxjsAxiosRequestConfig): Observable<AxiosResponse<T>>;
  head<T = any>(
    url: string | RxjsAxiosRequestConfig,
    config?: RxjsAxiosRequestConfig,
  ): any {
    if (typeof url === 'string') {
      const _config = config || {};
      return this._reactiveRequest<T>({
        ..._config,
        method: 'head',
        url: url,
      });
    }
    return this._request<T>({
      ...url,
      method: 'head',
    });
  }

  patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;
  patch<T = any>(config: RxjsAxiosRequestConfig): Observable<AxiosResponse<T>>;
  patch<T = any, D = any>(
    url: string | RxjsAxiosRequestConfig,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): any {
    if (typeof url === 'string') {
      const _config = config || {};
      return this._reactiveRequest<T>({
        ..._config,
        method: 'patch',
        url: url,
        data: data,
      });
    }
    return this._request<T>({
      ...url,
      method: 'patch',
    });
  }

  post<T = any, D = any>(
    url: string,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;
  post<T = any>(config: RxjsAxiosRequestConfig): Observable<AxiosResponse<T>>;
  post<T = any, D = any>(
    url: string | RxjsAxiosRequestConfig,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): any {
    if (typeof url === 'string') {
      const _config = config || {};
      return this._reactiveRequest<T>({
        ..._config,
        method: 'post',
        url: url,
        data: data,
      });
    }
    return this._request<T>({
      ...url,
      method: 'post',
    });
  }

  put<T = any, D = any>(
    url: string,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;
  put<T = any>(config: RxjsAxiosRequestConfig): Observable<AxiosResponse<T>>;
  put<T = any, D = any>(
    url: string | RxjsAxiosRequestConfig,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): any {
    if (typeof url === 'string') {
      const _config = config || {};
      return this._reactiveRequest<T>({
        ..._config,
        method: 'put',
        url: url,
        data: data,
      });
    }
    return this._request<T>({
      ...url,
      method: 'put',
    });
  }

  patchForm<T = any, D = any>(
    url: string,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;
  patchForm<T = any>(
    config: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;
  patchForm<T = any, D = any>(
    url: string | RxjsAxiosRequestConfig,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): any {
    if (typeof url === 'string') {
      const _config = config || {};
      const headers = AxiosHeaders.from(_config.headers || {});
      headers.set('Content-Type', 'multipart/form-data', true);
      return this._reactiveRequest<T>({
        ..._config,
        method: 'patch',
        url: url,
        data: data,
        headers: headers,
      });
    }

    const headers = AxiosHeaders.from(url?.headers || {});
    headers.set('Content-Type', 'multipart/form-data', true);
    return this._request<T>({
      ...url,
      method: 'patch',
      headers: headers,
    });
  }

  postForm<T = any, D = any>(
    url: string,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;
  postForm<T = any>(
    config: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;
  postForm<T = any, D = any>(
    url: string | RxjsAxiosRequestConfig,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): any {
    if (typeof url === 'string') {
      const _config = config || {};
      const headers = _config.headers || {};
      headers['Content-Type'] = 'multipart/form-data';
      return this._reactiveRequest<T>({
        ..._config,
        method: 'post',
        url: url,
        data: data,
        headers: headers,
      });
    }

    const headers = AxiosHeaders.from(url?.headers || {});
    headers.set('Content-Type', 'multipart/form-data', true);
    return this._request<T>({
      ...url,
      method: 'post',
      headers: headers,
    });
  }

  putForm<T = any, D = any>(
    url: string,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;
  putForm<T = any>(
    config: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;
  putForm<T = any, D = any>(
    url: string | RxjsAxiosRequestConfig,
    data?: D,
    config?: RxjsAxiosRequestConfig,
  ): any {
    if (typeof url === 'string') {
      const _config = config || {};
      const headers = AxiosHeaders.from(_config.headers || {});
      headers.set('Content-Type', 'multipart/form-data', true);
      return this._reactiveRequest<T>({
        ..._config,
        method: 'put',
        url: url,
        data: data,
        headers: headers,
      });
    }

    const headers = AxiosHeaders.from(url?.headers || {});
    headers.set('Content-Type', 'multipart/form-data', true);
    return this._request<T>({
      ...url,
      method: 'put',
      headers: headers,
    });
  }

  options<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): RxjsReactiveResponse<T>;
  options<T = any>(
    config?: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>>;
  options<T = any>(
    url?: string | RxjsAxiosRequestConfig,
    config?: RxjsAxiosRequestConfig,
  ): any {
    if (typeof url === 'string') {
      return this._reactiveRequest<T>({
        ...config,
        method: 'options',
        url: url,
      });
    }
    return this._request<T>({
      ...url,
      method: 'options',
    });
  }

  private transformResponseReactive<T = any>(
    response$: () => Observable<AxiosResponse<T>>,
  ): RxjsReactiveResponse<T> {
    const isLoading = ref(false);
    const error = ref<Error>();
    const data = ref<T>();
    const isFinished = ref(false);
    const response = ref<AxiosResponse<T>>();
    const isAborted = ref(false);

    const subscriber = response$().subscribe({
      next: (res) => {
        response.value = res;
        data.value = res.data;
        isFinished.value = true;
      },
      error: (err) => {
        error.value = err;
        isFinished.value = true;
      },
      complete: () => {
        isFinished.value = true;
      },
    });

    const abort = () => {
      if (subscriber.closed) {
        return;
      }
      isAborted.value = true;
      subscriber.unsubscribe();
    };

    return {
      isLoading,
      error,
      data,
      isFinished,
      response,
      isAborted,
      abort,
    };
  }
}
