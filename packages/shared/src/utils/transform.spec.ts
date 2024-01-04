import { describe, expect, it } from 'vitest';

import { transformFunction } from './transform';

describe('transformFunction', () => {
  it('should return data when filters is empty', () => {
    const context = { a: 1 };
    const code = `return context.a`;

    expect(transformFunction(code, 'context')(context)).toEqual(1);
  });
});
