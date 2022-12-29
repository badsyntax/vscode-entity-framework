import type { ChildProcess } from 'child_process';
import { spawn } from 'child_process';

import { getEnvConfig } from '../config/config';
import { TerminalColors } from '../terminal/TerminalColors';
import type { Logger } from '../util/Logger';

const NEWLINE_SEPARATOR = /\r\n|\r|\n/;
const OUTPUT_PREFIX = /^([a-z]+:\s+)/;

export type ExecOpts = {
  cmdArgs: string[];
  cwd: string;
  removeDataFromOutput?: boolean;
  asJson?: boolean;
  handlers?: {
    onStdOut?: (buffer: string) => void;
    onStdErr?: (buffer: string) => void;
  };
};

export class CLI {
  constructor(private readonly logger: Logger) {}

  public static getInterpolatedArgs(
    args: string[],
    params: { [key: string]: string },
  ) {
    return args.map(arg =>
      arg.replace(/\$[\w]+/, a => params[a.slice(1)] || ''),
    );
  }

  public static getDataFromStdOut(output: string): string {
    return this.stripPrefixFromStdOut(
      output
        .split(NEWLINE_SEPARATOR)
        .filter(line => line.startsWith('data:'))
        .join('\n'),
    );
  }

  public static getErrorsFromStdOut(output: string): string {
    return this.stripPrefixFromStdOut(
      output
        .split(NEWLINE_SEPARATOR)
        .filter(line => line.startsWith('error:'))
        .join('\n'),
    );
  }

  private static filter(out: string, prefix: string) {
    return out
      .split(NEWLINE_SEPARATOR)
      .filter(line => !line.trim().startsWith(prefix))
      .join('\n');
  }

  public static filterInfoFromOutput(out: string): string {
    return this.filter(out, 'info:');
  }

  public static filterDataFromOutput(out: string): string {
    return this.filter(out, 'data:');
  }

  public static colorizeOutput(output: string): string {
    return output
      .split(NEWLINE_SEPARATOR)
      .map(line => {
        if (line.startsWith('warn:')) {
          return (
            line.replace(OUTPUT_PREFIX, `$1${TerminalColors.yellow}`) +
            TerminalColors.reset
          );
        }
        if (line.startsWith('error:')) {
          return (
            line.replace(OUTPUT_PREFIX, `$1${TerminalColors.red}`) +
            TerminalColors.reset
          );
        }
        return line;
      })
      .join('\n');
  }

  public static stripPrefixFromStdOut(output: string): string {
    return output
      .split(NEWLINE_SEPARATOR)
      .map(line => line.replace(OUTPUT_PREFIX, ''))
      .join('\n');
  }

  public exec({ cmdArgs, cwd, handlers, asJson }: ExecOpts): {
    cmd: ChildProcess;
    output: Promise<string>;
  } {
    this.logger.info(cmdArgs.join(' '));

    const additionalArgs = ['--prefix-output'];
    if (asJson && !cmdArgs.includes('--json')) {
      additionalArgs.push('--json');
    }

    const args = cmdArgs.concat(additionalArgs);

    const cmd = spawn(args[0], args.slice(1), {
      cwd,
      shell: true,
      env: {
        ...process.env,
        ...getEnvConfig(),
      },
    });

    let stdout = '';
    let stderr = '';

    return {
      cmd,
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
          const error = stderr || CLI.getErrorsFromStdOut(stdout);
          if (error || code !== 0) {
            const finalError = CLI.filterInfoFromOutput(error || stdout);
            rej(new Error(finalError));
          } else {
            res(stdout);
          }
        });
      }),
    };
  }
}
