import chalk from 'chalk';
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';

async function run(paths: string[] = []) {
  const root = process.cwd();

  const spinner = ora(`${chalk.green('Cleaning...')}`).start();

  if (paths.length > 0) {
    paths.forEach((p) => {
      path.isAbsolute(p)
        ? fs.removeSync(p)
        : fs.removeSync(path.resolve(root, p));
    });
    spinner.info(`${chalk.green('Cleaned!')}`);
    return;
  } else {
    fs.removeSync(path.resolve(root, 'dist'));
    fs.removeSync(path.resolve(root, 'es'));
    fs.removeSync(path.resolve(root, 'lib'));
    fs.removeSync(path.resolve(root, 'node_modules'));
  }

  spinner.info(`${chalk.green('Cleaned!')}`);

  spinner.stop();
}

export default run;
