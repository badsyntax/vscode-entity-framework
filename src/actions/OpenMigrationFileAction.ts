import * as vscode from 'vscode';

import type { Migration } from '../types/Migration';
import type { IAction } from './IAction';

export class OpenMigrationFileAction implements IAction {
  constructor(
    private readonly workspaceRoot: string,
    private readonly migration: Migration,
  ) {}

  public async run() {
    // The ef cli does not give us any information about migration file paths,
    // which is why we have to find it ourselves.
    const [migrationFile] = await vscode.workspace.findFiles(
      new vscode.RelativePattern(
        this.workspaceRoot,
        `**/${this.migration.id}.cs`,
      ),
      undefined,
      1,
    );
    if (migrationFile) {
      await vscode.commands.executeCommand('vscode.open', migrationFile);
    }
  }
}
