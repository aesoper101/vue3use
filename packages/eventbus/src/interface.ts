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

export abstract class BusEventWithPayload<T> extends BusEventBase {
  readonly payload: T;

  constructor(payload: T) {
    super();
    this.payload = payload;
  }
}

/**
 * @public
 */
export interface AppEvent<T> {
  readonly name: string;
  payload?: T;
}

/** @public */
export interface LegacyEventHandler<T> {
  (payload: T): void;

  wrapper?: (event: BusEvent) => void;
}

/** @public */
export interface LegacyEmitter {
  emit<T>(event: AppEvent<T> | string, payload?: T): void;

  on<T>(event: AppEvent<T> | string, handler: LegacyEventHandler<T>): void;

  off<T>(
    event: AppEvent<T> | string,
    handler: (payload?: T | any) => void,
  ): void;
}
