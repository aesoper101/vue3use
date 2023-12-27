import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import chalk from 'chalk';
import * as ChangeCase from 'change-case';
import fs from 'fs-extra';
import path from 'path';
//@ts-ignore
import { terser } from 'rollup-plugin-terser';
import { InlineConfig } from 'vite';

export default (): InlineConfig => {
  const packageContent = fs.readFileSync(
    path.resolve(process.cwd(), './package.json'),
    'utf8',
  );
  const packageData: any = JSON.parse(packageContent);
  const splitN = packageData.name.split('/');
  const libName: string = splitN.length > 1 ? splitN[1] : packageData.name;

  console.log(chalk.green(`Building ${libName} Umd...`));

  const entry = 'src/index.ts';
  const name = ChangeCase.pascalCase(libName);
  const entryFileName = ChangeCase.kebabCase(libName);

  return {
    mode: 'production',
    build: {
      target: 'modules',
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: true,
      minify: false,
      // brotliSize: false,
      rollupOptions: {
        external: 'vue',
        output: [
          {
            format: 'umd',
            entryFileNames: `${entryFileName}.js`,
            globals: {
              vue: 'Vue',
            },
            name,
          },
          {
            format: 'umd',
            entryFileNames: `${entryFileName}.min.js`,
            globals: {
              vue: 'Vue',
            },
            name,
            plugins: [terser() as any],
          },
        ],
      },
      // 开启lib模式
      lib: {
        entry,
        formats: ['umd'],
        name,
      },
    },
    // @ts-ignore vite内部类型错误
    plugins: [vue(), vueJsx()],
  };
};
