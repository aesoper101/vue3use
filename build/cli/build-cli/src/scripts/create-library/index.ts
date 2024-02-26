import chalk from 'chalk';
import * as ChangeCase from 'change-case';
import ejs from 'ejs';
import { execa } from 'execa';
import fs from 'fs-extra';
import * as glob from 'glob';
import inquirer from 'inquirer';
import latestVersion from 'latest-version';
import { minimatch } from 'minimatch';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'path';
import { readPackageSync } from 'read-pkg';
import { simpleGit } from 'simple-git';

type StyleType = 'less' | 'panda';

interface CreateLibraryOptions {
  projectName: string;
  packageName?: string;
  workspaceDir?: string;
  style?: StyleType;
  pandaOutDir?: string;
  pandaVersion?: string;
}

interface TemplateData {
  packageName: string;
  gitURL: string;
  gitUser: string;
  gitEmail: string;
  unpkgName: string;
  repositoryDir: string;
  style?: StyleType;
  pandaOutDir?: string;
  pandaVersion?: string;
}

const isWorkspaceRoot = (cwd: string) => {
  return (
    fs.existsSync(path.join(cwd, 'package.json')) &&
    fs.existsSync(path.join(cwd, 'lerna.json')) &&
    fs.existsSync(path.join(cwd, 'yarn.lock'))
  );
};

export default async function run(options: CreateLibraryOptions) {
  const cwd = process.cwd();
  const isRoot = isWorkspaceRoot(cwd);
  if (!isRoot) {
    console.log(
      chalk.red(
        'You must run this command at the root of a workspace. Please change your current working directory and try again.',
      ),
    );
    return;
  }

  const workspacePackageJson = readPackageSync({ cwd });
  const workspaces = workspacePackageJson.workspaces
    ? Array.isArray(workspacePackageJson.workspaces)
      ? workspacePackageJson.workspaces
      : workspacePackageJson.workspaces.packages ?? ['packages/*']
    : ['packages/*'];

  const workspaceDir = options.workspaceDir || 'packages';

  if (path.isAbsolute(workspaceDir)) {
    console.log(
      chalk.red(
        'The workspace directory you specified must be a relative path.',
      ),
    );
    return;
  }

  if (!minimatch.match(workspaces, workspaceDir)) {
    console.log(
      chalk.red(
        'The workspace directory you specified does not exist. Please change your current working directory and try again.',
      ),
    );
    return;
  }

  const packageName = options.packageName || options.projectName;
  const libraryName = packageName.split('/').reverse()[0];
  const scope = packageName.split('/')[0];
  let libraryRoot = path.join(
    cwd,
    workspaceDir,
    options.projectName || libraryName,
  );

  if (fs.existsSync(libraryRoot)) {
    await inquirer.prompt([
      {
        type: 'input',
        message: `${libraryRoot} already exists, please input a new directory name:`,
        name: 'directory',
        validate: (input) => {
          if (!input) {
            return 'Directory name cannot be empty.';
          }
          if (fs.existsSync(path.join(cwd, workspaceDir, input))) {
            return 'Directory already exists.';
          }

          libraryRoot = path.join(cwd, workspaceDir, input);
          return true;
        },
      },
    ]);
  }

  const git = simpleGit();
  const gitUser = await git.getConfig('user.name');
  const gitEmail = await git.getConfig('user.email');
  const gitURL = await git.getConfig('remote.origin.url');

  // fetch panda latest version if style is panda
  if (options.style === 'panda' && !options.pandaVersion) {
    console.log(chalk.green('Fetching panda latest version...'));

    const version = await latestVersion('@pandacss/dev');
    if (version) {
      options.pandaVersion = version;
      console.log(chalk.green(`Panda latest version: ${version}`));
    } else {
      console.log(
        chalk.yellow(
          'Fetching panda latest version failed. Use default version 0.27.3',
        ),
      );
      return;
    }
  }

  const renderData: TemplateData = {
    packageName,
    unpkgName: ChangeCase.kebabCase(libraryName),
    gitUser: gitUser.value || '',
    gitEmail: gitEmail.value || '',
    gitURL: gitURL.value || '',
    style: options.style,
    repositoryDir: path.relative(cwd, libraryRoot).replace(/\\/g, '/'),
    pandaOutDir:
      options.pandaOutDir || scope.startsWith('@')
        ? `${scope}/styled-system`
        : 'styled-system',
    pandaVersion: options.pandaVersion || '0.27.3',
  };

  // 获取模板文件
  const currentModulePath = dirname(fileURLToPath(import.meta.url));
  const templateDir = path.resolve(
    currentModulePath,
    '../templates/template-library',
  );

  console.log(chalk.green(`Library Name: ${libraryName}`));
  console.log(chalk.green(`Library Root: ${libraryRoot}`));

  const templateFiles = glob.sync('**/*', {
    cwd: templateDir,
    nodir: true,
  });

  console.log(chalk.green(`Generate Project ...`));
  console.log(chalk.green(`Copy Templates ...`));

  templateFiles.forEach((file) => {
    console.log(chalk.green(`Scan ${file} ...`));

    ejs.renderFile(
      path.resolve(templateDir, file),
      renderData,
      (err: Error | null, str: string) => {
        if (err) {
          console.log(chalk.red(err));
          return;
        }

        if (
          options.style !== 'panda' &&
          (path.basename(file, '.ejs') === 'panda.config.ts' ||
            path.basename(file, '.ejs') === 'postcss.config.cjs')
        ) {
          return;
        }

        const targetFile = path.join(
          libraryRoot,
          path.dirname(file),
          path.basename(file, '.ejs'),
        );

        fs.ensureDirSync(path.dirname(targetFile));
        fs.writeFileSync(targetFile, str);

        console.log(chalk.green(`Generate ${targetFile} OK.`));
      },
    );
  });

  console.log(chalk.green('Created Library success.'));

  console.log(chalk.green('Adding git remote...'));

  const { exitCode, stderr } = await execa('git', ['add', '.']);
  if (exitCode !== 0 && stderr !== '') {
    console.log(chalk.yellow('Adding git failed.'));
    console.log(chalk.yellow(stderr));
    return;
  } else if (exitCode === 0) {
    console.log(chalk.green('Adding git success.'));
  }

  console.log(chalk.green('Installing dependencies...'));

  const { exitCode: ecode } = await execa('yarn', ['install']);
  if (ecode !== 0) {
    console.log(chalk.yellow('Installing dependencies failed.'));
    return;
  } else {
    console.log(chalk.green('Installing dependencies success.'));
  }

  if (options && options.style === 'panda') {
    console.log(chalk.green('Panda codegen...'));

    const { exitCode: ecode } = await execa('yarn', ['run', 'panda:codegen'], {
      cwd: libraryRoot,
    });
    if (ecode !== 0) {
      console.log(chalk.yellow('Panda codegen failed.'));
      return;
    } else {
      console.log(chalk.green('Panda codegen success.'));
    }
  }
}
