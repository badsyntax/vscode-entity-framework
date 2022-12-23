import * as vscode from 'vscode';
import { CommandProvider } from '../commands/CommandProvider';
import { RefreshTreeCommand } from '../commands/RefreshTreeCommand';
import { defaultTerminalCommands } from '../terminal/defaultTerminalCommands';
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
    private readonly dbcontext: string,
    private readonly project: string,
    migrationId: string,
  ) {
    super(
      terminalProvider,
      defaultTerminalCommands.runMigration,
      {
        dbcontext,
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
      this.dbcontext,
    );
    dbContextsCache.clear(cacheId);

    await vscode.commands.executeCommand(
      CommandProvider.getCommandName(RefreshTreeCommand.commandName),
      false,
    );
  }
}
