import * as vscode from 'vscode';
import { CommandProvider } from '../commands/CommandProvider';
import { RefreshTreeCommand } from '../commands/RefreshTreeCommand';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import {
  dbContextsCache,
  DbContextTreeItem,
} from '../treeView/DbContextTreeItem';
import type { MigrationTreeItem } from '../treeView/MigrationTreeItem';
import type { IAction } from './IAction';
import { RemoveMigrationAction } from './RemoveMigrationAction';

export class RemoveMigrationsAction implements IAction {
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
    const migrationsToRemove = migrations?.slice(index) || [];
    for (let i = 0; i < migrationsToRemove.length; i++) {
      await new RemoveMigrationAction(
        this.terminalProvider,
        this.workspaceRoot,
        this.dbContext,
        this.project,
        false,
      ).run();
    }
    if (migrationsToRemove.length > 0) {
      await vscode.commands.executeCommand(
        CommandProvider.getCommandName(RefreshTreeCommand.commandName),
        false,
      );
    }
  }
}
