import * as vscode from 'vscode';
import { type ChildProcessWithoutNullStreams } from 'child_process';

import { EventWaiter } from '../util/EventWaiter';
import { CLI } from '../cli/CLI';
import { TerminalColors } from './TerminalColors';

const NL = '\n';
const CR = '\r';
const nlRegExp = new RegExp(`${NL}([^${CR}]|$)`, 'g');

export class Terminal implements vscode.Pseudoterminal {
  private cmd: ChildProcessWithoutNullStreams | undefined;

  private readonly writeEmitter = new vscode.EventEmitter<string>();
  private readonly openEmitter = new vscode.EventEmitter<undefined>();
  private readonly closeEmitter = new vscode.EventEmitter<number>();

  public readonly onDidWrite: vscode.Event<string> = this.writeEmitter.event;
  public readonly onDidClose: vscode.Event<number> = this.closeEmitter.event;
  public readonly onDidOpen: vscode.Event<undefined> = this.openEmitter.event;

  private readonly waitForOpen = new EventWaiter<undefined>(this.onDidOpen);

  constructor(private readonly cli: CLI) {}

  public async open(): Promise<void> {
    this.openEmitter.fire(undefined);
  }

  public async close(): Promise<void> {}

  public async exec(cmdArgs: string[], cwd: string): Promise<string> {
    await this.waitForOpen.wait();

    this.write(
      `${TerminalColors.blue}${cmdArgs.join(' ')}${TerminalColors.reset}\n`,
    );

    const { cmd, output } = this.cli.exec(cmdArgs, cwd, {
      onStdOut: (buffer: string) => {
        this.write(CLI.removePrefixFromStdOut(CLI.colorizeOutput(buffer)));
      },
      onStdErr: (buffer: string) => {
        this.write(CLI.removePrefixFromStdOut(CLI.colorizeOutput(buffer)));
      },
    });
    this.cmd = cmd;
    return await output;
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
