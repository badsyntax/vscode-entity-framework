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

export class AddMigrationAction extends TerminalAction {
  constructor(
    terminalProvider: TerminalProvider,
    private readonly workspaceRoot: string,
    private readonly dbContext: string,
    private readonly project: string,
  ) {
    super(
      terminalProvider,
      getCommandsConfig().addMigration,
      {
        dbContext,
        project,
      },
      workspaceRoot,
    );
  }

  public async run() {
    const migrationName = await vscode.window.showInputBox({
      title: 'Enter Migration Name',
      placeHolder: 'eg MigrationName',
      prompt: 'For example: MigrationName',
    });
    if (!migrationName) {
      return '';
    }
    const output = await super.run({
      ...this.params,
      migrationName,
    });
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
    return output;
  }
}
