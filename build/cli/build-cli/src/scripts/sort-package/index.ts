import chalk from 'chalk';
import * as glob from 'glob';
import path from 'path';
import { readPackageSync } from 'read-pkg';
import { sortPackageJson } from 'sort-package-json';
import { writePackageSync } from 'write-package';

export default async function run(packageJsonPath?: string) {
  const cwd = process.cwd();
  const scanDir = packageJsonPath || cwd;
  const files = glob.sync(['**/package.json'], {
    cwd: scanDir,
    nodir: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/es/**'],
  });

  if (files.length === 0) {
    console.log('No package.json files found');
    return;
  }

  files.forEach((file) => {
    console.log(chalk.green(`Sort ${file} file...`));

    const packageJsonFilePath = path.resolve(scanDir, file);

    const data = readPackageSync({ cwd: path.dirname(packageJsonFilePath) });

    writePackageSync(packageJsonFilePath, sortPackageJson(data));

    console.log(chalk.green(`Sort ${file} file successfully`));
  });
}
