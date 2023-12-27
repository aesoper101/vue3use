import fs from 'fs-extra';
import path from 'path';
import { build, loadConfigFromFile, mergeConfig } from 'vite';

import config from '../../configs/vite.lib.prod';
import getUmdConfig from '../../configs/vite.lib.prod.umd';

async function run({ umd = false }) {
  await fs.emptyDir(path.resolve(process.cwd(), 'es'));
  await fs.emptyDir(path.resolve(process.cwd(), 'lib'));
  await fs.emptyDir(path.resolve(process.cwd(), 'dist'));

  const viteConfigFilePath = path.resolve(process.cwd(), 'vite.config.ts');
  const hasViteConfigFile = fs.existsSync(viteConfigFilePath);
  const customConfig = hasViteConfigFile
    ? await loadConfigFromFile(
        { mode: 'production', command: 'build' },
        viteConfigFilePath,
      )
    : {};

  await build(mergeConfig(config, customConfig || {}));

  if (umd) {
    await build(mergeConfig(getUmdConfig(), customConfig || {}));
  }
}
export default run;
