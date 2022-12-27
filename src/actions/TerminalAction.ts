import { CLI } from '../cli/CLI';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import type { IAction } from './IAction';

export abstract class TerminalAction implements IAction {
  constructor(
    protected readonly terminalProvider: TerminalProvider,
    private readonly args: string[],
    protected readonly params: { [key: string]: string },
    private readonly workingFolder: string,
  ) {}

  public async run(params = this.params): Promise<string> {
    const terminal = this.terminalProvider.provideTerminal();
    const args = CLI.getInterpolatedArgs(this.args, params);
    return await terminal.exec(args, this.workingFolder);
  }
}
