import EventEmitter from 'eventemitter3';
import { Observable, Subscriber, type Unsubscribable } from 'rxjs';
import { filter } from 'rxjs/operators';

import type {
  BusEvent,
  BusEventHandler,
  BusEventType,
  EventFilterOptions,
  IEventBus,
  IScopedEventBus,
} from './interface';

export class EventBus implements IEventBus, IScopedEventBus {
  private emitter: EventEmitter;
  private subscribers = new Map<Function, Subscriber<BusEvent>>();

  constructor() {
    this.emitter = new EventEmitter();
  }

  publish<T extends BusEvent>(event: T): void {
    this.emitter.emit(event.type, event);
  }

  subscribe<T extends BusEvent>(
    typeFilter: BusEventType<T>,
    handler: BusEventHandler<T>,
  ): Unsubscribable {
    return this.getStream(typeFilter).subscribe({ next: handler });
  }

  getStream<T extends BusEvent = BusEvent>(
    eventType: BusEventType<T>,
  ): Observable<T> {
    return new Observable<T>((observer) => {
      const handler = (event: T) => {
        observer.next(event);
      };

      this.emitter.on(eventType.type, handler);
      this.subscribers.set(handler, observer);

      return () => {
        this.emitter.off(eventType.type, handler);
        this.subscribers.delete(handler);
      };
    });
  }

  newScopedBus(key: string, filter?: EventFilterOptions): ScopedEventBus {
    return new ScopedEventBus([key], this, filter);
  }

  removeAllListeners() {
    this.emitter.removeAllListeners();
    for (const [key, sub] of this.subscribers) {
      sub.complete();
      this.subscribers.delete(key);
    }
  }
}

class ScopedEventBus implements IEventBus, IScopedEventBus {
  // will be mutated by panel runners
  filterConfig: EventFilterOptions;

  constructor(
    public path: string[],
    private eventBus: IEventBus,
    filter?: EventFilterOptions,
  ) {
    this.filterConfig = filter ?? { onlyLocal: false };
  }

  publish<T extends BusEvent>(event: T): void {
    if (!event.origin) {
      event.origin = this;
    }
    this.eventBus.publish(event);
  }

  filter<T extends BusEvent>(event: T) {
    if (this.filterConfig.onlyLocal) {
      return event.origin === this;
    }
    return true;
  }

  getStream<T extends BusEvent>(eventType: BusEventType<T>): Observable<T> {
    return this.eventBus
      .getStream(eventType)
      .pipe(filter(this.filter.bind(this)));
  }

  // syntax sugar
  subscribe<T extends BusEvent>(
    typeFilter: BusEventType<T>,
    handler: BusEventHandler<T>,
  ): Unsubscribable {
    return this.getStream(typeFilter).subscribe({ next: handler });
  }

  removeAllListeners(): void {
    this.eventBus.removeAllListeners();
  }

  /**
   * Creates a nested event bus structure
   */
  newScopedBus(key: string, filter: EventFilterOptions): IEventBus {
    return new ScopedEventBus([...this.path, key], this, filter);
  }
}
