import * as vscode from 'vscode';
import { getCommandsConfig } from '../config/config';

import type { TerminalProvider } from '../terminal/TerminalProvider';
import { TerminalAction } from './TerminalAction';

export class AddMigrationAction extends TerminalAction {
  constructor(
    terminalProvider: TerminalProvider,
    workspaceRoot: string,
    dbContext: string,
    project: string,
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
      return;
    }
    return super.run({
      ...this.params,
      migrationName,
    });
  }
}
