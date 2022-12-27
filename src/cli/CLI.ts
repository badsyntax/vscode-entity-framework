import type { ChildProcessWithoutNullStreams } from 'child_process';
import { spawn } from 'child_process';

import { getEnvConfig } from '../config/config';
import { TerminalColors } from '../terminal/TerminalColors';
import type { Logger } from '../util/Logger';

const NEWLINE_SEPARATOR = /\r\n|\r|\n/;
const OUTPUT_PREFIX = /^([a-z]+:    )/;

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
    return this.removePrefixFromStdOut(
      output
        .split(NEWLINE_SEPARATOR)
        .filter(line => line.startsWith('data:'))
        .join('\n'),
    );
  }

  public static getErrorsFromStdOut(output: string): string {
    return this.removePrefixFromStdOut(
      output
        .split(NEWLINE_SEPARATOR)
        .filter(line => line.startsWith('error:'))
        .join('\n'),
    );
  }

  public static removeInfoPrefixFromStdErr(stdErr: string): string {
    return stdErr
      .split(NEWLINE_SEPARATOR)
      .filter(line => !line.startsWith('info:'))
      .join('\n');
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
        return line;
      })
      .join('\n');
  }

  public static removePrefixFromStdOut(output: string): string {
    return output
      .split(NEWLINE_SEPARATOR)
      .map(line => line.replace(OUTPUT_PREFIX, ''))
      .join('\n');
  }

  public exec(
    cmdArgs: string[],
    cwd: string,
    handlers?: {
      onStdOut?: (buffer: string) => void;
      onStdErr?: (buffer: string) => void;
    },
  ): {
    cmd: ChildProcessWithoutNullStreams;
    output: Promise<string>;
  } {
    this.logger.info(cmdArgs.join(' '));

    const args = cmdArgs.concat(['--prefix-output']);

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
        cmd?.stdout.on('data', buffer => {
          const data = buffer.toString();
          stdout += data;
          handlers?.onStdOut?.(data);
        });

        cmd?.stderr.on('data', buffer => {
          const data = buffer.toString();
          stderr += data;
          handlers?.onStdErr?.(data);
        });

        cmd?.on('exit', async code => {
          const error = stderr || CLI.getErrorsFromStdOut(stdout);
          if (error || code !== 0) {
            const finalError = CLI.removeInfoPrefixFromStdErr(error || stdout);
            rej(new Error(finalError));
          } else {
            res(stdout);
          }
        });
      }),
    };
  }
}
