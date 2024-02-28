import type { Plugin } from 'vite';

export default function ExternalPlugin(): Plugin {
  return {
    name: 'vite:external-node_modules',
    enforce: 'pre',
    async resolveId(source: string, importer: string | undefined) {
      const result = await this.resolve(source, importer, {
        skipSelf: true,
        custom: { 'node-resolve': {} },
      });

      if (result && /node_modules/.test(result.id)) {
        return false;
      }

      // ignore scoped packages
      if (/^@[a-zA-Z][a-zA-Z0-9-]*\/[a-zA-Z0-9-]+$/.test(source)) {
        return false;
      }

      return null;
    },
  };
}
