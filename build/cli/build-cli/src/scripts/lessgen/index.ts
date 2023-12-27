import chalk from 'chalk';
import fs from 'fs-extra';
import * as glob from 'glob';
import path from 'path';

const lessgen = () => {
  const stylesPath = path.resolve(process.cwd(), './src');

  if (!fs.existsSync(path.resolve(stylesPath, './style/index.less'))) {
    console.log(chalk.yellow('No style/index.less file found'));
    return;
  }

  let lessContent = `@import './style/index.less';\n`;

  const lessFiles = glob.sync('**/style/index.less', {
    cwd: stylesPath,
    ignore: ['style/index.less'],
  });

  // if (lessFiles.length === 0) {
  //   console.log(chalk.yellow('No less files found'));
  //   return;
  // }

  lessFiles.forEach((value) => {
    value = value.replace(/\\/g, '/');
    lessContent += `@import './${value}';\n`;
  });

  console.log(chalk.green('Generate less file...'));

  fs.outputFileSync(path.resolve(stylesPath, 'index.less'), lessContent);

  console.log(chalk.green('Generate less file successfully'));
};

export default lessgen;
