import * as vscode from 'vscode';
import { ResetMigrationsAction } from '../actions/ResetMigrationsAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import {
  DbContextTreeItem,
  dbContextsCache,
} from '../treeView/DbContextTreeItem';

import { type MigrationTreeItem } from '../treeView/MigrationTreeItem';
import { Command } from './Command';
import { CommandProvider } from './CommandProvider';
import { RefreshTreeCommand } from './RefreshTreeCommand';

export class ResetMigrationsCommand extends Command {
  public static commandName = 'resetMigrations';

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
    await new ResetMigrationsAction(
      this.terminalProvider,
      this.item.workspaceRoot,
      this.item.dbContext,
      this.item.projectFile.name,
      this.item,
    ).run();
    const cacheId = DbContextTreeItem.getCacheId(
      this.item.workspaceRoot,
      this.item.projectFile.name,
      this.item.label,
    );
    dbContextsCache.clear(cacheId);
    await vscode.commands.executeCommand(
      CommandProvider.getCommandName(RefreshTreeCommand.commandName),
    );
  }
}
