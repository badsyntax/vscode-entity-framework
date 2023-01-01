import { RemoveMigrationsAction } from '../actions/RemoveMigrationsAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import {
  dbContextsCache,
  DbContextTreeItem,
} from '../treeView/DbContextTreeItem';
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
    const migrations = dbContextsCache.get(
      DbContextTreeItem.getCacheId(
        this.item.workspaceRoot,
        this.item.projectFile.name,
        this.item.dbContext,
      ),
    );
    const index = migrations?.indexOf(this.item) || -1;
    if (index === -1) {
      return;
    }
    const migrationsToRemove = migrations?.slice(index) || [];
    return new RemoveMigrationsAction(
      this.terminalProvider,
      this.item.workspaceRoot,
      this.item.dbContext,
      this.item.projectFile.name,
      migrationsToRemove,
    ).run();
  }
}
