import chalk from 'chalk';
import fs from 'fs-extra';
import * as glob from 'glob';
import path from 'path';
import { Project, SourceFile } from 'ts-morph';

import { parse } from '@vue/compiler-sfc';

interface BuildOptions {
  outDir?: string;
  ignore?: string[];
}

export async function build(input: string, options?: BuildOptions) {
  const root = process.cwd();
  const tsConfigFilePath = fs.existsSync('tsconfig.json')
    ? 'tsconfig.json'
    : undefined;
  const project = new Project({
    compilerOptions: {
      allowJs: true,
      declaration: true,
      emitDeclarationOnly: true,
      // declarationDir: path.resolve(root, './types'),
      noEmit: false,
      // strict: true,
      // target: ScriptTarget.ES2022,
      // module: ModuleKind.ESNext,
      // moduleResolution: ModuleResolutionKind.NodeNext,
      // isolatedModules: true,
      // esModuleInterop: true,
      // skipLibCheck: true,
      // jsx: 1,
    },
    tsConfigFilePath,
    skipAddingFilesFromTsConfig: true,
  });
  const isComponents = /^src/.test(input);
  if (isComponents) {
    project.compilerOptions.set({
      rootDir: path.resolve(root, 'src'),
    });
  }
  if (options?.outDir) {
    project.compilerOptions.set({
      outDir: path.resolve(root, options.outDir),
    });
  }

  const ignoreFiles = ['**/__test__/*', '**/__tests__/*', '**/__demo__/*'];
  if (options && options.ignore) {
    ignoreFiles.push(...options.ignore);
  }
  const files = glob.sync(input, {
    ignore: ignoreFiles,
  });
  const sourceFiles: SourceFile[] = [];

  await Promise.all(
    files.map(async (file) => {
      const content = await fs.promises.readFile(
        path.resolve(root, file),
        'utf8',
      );
      if (file.endsWith('.vue')) {
        const sfc = parse(content);
        const { script, scriptSetup } = sfc.descriptor;
        if (script || scriptSetup) {
          let scriptContent = '';
          let isTSX = false;
          if (script && script.content) {
            scriptContent += script.content;
            if (script.lang === 'tsx') isTSX = true;
          }
          const sourceFile = project.createSourceFile(
            path.relative(root, file).replace('.vue', isTSX ? '.tsx' : '.ts'),
            scriptContent,
          );
          if (sourceFile) {
            removeVueSpecifier(sourceFile);
            sourceFiles.push(sourceFile);
          }
        }
      } else {
        const sourceFile = project.createSourceFile(
          path.relative(root, file),
          content,
          {
            overwrite: true,
          },
        );
        if (sourceFile) {
          removeVueSpecifier(sourceFile);
          sourceFiles.push(sourceFile);
        }
      }
    }),
  );

  try {
    await Promise.all(
      sourceFiles.map(async (sourceFile) => {
        // eslint-disable-next-line no-console
        console.log(
          chalk.green(`Transform start: ${sourceFile.getFilePath()}`),
        );
        const diagnostics = sourceFile.getPreEmitDiagnostics();
        // eslint-disable-next-line no-console
        console.log(project.formatDiagnosticsWithColorAndContext(diagnostics));
        const emitOutput = sourceFile.getEmitOutput();
        const outputFiles = emitOutput.getOutputFiles();
        await Promise.all(
          outputFiles.map(async (outputFile) => {
            const filepath = outputFile.getFilePath();
            await fs.ensureDir(path.dirname(filepath));
            await fs.writeFile(filepath, outputFile.getText(), 'utf8');
            // eslint-disable-next-line no-console
            console.log(chalk.green(`Emitted ${filepath}`));
          }),
        );
      }),
    );
  } catch (e: any) {
    console.log(chalk.red(e.message || 'Transform failed'));
  }
}

const removeVueSpecifier = (sourceFile: SourceFile) => {
  const imports = sourceFile.getImportDeclarations();
  imports.forEach((item) => {
    const specifier = item.getModuleSpecifierValue();
    const ext = path.extname(specifier);
    if (ext === '.vue') {
      item.setModuleSpecifier(specifier.replace('.vue', ''));
    }
  });
};

export default build;
