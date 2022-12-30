import * as vscode from 'vscode';
import type { ChildProcess } from 'child_process';

import { EventWaiter } from '../util/EventWaiter';
import type { ExecOpts } from '../cli/CLI';
import { CLI } from '../cli/CLI';
import { TerminalColors } from './TerminalColors';

const NL = '\n';
const CR = '\r';
const nlRegExp = new RegExp(`${NL}([^${CR}]|$)`, 'g');

export class Terminal implements vscode.Pseudoterminal {
  private cmd: ChildProcess | undefined;

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

  private handleCLIOutput(removeDataFromOutput?: boolean) {
    let lineBuffer = '';
    return (buffer: string) => {
      if (!nlRegExp.test(buffer[buffer.length - 1])) {
        lineBuffer += buffer;
      } else {
        let line = lineBuffer + buffer;
        lineBuffer = '';
        line = CLI.colorizeOutput(line);
        if (removeDataFromOutput) {
          line = CLI.filterDataFromOutput(line);
        }
        this.write(CLI.stripPrefixFromStdOut(line));
      }
    };
  }

  public async exec({
    cmdArgs,
    cwd,
    removeDataFromOutput,
    ...execOpts
  }: ExecOpts): Promise<string> {
    await this.waitForOpen.wait();

    this.write(
      `${TerminalColors.blue}${cmdArgs.join(' ')}${TerminalColors.reset}\n`,
    );

    const { cmd, output } = this.cli.exec({
      cmdArgs,
      cwd,
      handlers: {
        onStdOut: this.handleCLIOutput(removeDataFromOutput),
        onStdErr: this.handleCLIOutput(removeDataFromOutput),
      },
      ...execOpts,
    });

    this.cmd = cmd;

    return await output;
  }

  public async handleInput(data: string): Promise<void> {
    // FIXME: this doesn't work
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
