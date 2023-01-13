import * as vscode from 'vscode';
import { EFOutputParser } from '../cli/EFOutputParser';
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

export class AddMigrationAction extends TerminalAction {
  constructor(
    terminalProvider: TerminalProvider,
    private readonly workspaceRoot: string,
    private readonly dbContext: string,
    private readonly project: string,
    private readonly migrationName?: string,
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
    const migrationName =
      this.migrationName ||
      (await vscode.window.showInputBox({
        title: 'Enter Migration Name',
        prompt: 'EG: MigrationName',
        ignoreFocusOut: true,
      }));
    if (!migrationName) {
      return '';
    }
    return vscode.window.withProgress(
      {
        title: 'Adding Migration...',
        location: { viewId: TREE_VIEW_ID },
        cancellable: true,
      },
      async (_progress, cancellationToken) => {
        cancellationToken.onCancellationRequested(() => {
          this.cancel();
        });

        await this.start(
          {
            ...this.params,
            migrationName,
          },
          { asJson: true, removeDataFromOutput: true },
        );

        const output = await this.getOutput();
        const cacheId = DbContextTreeItem.getCacheId(
          this.workspaceRoot,
          this.project,
          this.dbContext,
        );
        dbContextsCache.clear(cacheId);
        const { data } = EFOutputParser.parse(output);
        const parsedData = JSON.parse(data);
        await vscode.commands.executeCommand(
          'vscode.open',
          vscode.Uri.file(parsedData.migrationFile),
        );
        await vscode.commands.executeCommand(
          CommandProvider.getCommandName(RefreshTreeCommand.commandName),
          false,
        );
        return output;
      },
    );
  }
}
