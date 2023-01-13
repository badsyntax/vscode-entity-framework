import { ResetMigrationsAction } from '../actions/ResetMigrationsAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';

import { type MigrationTreeItem } from '../treeView/MigrationTreeItem';
import { Command } from './Command';

export class ResetMigrationsCommand extends Command {
  public static commandName = 'resetMigrations';

  constructor(
    private readonly terminalProvider: TerminalProvider,
    private readonly item?: MigrationTreeItem,
  ) {
    super();
  }

  public async run() {
    if (!this.item) {
      return;
    }
    return new ResetMigrationsAction(
      this.terminalProvider,
      this.item.workspaceRoot,
      this.item.dbContext,
      this.item.projectFile.name,
      this.item,
    ).run();
  }
}
