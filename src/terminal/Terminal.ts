import * as vscode from 'vscode';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { spawn } from 'node:child_process';

import { EventWaiter } from './EventWaiter';
import { getEnvConfig } from '../config/config';

const NL = '\n';
const CR = '\r';
const nlRegExp = new RegExp(`${NL}([^${CR}]|$)`, 'g');

export class Terminal implements vscode.Pseudoterminal {
  private cmdArgs: string[] = [];
  private cmd: ChildProcessWithoutNullStreams | undefined;

  private readonly writeEmitter = new vscode.EventEmitter<string>();
  private readonly openEmitter = new vscode.EventEmitter<undefined>();
  private readonly closeEmitter = new vscode.EventEmitter<number>();

  public readonly onDidWrite: vscode.Event<string> = this.writeEmitter.event;
  public readonly onDidClose: vscode.Event<number> = this.closeEmitter.event;
  public readonly onDidOpen: vscode.Event<undefined> = this.openEmitter.event;

  private readonly waitForOpen = new EventWaiter<undefined>(this.onDidOpen);

  constructor() {}

  public async open(): Promise<void> {
    this.openEmitter.fire(undefined);
  }

  public async close(): Promise<void> {}

  public setCmdARgs(cmdArgs: string[]) {
    this.cmdArgs = cmdArgs;
  }

  public async exec(cwd: string): Promise<string> {
    await this.waitForOpen.wait();

    let stdout = '';
    let stderr = '';

    this.cmd = spawn(this.cmdArgs[0], this.cmdArgs.slice(1), {
      cwd,
      env: {
        ...process.env,
        ...getEnvConfig(),
      },
    });

    return new Promise(res => {
      this.write(this.cmdArgs.join(' ') + '\n');

      this.cmd?.stdout.on('data', data => {
        const dataString = data.toString();
        stdout += dataString;
        this.write(dataString);
      });

      this.cmd?.stderr.on('data', data => {
        const dataString = data.toString();
        stderr += dataString;
        this.write(dataString);
      });

      this.cmd?.on('exit', code => {
        this.cmd = undefined;
        this.write(`Exited with code ${code}\n\n`);
        res(stderr || stdout);
      });
    });
  }

  public async handleInput(data: string): Promise<void> {
    const SIGINT = '\x03';
    if (data === SIGINT) {
      this.cmd?.kill('SIGINT');
    }
  }

  public write(message: string): void {
    // Note writing `\n` will just move the cursor down 1 row.
    // We need to write `\r` as well to move the cursor to the left-most cell.
    const sanitisedMessage = message.replace(nlRegExp, `${NL + CR}$1`);
    this.writeEmitter.fire(sanitisedMessage);
  }
}
