import { SortOrder } from '../types';

export function toArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

/**
 * Move item in array immutably, will not change the original array
 * 移除数组中的某个元素，并将其插入到另一个位置,不会改变原数组
 *
 * @param arr
 * @param from
 * @param to
 */
export function moveItemImmutably<T>(arr: T[], from: number, to: number) {
  const clone = [...arr];
  Array.prototype.splice.call(
    clone,
    to,
    0,
    Array.prototype.splice.call(clone, from, 1)[0],
  );
  return clone;
}

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});
const numericCompare = (a: number, b: number) => a - b;

export function sortValues(sort: SortOrder.Ascending | SortOrder.Descending) {
  return (a: unknown, b: unknown) => {
    if (a === b) {
      return 0;
    }

    if (b == null || (typeof b === 'string' && b.trim() === '')) {
      return -1;
    }
    if (a == null || (typeof a === 'string' && a?.trim() === '')) {
      return 1;
    }

    let compareFn: (a: any, b: any) => number = collator.compare;

    if (typeof a === 'number' && typeof b === 'number') {
      compareFn = numericCompare;
    }

    if (sort === SortOrder.Descending) {
      return compareFn(b, a);
    }

    return compareFn(a, b);
  };
}

export function sortArray<T>(
  arr: T[],
  sort: SortOrder.Ascending | SortOrder.Descending,
): T[] {
  return arr.slice().sort(sortValues(sort));
}
