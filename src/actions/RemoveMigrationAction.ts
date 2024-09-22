import * as vscode from 'vscode';
import { getCommandsConfig } from '../config/config';
import { TREE_VIEW_ID } from '../constants/constants';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { TerminalAction } from './TerminalAction';

export class RemoveMigrationAction extends TerminalAction {
  constructor(
    terminalProvider: TerminalProvider,
    readonly workspaceRoot: string,
    readonly dbContext: string,
    readonly project: string,
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
    return vscode.window.withProgress(
      {
        title: 'Removing Migration...',
        location: { viewId: TREE_VIEW_ID },
        cancellable: true,
      },
      async (_progress, cancellationToken) => {
        cancellationToken.onCancellationRequested(() => {
          this.cancel();
        });
        await this.start();
        return await this.getOutput();
      },
    );
  }
}
