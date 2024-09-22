import * as vscode from 'vscode';

import { RemoveMigrationsAction } from '../actions/RemoveMigrationsAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import {
  DbContextTreeItem,
  dbContextsCache,
} from '../treeView/DbContextTreeItem';
import { type MigrationTreeItem } from '../treeView/MigrationTreeItem';
import { Command } from './Command';
import { CommandProvider } from './CommandProvider';
import { RefreshTreeCommand } from './RefreshTreeCommand';

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
    const migrations = await new RemoveMigrationsAction(
      this.terminalProvider,
      this.item.workspaceRoot,
      this.item.dbContext,
      this.item.projectFile.name,
      this.item,
    ).run();
    if (Number(migrations) > 0) {
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
