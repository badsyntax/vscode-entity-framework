import * as vscode from 'vscode';
import { CommandProvider } from '../commands/CommandProvider';
import { RefreshTreeCommand } from '../commands/RefreshTreeCommand';
import { getCommandsConfig } from '../config/config';
import { TREE_VIEW_ID } from '../constants/constants';
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
    private readonly refresh?: boolean,
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

  public async run(): Promise<string> {
    return vscode.window.withProgress(
      {
        title: 'Running Migration...',
        location: { viewId: TREE_VIEW_ID },
        cancellable: true,
      },
      async (_progress, cancellationToken) => {
        cancellationToken.onCancellationRequested(() => {
          this.cancel();
        });
        await this.start();
        const output = await this.getOutput();

        const cacheId = DbContextTreeItem.getCacheId(
          this.workspaceRoot,
          this.project,
          this.dbContext,
        );
        dbContextsCache.clear(cacheId);

        if (this.refresh) {
          await vscode.commands.executeCommand(
            CommandProvider.getCommandName(RefreshTreeCommand.commandName),
            false,
          );
        }

        return output;
      },
    );
  }
}
