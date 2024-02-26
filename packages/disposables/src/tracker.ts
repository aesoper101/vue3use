import { SetMap } from '@aesoper/shared';

import type {
  DisposableInfo,
  IDisposable,
  IDisposableTracker,
} from './interface';

export type CompareResult = number;

type Comparator<T> = (a: T, b: T) => CompareResult;

function compareBy<TItem, TCompareBy>(
  selector: (item: TItem) => TCompareBy,
  comparator: Comparator<TCompareBy>,
): Comparator<TItem> {
  return (a, b) => comparator(selector(a), selector(b));
}

const numberComparator: Comparator<number> = (a, b) => a - b;

/**
 * Groups the collection into a dictionary based on the provided
 * group function.
 */
function groupBy<K extends string | number | symbol, V>(
  data: V[],
  groupFn: (element: V) => K,
): Record<K, V[]> {
  const result: Record<K, V[]> = Object.create(null);
  for (const element of data) {
    const key = groupFn(element);
    let target = result[key];
    if (!target) {
      target = result[key] = [];
    }
    target.push(element);
  }
  return result;
}

export class DisposableTracker implements IDisposableTracker {
  private static idx = 0;

  private readonly livingDisposables = new Map<IDisposable, DisposableInfo>();

  private getDisposableData(d: IDisposable): DisposableInfo {
    let val = this.livingDisposables.get(d);
    if (!val) {
      val = {
        parent: null,
        source: null,
        isSingleton: false,
        value: d,
        idx: DisposableTracker.idx++,
      };
      this.livingDisposables.set(d, val);
    }
    return val;
  }

  trackDisposable(d: IDisposable): void {
    const data = this.getDisposableData(d);
    if (!data.source) {
      data.source = new Error().stack!;
    }
  }

  setParent(child: IDisposable, parent: IDisposable | null): void {
    const data = this.getDisposableData(child);
    data.parent = parent;
  }

  markAsDisposed(x: IDisposable): void {
    this.livingDisposables.delete(x);
  }

  markAsSingleton(disposable: IDisposable): void {
    this.getDisposableData(disposable).isSingleton = true;
  }

  private getRootParent(
    data: DisposableInfo,
    cache: Map<DisposableInfo, DisposableInfo>,
  ): DisposableInfo {
    const cacheValue = cache.get(data);
    if (cacheValue) {
      return cacheValue;
    }

    const result = data.parent
      ? this.getRootParent(this.getDisposableData(data.parent), cache)
      : data;
    cache.set(data, result);
    return result;
  }

  getTrackedDisposables(): IDisposable[] {
    const rootParentCache = new Map<DisposableInfo, DisposableInfo>();

    const leaking = [...this.livingDisposables.entries()]
      .filter(
        ([, v]) =>
          v.source !== null &&
          !this.getRootParent(v, rootParentCache).isSingleton,
      )
      .flatMap(([k]) => k);

    return leaking;
  }

  computeLeakingDisposables(
    maxReported = 10,
    preComputedLeaks?: DisposableInfo[],
  ): { leaks: DisposableInfo[]; details: string } | undefined {
    let uncoveredLeakingObjs: DisposableInfo[] | undefined;
    if (preComputedLeaks) {
      uncoveredLeakingObjs = preComputedLeaks;
    } else {
      const rootParentCache = new Map<DisposableInfo, DisposableInfo>();

      const leakingObjects = [...this.livingDisposables.values()].filter(
        (info) =>
          info.source !== null &&
          !this.getRootParent(info, rootParentCache).isSingleton,
      );

      if (leakingObjects.length === 0) {
        return;
      }
      const leakingObjsSet = new Set(leakingObjects.map((o) => o.value));

      // Remove all objects that are a child of other leaking objects. Assumes there are no cycles.
      uncoveredLeakingObjs = leakingObjects.filter((l) => {
        return !(l.parent && leakingObjsSet.has(l.parent));
      });

      if (uncoveredLeakingObjs.length === 0) {
        throw new Error('There are cyclic diposable chains!');
      }
    }

    if (!uncoveredLeakingObjs) {
      return undefined;
    }

    function getStackTracePath(leaking: DisposableInfo): string[] {
      function removePrefix(
        array: string[],
        linesToRemove: (string | RegExp)[],
      ) {
        while (
          array.length > 0 &&
          linesToRemove.some((regexp) =>
            typeof regexp === 'string'
              ? regexp === array[0]
              : array[0].match(regexp),
          )
        ) {
          array.shift();
        }
      }

      const lines = leaking
        .source!.split('\n')
        .map((p) => p.trim().replace('at ', ''))
        .filter((l) => l !== '');
      removePrefix(lines, [
        'Error',
        /^trackDisposable \(.*\)$/,
        /^DisposableTracker.trackDisposable \(.*\)$/,
      ]);
      return lines.reverse();
    }

    const stackTraceStarts = new SetMap<string, DisposableInfo>();
    for (const leaking of uncoveredLeakingObjs) {
      const stackTracePath = getStackTracePath(leaking);
      for (let i = 0; i <= stackTracePath.length; i++) {
        stackTraceStarts.add(stackTracePath.slice(0, i).join('\n'), leaking);
      }
    }

    // Put earlier leaks first
    uncoveredLeakingObjs.sort(compareBy((l) => l.idx, numberComparator));

    let message = '';

    let i = 0;
    for (const leaking of uncoveredLeakingObjs.slice(0, maxReported)) {
      i++;
      const stackTracePath = getStackTracePath(leaking);
      const stackTraceFormattedLines = [];

      for (let i = 0; i < stackTracePath.length; i++) {
        let line = stackTracePath[i];
        const starts = stackTraceStarts.get(
          stackTracePath.slice(0, i + 1).join('\n'),
        );
        line = `(shared with ${starts.size}/${uncoveredLeakingObjs.length} leaks) at ${line}`;

        const prevStarts = stackTraceStarts.get(
          stackTracePath.slice(0, i).join('\n'),
        );
        const continuations = groupBy(
          [...prevStarts].map((d) => getStackTracePath(d)[i]),
          (v) => v,
        );
        delete continuations[stackTracePath[i]];
        for (const [cont, set] of Object.entries(continuations)) {
          stackTraceFormattedLines.unshift(
            `    - stacktraces of ${set.length} other leaks continue with ${cont}`,
          );
        }

        stackTraceFormattedLines.unshift(line);
      }

      message += `\n\n\n==================== Leaking disposable ${i}/${uncoveredLeakingObjs.length}: ${leaking.value.constructor.name} ====================\n${stackTraceFormattedLines.join('\n')}\n============================================================\n\n`;
    }

    if (uncoveredLeakingObjs.length > maxReported) {
      message += `\n\n\n... and ${uncoveredLeakingObjs.length - maxReported} more leaking disposables\n\n`;
    }

    return { leaks: uncoveredLeakingObjs, details: message };
  }
}
