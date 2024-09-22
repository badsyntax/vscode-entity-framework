import * as vscode from 'vscode';
import { AddMigrationAction } from '../actions/AddMigrationAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import {
  dbContextsCache,
  DbContextTreeItem,
} from '../treeView/DbContextTreeItem';
import { Command } from './Command';
import { CommandProvider } from './CommandProvider';
import { RefreshTreeCommand } from './RefreshTreeCommand';

export class AddMigrationCommand extends Command {
  public static commandName = 'addMigration';

  constructor(
    private readonly terminalProvider: TerminalProvider,
    private readonly item?: DbContextTreeItem,
  ) {
    super();
  }

  public async run() {
    if (!this.item) {
      return;
    }
    await new AddMigrationAction(
      this.terminalProvider,
      this.item.workspaceRoot,
      this.item.label,
      this.item.projectFile.name,
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
