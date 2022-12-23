import type { TerminalProvider } from '../terminal/TerminalProvider';
import type { IAction } from './IAction';

export abstract class TerminalAction implements IAction {
  constructor(
    protected readonly terminalProvider: TerminalProvider,
    private readonly args: string[],
    protected readonly params: { [key: string]: string },
    private readonly workingFolder: string,
  ) {}

  public async run(params = this.params): Promise<void> {
    const terminal = this.terminalProvider.provideTerminal();
    terminal.setCmdARgs(this.getInterpolatedArgs(params));
    await terminal.exec(this.workingFolder);
  }

  private getInterpolatedArgs(params = this.params) {
    return this.args.map(arg =>
      arg.replace(/\$[\w]+/, a => params[a.slice(1)] || a),
    );
  }
}
