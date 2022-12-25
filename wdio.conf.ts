/* eslint-disable @typescript-eslint/naming-convention */
import type { Options } from '@wdio/types';
import path from 'node:path';

export const config: Options.Testrunner = {
  runner: 'local',
  autoCompileOpts: {
    tsNodeOpts: {
      project: './test/tsconfig.json',
    },
  },
  specs: ['./test/specs/**/*.ts'],
  exclude: [
    // 'path/to/excluded/files'
  ],
  maxInstances: 10,
  capabilities: [
    {
      browserName: 'vscode',
      browserVersion: process.env.VSCODE_VERSION || '1.56.0', // "insiders" or "stable" for latest VSCode version
      // @ts-ignore
      'wdio:vscodeOptions': {
        extensionPath: __dirname,
        workspacePath: path.join(__dirname, 'sample_dotnet'),
        userSettings: {
          'editor.fontSize': 14,
        },
      },
    },
  ],
  services: ['vscode'],
  logLevel: 'warn',
  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0,
  // Default timeout for all waitFor* commands.
  waitforTimeout: 10000,
  //
  // Default timeout in milliseconds for request
  // if browser driver or grid doesn't send response
  connectionRetryTimeout: 120000,
  //
  // Default request retries count
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: ['spec' /*, 'junit'*/],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
};
