import * as vscode from 'vscode';
import { RunMigrationAction } from '../actions/RunMigrationAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import {
  dbContextsCache,
  DbContextTreeItem,
} from '../treeView/DbContextTreeItem';
import type { MigrationTreeItem } from '../treeView/MigrationTreeItem';
import { Command } from './Command';
import { CommandProvider } from './CommandProvider';
import { RefreshTreeCommand } from './RefreshTreeCommand';

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
      this.item.workspaceRoot,
      this.item.projectFile.name,
      this.item.dbContext,
    );
    const migrations = dbContextsCache.get(cacheId);
    if (migrations) {
      const index = migrations.indexOf(this.item);
      const migrationId =
        index === 0 ? '0' : migrations[index - 1].migration.id;
      await new RunMigrationAction(
        this.terminalProvider,
        this.item.workspaceRoot,
        this.item.dbContext,
        this.item.projectFile.name,
        migrationId,
      ).run();
      const cacheId = DbContextTreeItem.getCacheId(
        this.item.workspaceRoot,
        this.item.projectFile.name,
        this.item.dbContext,
      );
      dbContextsCache.clear(cacheId);
      await vscode.commands.executeCommand(
        CommandProvider.getCommandName(RefreshTreeCommand.commandName),
      );
    }
  }
}
