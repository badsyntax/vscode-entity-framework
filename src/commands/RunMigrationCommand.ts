import { RunMigrationAction } from '../actions/RunMigrationAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import type { MigrationTreeItem } from '../treeView/MigrationTreeItem';
import { Command } from './Command';

export class RunMigrationCommand extends Command {
  public static commandName = 'runMigration';

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
    return new RunMigrationAction(
      this.terminalProvider,
      this.item.workspaceRoot,
      this.item.dbContext,
      this.item.project,
      this.item.migration.id,
    ).run();
  }
}
