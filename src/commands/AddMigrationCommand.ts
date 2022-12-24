import { AddMigrationAction } from '../actions/AddMigrationAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { type DbContextTreeItem } from '../treeView/DbContextTreeItem';
import { Command } from './Command';

export class AddMigrationCommand extends Command {
  public static commandName = 'addMigration';

  constructor(
    private readonly terminalProvider: TerminalProvider,
    private readonly item?: DbContextTreeItem,
  ) {
    super();
  }

  public async run() {
    if (!this.item) {
      return;
    }
    return new AddMigrationAction(
      this.terminalProvider,
      this.item.workspaceRoot,
      this.item.label,
      this.item.project,
    ).run();
  }
}
