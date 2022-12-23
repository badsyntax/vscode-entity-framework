import { RemoveMigrationAction } from '../actions/RemoveMigrationAction';
import { type MigrationTreeItem } from '../treeView/MigrationTreeItem';
import { Command } from './Command';

export class RemoveMigrationCommand extends Command {
  public static commandName = 'removeMigration';

  constructor(private readonly item: MigrationTreeItem) {
    super();
  }

  public async run() {
    return new RemoveMigrationAction(
      this.item.solutionFile.workspaceRoot,
      this.item.dbcontext,
      this.item.project,
    ).run();
  }
}
