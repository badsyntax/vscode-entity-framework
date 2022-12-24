import { OpenMigrationFileAction } from '../actions/OpenMigrationFileAction';
import type { MigrationTreeItem } from '../treeView/MigrationTreeItem';
import { Command } from './Command';

export class OpenMigrationFileCommand extends Command {
  public static commandName = 'openMigrationFile';

  constructor(private readonly item?: MigrationTreeItem) {
    super();
  }

  public async run() {
    if (!this.item) {
      return;
    }
    return new OpenMigrationFileAction(
      this.item.workspaceRoot,
      this.item.migration,
    ).run();
  }
}
