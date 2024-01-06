import { Observable, type Unsubscribable } from 'rxjs';

/**
 *
 * @internal
 */
export interface BusEvent {
  readonly type: string;
  readonly payload?: any;
  origin?: IEventBus;
}

export abstract class BusEventBase implements BusEvent {
  readonly type: string;
  readonly payload?: any;
  readonly origin?: IEventBus;

  constructor() {
    //@ts-ignore
    this.type = this.__proto__.constructor.type;
  }
}

export interface BusEventType<T extends BusEvent> {
  type: string;
  new (...args: any[]): T;
}

export interface BusEventHandler<T extends BusEvent> {
  (event: T): void;
}

export interface EventFilterOptions {
  onlyLocal: boolean;
}

export interface IEventBus {
  /**
   * Publish single event
   */
  publish<T extends BusEvent>(event: T): void;

  /**
   * Get observable of events
   */
  getStream<T extends BusEvent>(eventType: BusEventType<T>): Observable<T>;

  /**
   * Subscribe to an event stream
   *
   * This function is a wrapper around the `getStream(...)` function
   */
  subscribe<T extends BusEvent>(
    eventType: BusEventType<T>,
    handler: BusEventHandler<T>,
  ): Unsubscribable;

  /**
   * Remove all event subscriptions
   */
  removeAllListeners(): void;
}

export interface IScopedEventBus {
  newScopedBus(key: string, filter: EventFilterOptions): IEventBus;
}
