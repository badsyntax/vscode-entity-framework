import * as vscode from 'vscode';
import { RunMigrationAction } from '../actions/RunMigrationAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import {
  DbContextTreeItem,
  dbContextsCache,
} from '../treeView/DbContextTreeItem';
import type { MigrationTreeItem } from '../treeView/MigrationTreeItem';
import { Command } from './Command';
import { CommandProvider } from './CommandProvider';
import { RefreshTreeCommand } from './RefreshTreeCommand';

export class RunMigrationCommand extends Command {
  public static commandName = 'runMigration';

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
    await new RunMigrationAction(
      this.terminalProvider,
      this.item.workspaceRoot,
      this.item.dbContext,
      this.item.projectFile.name,
      this.item.migration.id,
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
