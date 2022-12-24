import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { getEnvConfig } from '../config/config';

const execAsync = promisify(exec);
const NEWLINE_SEPARATOR = /\r\n|\r|\n/;
const STDOUT_PREFIX = /^[a-z]+:    /;

export function removePrefixFromStdOut(output: string): string {
  return output
    .split(NEWLINE_SEPARATOR)
    .map(line => line.replace(STDOUT_PREFIX, ''))
    .join('\n');
}

export function getDataFromStdOut(output: string): string {
  return removePrefixFromStdOut(
    output
      .split(NEWLINE_SEPARATOR)
      .filter(line => line.startsWith('data:'))
      .join('\n'),
  );
}

export function getErrorsFromStdOut(output: string): string {
  return removePrefixFromStdOut(
    output
      .split(NEWLINE_SEPARATOR)
      .filter(line => line.startsWith('error:'))
      .join('\n'),
  );
}

export async function execEF(
  cmd: string,
  workspaceRoot: string,
): Promise<string> {
  const childProcess = await execAsync(`dotnet ef ${cmd}`, {
    cwd: workspaceRoot,
    env: {
      ...process.env,
      ...getEnvConfig(),
    },
  });
  if (childProcess.stderr) {
    throw new Error(childProcess.stderr);
  }
  return childProcess.stdout;
}
