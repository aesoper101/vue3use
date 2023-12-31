export function makeClassES5Compatible<
  T extends abstract new (...args: ConstructorParameters<T>) => InstanceType<T>,
>(ES6Class: T): T {
  return new Proxy(ES6Class, {
    // ES5 code will call it like a function using super
    apply(target, self, argumentsList) {
      if (typeof Reflect === 'undefined' || !Reflect.construct) {
        console.log('Browser is too old');
      }

      return Reflect.construct(target, argumentsList, self.constructor);
    },
  });
}
