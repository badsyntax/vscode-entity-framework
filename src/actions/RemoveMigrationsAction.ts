import * as vscode from 'vscode';
import { CommandProvider } from '../commands/CommandProvider';
import { RefreshTreeCommand } from '../commands/RefreshTreeCommand';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import type { MigrationTreeItem } from '../treeView/MigrationTreeItem';
import type { IAction } from './IAction';
import { RemoveMigrationAction } from './RemoveMigrationAction';

export class RemoveMigrationsAction implements IAction {
  constructor(
    private readonly terminalProvider: TerminalProvider,
    private readonly workspaceRoot: string,
    private readonly dbContext: string,
    private readonly project: string,
    private readonly migrationsToRemove: MigrationTreeItem[],
  ) {}

  public async run() {
    for (let i = 0; i < this.migrationsToRemove.length; i++) {
      await new RemoveMigrationAction(
        this.terminalProvider,
        this.workspaceRoot,
        this.dbContext,
        this.project,
        false,
      ).run();
    }
    if (this.migrationsToRemove.length > 0) {
      await vscode.commands.executeCommand(
        CommandProvider.getCommandName(RefreshTreeCommand.commandName),
        false,
      );
    }
  }
}
