import { describe, expect, it } from 'vitest';

import { createInstance, defineFactory } from '../factory';

describe('factory', () => {
  it('should be true', () => {
    defineFactory('test', () => true);
    const result = createInstance('test');
    expect(result).toBe(true);

    class TestClass {
      public name: string = 'test';
      public age: number = 10;

      constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
      }

      public getAge(): number {
        return this.age;
      }

      public setAge(age: number): void {
        this.age = age;
      }

      public getName(): string {
        return this.name;
      }

      public setName(name: string): void {
        this.name = name;
      }
    }

    defineFactory(
      'test2',
      (name: string, age: number) => new TestClass(name, age),
      { singleton: true },
    );
    const result2 = createInstance('test2', 'test', 10);
    expect(result2).toBeInstanceOf(TestClass);
    expect(result2.getName()).toBe('test');
    expect(result2.getAge()).toBe(10);

    result2.setName('test2');
    result2.setAge(11);

    const result3 = createInstance('test2');
    expect(result3).toBeInstanceOf(TestClass);
    expect(result3.getName()).toBe('test2');
    expect(result3.getAge()).toBe(11);

    defineFactory(
      'test3',
      (name: string, age: number) => new TestClass(name, age),
      { singleton: false },
    );

    const result4 = createInstance('test3', 'test', 10);
    expect(result4).toBeInstanceOf(TestClass);
    expect(result4.getName()).toBe('test');
    expect(result4.getAge()).toBe(10);

    result4.setName('test2');
    result4.setAge(11);

    const result5 = createInstance('test3', 'test', 10);
    expect(result5).toBeInstanceOf(TestClass);
    expect(result5.getName()).toBe('test');
    expect(result5.getAge()).toBe(10);
  });
});
