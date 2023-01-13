import * as vscode from 'vscode';
import { UndoMigrationCommand } from '../commands/UndoMigrationCommand';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import {
  dbContextsCache,
  DbContextTreeItem,
} from '../treeView/DbContextTreeItem';
import type { MigrationTreeItem } from '../treeView/MigrationTreeItem';
import { AddMigrationAction } from './AddMigrationAction';
import type { IAction } from './IAction';
import { RemoveMigrationAction } from './RemoveMigrationAction';

export class ResetMigrationsAction implements IAction {
  constructor(
    private readonly terminalProvider: TerminalProvider,
    private readonly workspaceRoot: string,
    private readonly dbContext: string,
    private readonly project: string,
    private readonly item: MigrationTreeItem,
  ) {}

  public async run() {
    const migrations = dbContextsCache.get(
      DbContextTreeItem.getCacheId(
        this.workspaceRoot,
        this.project,
        this.dbContext,
      ),
    );
    const index = (migrations || []).indexOf(this.item);
    if (index === -1) {
      return;
    }
    const migrationsToReset = migrations?.slice(index) || [];
    if (!migrationsToReset.length) {
      return;
    }
    const options = ['Yes', 'Cancel'] as const;
    const answer = await vscode.window.showInformationMessage(
      'Any manual migration modifications will be lost! Are you sure you want to do this?',
      ...options,
    );
    if (answer === 'Cancel') {
      return;
    }
    const migrationName = await vscode.window.showInputBox({
      title: 'Enter Migration Name',
      prompt: 'EG: MigrationName',
      ignoreFocusOut: true,
    });
    if (!migrationName) {
      return '';
    }
    await new UndoMigrationCommand(
      this.terminalProvider,
      this.item,
      false,
    ).run();
    for (let i = 0; i < migrationsToReset.length; i++) {
      await new RemoveMigrationAction(
        this.terminalProvider,
        this.workspaceRoot,
        this.dbContext,
        this.project,
        false,
      ).run();
    }
    await new AddMigrationAction(
      this.terminalProvider,
      this.workspaceRoot,
      this.dbContext,
      this.project,
      migrationName,
    ).run();
  }
}
