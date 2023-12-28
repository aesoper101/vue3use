export type FactoryFunction<Args extends any[] = any[], Instance = any> = (
  ...args: Args
) => Instance;

const factoryMap = new Map<string, FactoryFunction>();
const factoryInstanceMap = new Map<string, any>();

export interface defineFactoryOptions {
  singleton?: boolean;
  override?: boolean;
}

export function defineFactory<Args extends any[] = any[], Instance = any>(
  name: string,
  constructor: FactoryFunction<Args, Instance>,
  options?: defineFactoryOptions,
): void {
  if (factoryMap.has(name) && !options?.override) {
    throw new Error(`Factory ${name} already exists`);
  }

  factoryMap.set(name, (...args: Args) => {
    if (options?.singleton) {
      if (!factoryInstanceMap.has(name)) {
        factoryInstanceMap.set(name, constructor(...args));
      }
      return factoryInstanceMap.get(name);
    }
    return constructor(...args);
  });
}

export function createInstance<Args extends any[] = any[], Instance = any>(
  name: string,
  ...args: Args
): Instance {
  const constructor = factoryMap.get(name);
  if (!constructor) {
    throw new Error(`Factory ${name} does not exist`);
  }

  return constructor(...args);
}
