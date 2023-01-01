import type { ExecOpts, ExecProcess } from '../cli/CLI';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import type { IAction } from './IAction';

export abstract class TerminalAction implements IAction {
  private execProcess: ExecProcess | undefined;
  constructor(
    protected readonly terminalProvider: TerminalProvider,
    private readonly args: string[],
    protected readonly params: { [key: string]: string },
    private readonly workingFolder: string,
  ) {}

  public async run(): Promise<string> {
    throw new Error('Not Implemented');
  }

  public async start(
    params = this.params,
    execOpts?: Partial<ExecOpts>,
  ): Promise<void> {
    const terminal = await this.terminalProvider.provideTerminal();
    this.execProcess = await terminal.exec({
      cmdArgs: this.args,
      cwd: this.workingFolder,
      params,
      ...execOpts,
    });
  }

  public async getOutput(): Promise<string> {
    return (await this.execProcess?.output) || '';
  }

  public cancel() {
    this.execProcess?.cmd.kill();
  }
}
