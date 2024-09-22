import type { ExecOpts } from '../cli/CLI';

export interface IAction {
  run(
    params?: { [key: string]: string },
    execArgs?: Partial<ExecOpts>,
  ): Promise<string | number | void>;
}
