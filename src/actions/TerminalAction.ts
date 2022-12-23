import { Terminal } from '../terminal/Terminal';
import type { IAction } from './IAction';

export abstract class TerminalAction implements IAction {
  constructor(
    private readonly args: string[],
    protected readonly params: { [key: string]: string },
    private readonly workingFolder: string,
  ) {}

  public run(params = this.params): Promise<void> {
    Terminal.run(this.getInterpolatedArgs(params), this.workingFolder);
    return Promise.resolve();
  }

  private getInterpolatedArgs(params = this.params) {
    return this.args.map(arg =>
      arg.replace(/\$[\w]+/, a => params[a.slice(1)] || a),
    );
  }
}
