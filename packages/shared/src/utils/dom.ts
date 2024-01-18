import { isBoolean } from './is';

export const stopPropagation = (event: Event) => event.stopPropagation();

export function preventDefault(event: Event, isStopPropagation?: boolean) {
  /* istanbul ignore else */
  if (!isBoolean(event.cancelable) || event.cancelable) {
    event.preventDefault();
  }

  if (isStopPropagation) {
    stopPropagation(event);
  }
}
