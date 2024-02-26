export class Lazy<T> {
  private _didRun: boolean = false;
  private _value?: T;
  private _error: Error | undefined;

  constructor(private readonly executor: () => T) {}

  /**
   * True if the lazy value has been resolved.
   *
   * 如果延迟值已解析，则为true。
   */
  get hasValue() {
    return this._didRun;
  }

  /**
   * Get the wrapped value.
   *
   * This will force evaluation of the lazy value if it has not been resolved yet. Lazy values are only
   * resolved once. `getValue` will re-throw exceptions that are hit while resolving the value
   *
   * 获取包装的值。
   *
   * 如果尚未解析延迟值，则这将强制评估延迟值。延迟值只解析一次。getValue将重新抛出在解析值时遇到的异常
   */
  get value(): T {
    if (!this._didRun) {
      try {
        this._value = this.executor();
      } catch (err) {
        this._error = err as Error;
      } finally {
        this._didRun = true;
      }
    }
    if (this._error) {
      throw this._error;
    }
    return this._value!;
  }

  /**
   * Get the wrapped value without forcing evaluation.
   */
  get rawValue(): T | undefined {
    return this._value;
  }
}
