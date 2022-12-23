import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { getEnvConfig } from '../config/config';

const execAsync = promisify(exec);

export function extractDataFromStdOut(output: string): string {
  return output
    .split(/\r\n|\r|\n/)
    .filter(line => line.startsWith('data:    '))
    .map(line => line.replace('data:    ', ''))
    .join('\n');
}

export function removePrefixFromStdOut(output: string): string {
  return output
    .split(/\r\n|\r|\n/)
    .map(line => line.replace(/^[a-z]+:    /, ''))
    .join('\n');
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
