import type { Func } from '@aesoper/shared';
import type { EventType, Handler } from 'mitt';

export interface EventBus {
  on(eventType: EventType, handler: Handler): Func;
  once(eventType: EventType, handler: Handler): Func;
  off(eventType: EventType, handler: Handler): void;
  emit(eventType: EventType, evtData: unknown): void;
  clear(): void;
}
