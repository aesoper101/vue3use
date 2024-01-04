/**
 * Round half away from zero ('commercial' rounding)
 * Uses correction to offset floating-point inaccuracies.
 * Works symmetrically for positive and negative numbers.
 *
 * 从零四舍五入一半（“商业”四舍五入）
 * 使用校正来抵消浮点不准确。
 * 对正数和负数对称工作。
 *
 * ref: https://stackoverflow.com/a/48764436
 */
export function roundDecimals(val: number, dec = 0) {
  if (Number.isInteger(val)) {
    return val;
  }

  const p = 10 ** dec;
  const n = val * p * (1 + Number.EPSILON);
  return Math.round(n) / p;
}

export function guessDecimals(num: number) {
  return (('' + num).split('.')[1] || '').length;
}
