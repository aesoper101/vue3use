import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { build, loadConfigFromFile, mergeConfig } from 'vite';

import config from '../../configs/vite.lib.prod';
import getUmdConfig from '../../configs/vite.lib.prod.umd';
import licenseChecker from '../license-checker';
import sortPackage from '../sort-package';

interface BuildLibraryOptions {
  umd?: boolean;
  licenseCheck?: boolean;
}
async function run(
  options: BuildLibraryOptions = { umd: false, licenseCheck: false },
) {
  const { umd, licenseCheck } = options;

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

  console.log(chalk.green('Build successfully'));

  if (licenseCheck) {
    console.log(chalk.green('License check...'));
    await licenseChecker({
      start: process.cwd(),
    });
  }

  console.log(chalk.green('Sort package.json files...'));

  await sortPackage(process.cwd());
}
export default run;
