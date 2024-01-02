import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  isAxiosError,
  isCancel,
} from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import qs from 'qs';
import { Observable, lastValueFrom } from 'rxjs';

import { ref } from 'vue';

import type { RequestInterceptor, ResponseInterceptor } from './interface';
import {
  RequestHeaders,
  type RxjsAxiosAPI,
  type RxjsAxiosOptions,
  type RxjsAxiosRequestConfig,
  type RxjsReactiveResponse,
} from './interface';

axios.defaults.headers.common['Content-Type'] = 'application/json';

class HttpClient implements RxjsAxiosAPI {
  private _axiosInstance: AxiosInstance;
  private deviceID?: string | null = null;
  private fetchMap: Map<string, RxjsAxiosRequestConfig> = new Map();

  constructor(private readonly options: RxjsAxiosOptions = { timeout: 2500 }) {
    this._axiosInstance = axios.create({
      ...options,
    });
    this.initGrafanaDeviceID().then();
    this._addRequestInterceptor(this.options?.requestInterceptor);
    this._addResponseInterceptor(this.options?.responseInterceptor);
    this.setRefreshTokenInterceptor();
  }

  private setRefreshTokenInterceptor() {
    if (this.options?.refreshAccessToken) {
      createAuthRefreshInterceptor(
        this._axiosInstance,
        (response: AxiosResponse): Promise<any> => {
          return new Promise((resolve, reject) => {
            //@ts-ignore
            const refreshRequest = this.options.refreshAccessToken(response);
            lastValueFrom(refreshRequest)
              .then((res) => {
                resolve(res);
              })
              .catch((err) => {
                reject(err);
              });
          });
        },
        this.options,
      );
    }
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

  /**
   * 添加请求拦截器,注意是先进后出
   * @private
   */
  private _addRequestInterceptor(interceptor?: RequestInterceptor) {
    this._axiosInstance.interceptors.request.use(
      (config) => {
        if (this.deviceID) {
          config.headers.set(RequestHeaders.HeaderDeviceID, this.deviceID);
        }

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

  delete<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return this.request({ url, method: 'DELETE', ...config });
  }

  get<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return this.request({ url, method: 'GET', ...config });
  }

  getUri(config?: RxjsAxiosRequestConfig): string {
    return this._axiosInstance.getUri(config);
  }

  head<T = any>(
    url: string,
    config?: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return this.request({ url, method: 'HEAD', ...config });
  }

  patch<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return this.request({ url, data, method: 'PATCH', ...config });
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return this.request({ url, data, method: 'POST', ...config });
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return this.request({ url, data, method: 'PUT', ...config });
  }

  request<T = any>(
    config: RxjsAxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    return this._request(config);
  }

  transformResponseReactive<T = any>(
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

export { HttpClient };
