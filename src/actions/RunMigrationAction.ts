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

export class RunMigrationAction extends TerminalAction {
  constructor(
    terminalProvider: TerminalProvider,
    private readonly workspaceRoot: string,
    private readonly dbContext: string,
    private readonly project: string,
    migrationId: string,
  ) {
    super(
      terminalProvider,
      getCommandsConfig().runMigration,
      {
        dbContext,
        project,
        migrationId,
      },
      workspaceRoot,
    );
  }

  public async run(params = this.params): Promise<void> {
    await super.run(params);

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
