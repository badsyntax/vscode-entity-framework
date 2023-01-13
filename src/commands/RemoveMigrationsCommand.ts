import { RemoveMigrationsAction } from '../actions/RemoveMigrationsAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { type MigrationTreeItem } from '../treeView/MigrationTreeItem';
import { Command } from './Command';

export class RemoveMigrationsCommand extends Command {
  public static commandName = 'removeMigrations';

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
    return new RemoveMigrationsAction(
      this.terminalProvider,
      this.item.workspaceRoot,
      this.item.dbContext,
      this.item.projectFile.name,
      this.item,
    ).run();
  }
}
