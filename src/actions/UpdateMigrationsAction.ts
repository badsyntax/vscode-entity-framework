import type { IAction } from './IAction';

export class UpdateMigrationsAction implements IAction {
  constructor(
    private readonly dbcontext: string,
    private readonly project: string,
  ) {}

  public run() {
    return Promise.resolve();
  }
}
