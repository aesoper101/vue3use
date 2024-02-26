import type { IDisposable } from './interface';

export class RefCountedDisposable {
  private _counter: number = 1;

  constructor(private readonly _disposable: IDisposable) {}

  acquire() {
    this._counter++;
    return this;
  }

  release() {
    if (--this._counter === 0) {
      this._disposable.dispose();
    }
    return this;
  }
}

export interface IReference<T> extends IDisposable {
  readonly object: T;
}

export abstract class ReferenceCollection<T> {
  private readonly references: Map<
    string,
    { readonly object: T; counter: number }
  > = new Map();

  acquire(key: string, ...args: any[]): IReference<T> {
    let reference = this.references.get(key);

    if (!reference) {
      reference = {
        counter: 0,
        object: this.createReferencedObject(key, ...args),
      };
      this.references.set(key, reference);
    }

    const { object } = reference;
    const dispose = createSingleCallFunction(() => {
      if (--reference!.counter === 0) {
        this.destroyReferencedObject(key, reference!.object);
        this.references.delete(key);
      }
    });

    reference.counter++;

    return { object, dispose };
  }

  protected abstract createReferencedObject(key: string, ...args: any[]): T;
  protected abstract destroyReferencedObject(key: string, object: T): void;
}

/**
 * Unwraps a reference collection of promised values. Makes sure
 * references are disposed whenever promises get rejected.
 */
export class AsyncReferenceCollection<T> {
  constructor(private referenceCollection: ReferenceCollection<Promise<T>>) {}

  async acquire(key: string, ...args: any[]): Promise<IReference<T>> {
    const ref = this.referenceCollection.acquire(key, ...args);

    try {
      const object = await ref.object;

      return {
        object,
        dispose: () => ref.dispose(),
      };
    } catch (error) {
      ref.dispose();
      throw error;
    }
  }
}

export class ImmortalReference<T> implements IReference<T> {
  constructor(public object: T) {}
  dispose(): void {
    /* noop */
  }
}
