import { AddMigrationAction } from '../actions/AddMigrationAction';
import { type DbContextTreeItem } from '../treeView/DbContextTreeItem';
import { Command } from './Command';

export class AddMigrationCommand extends Command {
  public static commandName = 'addMigration';

  constructor(private readonly item: DbContextTreeItem) {
    super();
  }

  public async run() {
    return new AddMigrationAction(
      this.item.solutionFile.workspaceRoot,
      this.item.label,
      this.item.project,
    ).run();
  }
}
