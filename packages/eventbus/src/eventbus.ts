import type { Func } from '@aesoper/shared';
import mitt, { type EventType, type Handler } from 'mitt';

import type { EventBus } from './interface';

const emitter = mitt();

export const useEventBus = (): EventBus => {
  const on = (event: EventType, handler: Handler): Func => {
    emitter.on(event, handler);

    return () => {
      off(event, handler);
    };
  };

  const once = (event: EventType, handler: Handler): Func => {
    const _handler = (evt: unknown): void => {
      off(event, _handler);
      handler(evt);
    };
    return on(event, _handler);
  };

  const off = (event: EventType, handler: Handler): void => {
    emitter.off(event, handler);
  };

  const emit = (event: EventType, evtData: unknown): void => {
    emitter.emit(event, evtData);
  };

  const clear = (): void => {
    emitter.all.clear();
  };

  return {
    on,
    once,
    off,
    emit,
    clear,
  };
};
