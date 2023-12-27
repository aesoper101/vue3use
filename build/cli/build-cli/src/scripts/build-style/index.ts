import chalk from 'chalk';
import * as ChangeCase from 'change-case';
import CleanCSS from 'clean-css';
import fs from 'fs-extra';
import * as glob from 'glob';
import less from 'less';
import path from 'path';
import { build } from 'vite';

import config from '../../configs/vite.prod.style';
import lessGen from '../lessgen';

interface Options {
  image?: 'base64' | 'file' | 'none';
  imagemin?: boolean;
}

const run = async (options: Options = { image: 'file' }) => {
  const root = process.cwd();
  // 拷贝less文件到目标文件，index.less编译生成index.css
  const files = glob.sync('**/*.{less,js}', {
    cwd: path.resolve(root, 'src'),
  });

  if (files.length === 0) {
    console.log(chalk.yellow(`no less file found, skip build style`));
    return;
  }

  // 更新index.less文件
  lessGen();

  for (const filename of files) {
    const absolute = path.resolve(root, `src/${filename}`);
    const esAbsolute = path.resolve(root, `es/${filename}`);
    const libAbsolute = path.resolve(root, `lib/${filename}`);

    // 处理图片资源
    let rawLess = fs.readFileSync(absolute, 'utf8');
    if (options.image !== 'none') {
      rawLess = rawLess.replace(
        /url\((\S+)\)/g,
        (match: string, p1: string) => {
          if (p1.startsWith('data:') || p1.startsWith('http')) {
            return match;
          }

          const imagePath = path.resolve(path.dirname(absolute), p1);
          if (options.image === 'base64') {
            const imageContent = fs.readFileSync(imagePath);
            const base64 = imageContent.toString('base64');
            if (base64.length > 1024 * 10) {
              return match;
            }

            const ext = path.extname(imagePath);
            switch (ext) {
              case '.png':
                return `url(data:image/png;base64,${base64})`;
              case '.jpg':
                return `url(data:image/jpg;base64,${base64})`;
              case '.jpeg':
                return `url(data:image/jpeg;base64,${base64})`;
              case '.gif':
                return `url(data:image/gif;base64,${base64})`;
            }

            return `url(data:image/png;base64,${base64})`;
          } else {
            // copy file to target
            const esTargetUrl = path.resolve(
              path.dirname(esAbsolute),
              './',
              p1,
            );

            console.log(chalk.green(`copy ${imagePath} to ${esTargetUrl}`));

            const libTarget = path.resolve(path.dirname(libAbsolute), './', p1);

            if (options.imagemin) {
              //TODO: imagemin image
              console.log(chalk.green(`imagemin ${imagePath}`));
            } else {
              fs.copySync(imagePath, esTargetUrl);
              fs.copySync(imagePath, libTarget);
            }
          }

          return match;
        },
      );
    }

    fs.outputFileSync(esAbsolute, rawLess);
    fs.outputFileSync(libAbsolute, rawLess);

    if (/index\.less$/.test(filename)) {
      console.log(`building ${filename}`);

      const lessContent = fs.readFileSync(absolute, 'utf8');

      less.render(
        lessContent,
        {
          filename,
          paths: [path.resolve(root, `src/${path.dirname(filename)}`), root],
        },
        (error, output) => {
          if (error) {
            console.log(chalk.red(`${filename} build error: ${error}`));
          } else if (output && output.css) {
            let cssContent = output.css;

            const cssFilename = filename.replace('.less', '.css');
            fs.writeFileSync(
              path.resolve(root, `es/${cssFilename}`),
              cssContent,
            );
            fs.writeFileSync(
              path.resolve(root, `lib/${cssFilename}`),
              cssContent,
            );

            // TODO: css 中的图片资源处理

            console.log(chalk.green(`${filename} build success`));
          }
        },
      );
    }
  }

  // 拷贝并编译less入口文件
  console.log(chalk.green(`building target ...`));
  const indexLessPath = path.resolve(root, 'src/index.less');
  fs.copySync(indexLessPath, path.resolve(root, 'es/index.less'));
  fs.copySync(indexLessPath, path.resolve(root, 'lib/index.less'));

  const indexLess = fs.readFileSync(indexLessPath, 'utf8');
  const result = await less.render(indexLess, {
    paths: [path.resolve(root, 'src')],
  });

  fs.ensureDirSync(path.resolve(root, 'dist'));

  fs.writeFileSync(
    path.resolve(root, 'dist/index.less'),
    "@import '../es/index.less';\n\n",
  );

  fs.writeFileSync(path.resolve(root, 'dist/index.css'), result.css);

  const compress = new CleanCSS().minify(result.css);

  fs.writeFileSync(path.resolve(root, 'dist/index.min.css'), compress.styles);

  console.log(chalk.green(`target build success`));

  // 构建style/index.ts
  const indexFiles = glob.sync('src/**/style/index.ts', {
    cwd: root,
  });

  if (indexFiles.length === 0) {
    console.log(chalk.yellow(`style/index.ts not found, skip build style ts`));
    return;
  }

  const rollupInput = indexFiles.reduce((pre, cur) => {
    const key = ChangeCase.kebabCase(cur.slice(11, -3), { delimiter: '/' });
    pre[key] = cur;
    return pre;
  }, {} as any);

  const buildIndex = async () => {
    if (config?.build?.rollupOptions) {
      config.build.rollupOptions.input = rollupInput;
    }

    await build(config);
  };

  console.log(chalk.green(`build style ts ...`));

  await buildIndex();

  console.log(chalk.green(`build style ts success`));
};

export default run;
