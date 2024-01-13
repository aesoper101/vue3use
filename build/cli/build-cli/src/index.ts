#!/usr/bin/env node
import { Command } from 'commander';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'path';
import { readPackageSync } from 'read-pkg';

import buildLibrary from './scripts/build-library';
import buildStyle from './scripts/build-style';
import cleanCache from './scripts/clean-cache';
import createLibrary from './scripts/create-library';
import dtsGen from './scripts/dtsgen';
import lessGen from './scripts/lessgen';
import sortPackage from './scripts/sort-package';

const program = new Command();

const currentModulePath = dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(currentModulePath, '../');

const packageInfo = readPackageSync({ cwd: packageJsonPath });
const programName = packageInfo.name.replace(/^@[^/]+\//, '');

program
  .version(packageInfo.version)
  .name(programName)
  .description('a cli tool for vis')
  .usage('command [options]');

program
  .command('dtsgen <files>')
  .description('emit .d.ts files for vue files.')
  .option(
    '-o, --outDir <direname>',
    'Specify an output folder for all emitted files',
  )
  .option('-i, --ignore <ignores...>', 'Specify files to ignore')
  .action(async (files, options) => {
    await dtsGen(files, options);
  });

program
  .command('create:library <projectName>')
  .description('create a library project.')
  .option(
    '-w, --workspaceDir <workspaceDir>',
    'a Specify the workspaceDir of the' + ' library, default "packages"',
  )
  .option(
    '-p, --packageName <packageName>',
    'Specify the packageName of the library',
  )
  .option(
    '-s, --style <style>',
    'Specify the style of the library, value: less, panda',
  )
  .action(async (projectName, { workspaceDir, packageName, style }) => {
    await createLibrary({
      projectName,
      workspaceDir,
      packageName,
      style,
    });
  });

program
  .command('build:style')
  .description('build style related files.')
  .option(
    '-i, --image <image>',
    'image option, available values: base64, file, none',
    'base64',
  )
  .option('-m, --imagemin', 'compress images when image is file')
  .action(async ({ image, imagemin }) => {
    await buildStyle({
      image,
      imagemin,
    });
  });

program
  .command('lessgen')
  .description('generate index less file.')
  .action(() => {
    lessGen();
  });

program
  .command('sort:package [path]')
  .description('sort package.json files.')
  .action(async (path) => {
    await sortPackage(path);
  });

program
  .command('build:library')
  .description('build production files.')
  .option('-u, --umd', 'build with UMD file')
  .action(async ({ umd }) => {
    await buildLibrary({ umd });
  });

program
  .command('clean')
  .description('clean node_modules and compiled output files.')
  .option('-p, --path <paths...>', 'clean path')
  .action(async (paths) => {
    await cleanCache(paths);
  });

program.parse(process.argv);
