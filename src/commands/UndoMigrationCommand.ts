import { RunMigrationAction } from '../actions/RunMigrationAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import {
  dbContextsCache,
  DbContextTreeItem,
} from '../treeView/DbContextTreeItem';
import type { MigrationTreeItem } from '../treeView/MigrationTreeItem';
import { Command } from './Command';

export class UndoMigrationCommand extends Command {
  public static commandName = 'undoMigration';

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
    const cacheId = DbContextTreeItem.getCacheId(
      this.item.solutionFile.workspaceRoot,
      this.item.project,
      this.item.dbcontext,
    );
    const migrations = dbContextsCache.get(cacheId);
    if (migrations) {
      const index = migrations.indexOf(this.item);
      const migrationId =
        index === 0 ? '0' : migrations[index - 1].migration.id;
      return new RunMigrationAction(
        this.terminalProvider,
        this.item.solutionFile.workspaceRoot,
        this.item.dbcontext,
        this.item.project,
        migrationId,
      ).run();
    }
  }
}
