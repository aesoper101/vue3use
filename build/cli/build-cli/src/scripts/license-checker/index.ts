import chalk from 'chalk';
import fs from 'fs-extra';
import checker, { type InitOpts } from 'license-checker-rseidelsohn';
import path from 'path';
import * as process from 'process';
import { readPackageSync } from 'read-pkg';
import { writePackageSync } from 'write-package';

import sortPackage from '../sort-package';

export default async function run(options: Omit<InitOpts, 'start'> = {}) {
  const cwd = process.cwd();
  const opts = Object.assign(
    {
      start: process.cwd(),
      json: true,
      excludeLicenses: 'MIT, MIT OR X11, BSD, ISC',
      excludePrivatePackages: true,
      out: 'third-party-licenses.json',
      summary: true,
    },
    options || {}
  ) as InitOpts;
  checker.init(opts, (err, packages) => {
    if (err) {
      console.error(err);
      return;
    }

    const license = Object.keys(packages).map((key) => {
      const item = packages[key];
      return item.licenses;
    });

    const licenseSet = new Set(license);

    if (licenseSet.size > 1) {
      console.error(
        chalk.red('The license of the dependent package is inconsistent')
      );
      process.exit(1);
    }

    console.log(chalk.green('License check successfully'));

    if (!opts.out) {
      return;
    }

    if (!fs.existsSync(path.resolve(cwd, opts.out))) {
      return;
    }

    // judge whether the third-party-licenses.json file empty
    const thirdPartyLicensesJson = fs.readJSONSync(path.resolve(cwd, opts.out));
    if (Object.keys(thirdPartyLicensesJson).length == 0) {
      fs.removeSync(path.resolve(cwd, opts.out));
      return;
    }

    // Add third-party-licenses.json file to the files field of the package.json file
    const workspacePackageJson = readPackageSync({ cwd: cwd });
    if (
      workspacePackageJson.files &&
      workspacePackageJson.files.includes(opts.out)
    ) {
      console.log(
        chalk.green(
          'The third-party-licenses.json file already exists in the files field of the package.json file'
        )
      );
      return;
    } else {
      workspacePackageJson.files = workspacePackageJson.files || [];
      workspacePackageJson.files.push(opts.out);
      console.log(
        chalk.green(
          'Add third-party-licenses.json file to the files field of the package.json file'
        )
      );
      writePackageSync(path.join(cwd, 'package.json'), workspacePackageJson);
      sortPackage(cwd);
    }
  });
}
