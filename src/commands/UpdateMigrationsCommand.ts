import { UpdateMigrationsAction } from '../actions/UpdateMigrationsAction';
import { type DbContextTreeItem } from '../treeView/DbContextTreeItem';
import { Command } from './Command';

export class UpdateMigrationsCommand extends Command {
  public static commandName = 'updateMigrations';

  constructor(private readonly item: DbContextTreeItem) {
    super();
  }

  public async run() {
    return new UpdateMigrationsAction(this.item.label, this.item.project).run();
  }
}
