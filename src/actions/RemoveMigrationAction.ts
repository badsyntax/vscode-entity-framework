import * as vscode from 'vscode';
import { CommandProvider } from '../commands/CommandProvider';
import { RefreshTreeCommand } from '../commands/RefreshTreeCommand';
import { getCommandsConfig } from '../config/config';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import {
  dbContextsCache,
  DbContextTreeItem,
} from '../treeView/DbContextTreeItem';
import { TerminalAction } from './TerminalAction';

export class RemoveMigrationAction extends TerminalAction {
  constructor(
    terminalProvider: TerminalProvider,
    private readonly workspaceRoot: string,
    private readonly dbContext: string,
    private readonly project: string,
  ) {
    super(
      terminalProvider,
      getCommandsConfig().removeMigration,
      {
        dbContext,
        project,
      },
      workspaceRoot,
    );
  }

  public async run() {
    await super.run();
    const cacheId = DbContextTreeItem.getCacheId(
      this.workspaceRoot,
      this.project,
      this.dbContext,
    );
    dbContextsCache.clear(cacheId);
    await vscode.commands.executeCommand(
      CommandProvider.getCommandName(RefreshTreeCommand.commandName),
      false,
    );
  }
}
