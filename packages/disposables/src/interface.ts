export interface IDisposable {
  dispose(): void;
}

export interface IDisposableTracker {
  /**
   * Is called on construction of a disposable.
   */
  trackDisposable(disposable: IDisposable): void;

  /**
   * Is called when a disposable is registered as child of another disposable (e.g. {@link DisposableStore}).
   * If parent is `null`, the disposable is removed from its former parent.
   */
  setParent(child: IDisposable, parent: IDisposable | null): void;

  /**
   * Is called after a disposable is disposed.
   */
  markAsDisposed(disposable: IDisposable): void;

  /**
   * Indicates that the given object is a singleton which does not need to be disposed.
   */
  markAsSingleton(disposable: IDisposable): void;
}

export interface DisposableInfo {
  value: IDisposable;
  source: string | null;
  parent: IDisposable | null;
  isSingleton: boolean;
  idx: number;
}
