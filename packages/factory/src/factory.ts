export type FactoryFunction<Instance = any, Args extends any[] = any[]> = (
  ...args: Args
) => Instance;

const factoryMap = new Map<string, FactoryFunction>();
const factoryInstanceMap = new Map<string, any>();

export interface defineFactoryOptions {
  singleton?: boolean;
  override?: boolean;
  scope?: string;
}

export function defineFactory<Instance = any, Args extends any[] = any[]>(
  name: string,
  constructor: FactoryFunction<Instance, Args>,
  options?: defineFactoryOptions,
): void {
  const oldName = name;
  name = options?.scope ? `${options.scope}/${name}` : name;
  if (factoryMap.has(name) && !options?.override) {
    throw new Error(
      `Factory ${options?.scope ? name : oldName} already exists`,
    );
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

export function hasFactory(name: string, scope?: string): boolean {
  name = scope ? `${scope}/${name}` : name;
  return factoryMap.has(name);
}

export function createInstance<Instance = any, Args extends any[] = any[]>(
  name: string,
  scope?: string,
  ...args: Args
): Instance {
  name = scope ? `${scope}/${name}` : name;
  const constructor = factoryMap.get(name);
  if (!constructor) {
    throw new Error(`Factory ${name} does not exist`);
  }

  return constructor(...args);
}
