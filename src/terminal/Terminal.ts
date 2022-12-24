import * as vscode from 'vscode';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';

import { EventWaiter } from '../util/EventWaiter';
import { getEnvConfig } from '../config/config';
import { getErrorsFromStdOut, removePrefixFromStdOut } from '../cli/ef';

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
      // --prefix-output is an internal flag that is added to all commands
      const argsWithoutPrefixOutput = this.cmdArgs.slice(0, -1);
      this.write(argsWithoutPrefixOutput.join(' ') + '\n');

      this.cmd?.stdout.on('data', data => {
        const dataString = data.toString();
        stdout += dataString;
        this.write(removePrefixFromStdOut(dataString));
      });

      this.cmd?.stderr.on('data', data => {
        const dataString = data.toString();
        stderr += dataString;
        this.write(removePrefixFromStdOut(dataString));
      });

      this.cmd?.on('exit', async _code => {
        this.cmd = undefined;
        const error = stderr || getErrorsFromStdOut(stdout);
        if (error) {
          await vscode.window.showErrorMessage(error);
        }
        res(stdout);
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
    // NLCR is required to move down and left
    const sanitisedMessage = message.replace(nlRegExp, `${NL + CR}$1`);
    this.writeEmitter.fire(sanitisedMessage);
  }
}
