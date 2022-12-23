import { RemoveMigrationAction } from '../actions/RemoveMigrationAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { type MigrationTreeItem } from '../treeView/MigrationTreeItem';
import { Command } from './Command';

export class RemoveMigrationCommand extends Command {
  public static commandName = 'removeMigration';

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
    return new RemoveMigrationAction(
      this.terminalProvider,
      this.item.solutionFile.workspaceRoot,
      this.item.dbContext,
      this.item.project,
    ).run();
  }
}
