import type { ChildProcess } from 'child_process';
import { spawn } from 'child_process';

import { getEnvConfig, getProjectsConfig } from '../config/config';
import type { Logger } from '../util/Logger';
import { EFOutputParser } from './EFOutputParser';

export type ExecOpts = {
  cmdArgs: string[];
  cwd: string;
  removeDataFromOutput?: boolean;
  asJson?: boolean;
  params?: { [key: string]: string | undefined };
  handlers?: {
    onStdOut?: (buffer: string) => void;
    onStdErr?: (buffer: string) => void;
  };
};

export type ExecProcess = {
  cmd: ChildProcess;
  output: Promise<string>;
  args: string[];
};

export class CLI {
  constructor(private readonly logger: Logger) {}

  private getInterpolatedArgs(
    args: string[],
    params: { [key: string]: string | undefined },
  ) {
    return args.map(arg =>
      arg.replace(/\$[\w]+/, a => params[a.slice(1)] || ''),
    );
  }

  public exec({
    cmdArgs,
    cwd,
    handlers,
    asJson,
    params = {},
  }: ExecOpts): ExecProcess {
    const paramsWithStartupProject = {
      ...params,
      startupProject: params.startupProject || params.project,
    };

    const { project, startupProject } = getProjectsConfig();

    const paramsWithDefaults = {
      ...paramsWithStartupProject,
      project,
      startupProject,
    };

    const interpolatedArgs = this.getInterpolatedArgs(
      cmdArgs,
      paramsWithDefaults,
    );

    this.logger.info(interpolatedArgs.join(' '));

    const additionalArgs = ['--prefix-output'];
    if (asJson && !interpolatedArgs.includes('--json')) {
      additionalArgs.push('--json');
    }

    const args = interpolatedArgs.concat(additionalArgs);

    const envConfig = getEnvConfig();

    const cmd = spawn(args[0], args.slice(1), {
      cwd,
      shell: true,
      env: {
        ...process.env,
        ...envConfig,
      },
    });

    let stdout = '';
    let stderr = '';

    return {
      cmd,
      args: interpolatedArgs,
      output: new Promise((res, rej) => {
        cmd.stdout.setEncoding('utf-8');
        cmd.stderr.setEncoding('utf-8');

        cmd?.stdout?.on('data', buffer => {
          const data = buffer.toString();
          stdout += data;
          handlers?.onStdOut?.(data);
        });

        cmd?.stderr?.on('data', buffer => {
          const data = buffer.toString();
          stderr += data;
          handlers?.onStdErr?.(data);
        });

        cmd?.on('exit', async code => {
          const error = stderr || EFOutputParser.parse(stdout).errors;
          if (error || code !== 0) {
            handlers?.onStdOut?.(`Exited with code ${code}\n`);
            const finalError = EFOutputParser.filterInfoFromOutput(
              error || stdout,
            );
            rej(new Error(finalError));
          } else {
            res(stdout);
          }
        });
      }),
    };
  }
}
