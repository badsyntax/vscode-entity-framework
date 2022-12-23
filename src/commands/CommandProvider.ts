import * as vscode from 'vscode';
import { EXTENSION_NAMESPACE } from '../constants/constants';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import type { DbContextTreeItem } from '../treeView/DbContextTreeItem';
import type { MigrationTreeItem } from '../treeView/MigrationTreeItem';
import type { TreeDataProvider } from '../treeView/TreeDataProvider';
import { Disposable } from '../util/Disposable';
import { AddMigrationCommand } from './AddMigrationCommand';
import type { Command } from './Command';
import { GenerateScriptCommand } from './GenerateScriptCommand';
import { RefreshTreeCommand } from './RefreshTreeCommand';
import { RemoveMigrationCommand } from './RemoveMigrationCommand';
import { RunMigrationCommand } from './RunMigrationCommand';
import { RunMigrationsCommand } from './RunMigrationsCommand';

export class CommandProvider extends Disposable {
  constructor(
    private readonly treeDataProvider: TreeDataProvider,
    private readonly terminalProvider: TerminalProvider,
  ) {
    super();
    this.registerCommand(
      AddMigrationCommand.commandName,
      (item?: DbContextTreeItem) =>
        new AddMigrationCommand(terminalProvider, item),
    );
    this.registerCommand(
      RemoveMigrationCommand.commandName,
      (item?: MigrationTreeItem) => {
        return new RemoveMigrationCommand(terminalProvider, item);
      },
    );
    this.registerCommand(
      RunMigrationCommand.commandName,
      (item?: MigrationTreeItem) =>
        new RunMigrationCommand(terminalProvider, item),
    );
    this.registerCommand(
      RunMigrationsCommand.commandName,
      (item?: MigrationTreeItem) =>
        new RunMigrationsCommand(terminalProvider, item),
    );
    this.registerCommand(
      GenerateScriptCommand.commandName,
      (item?: DbContextTreeItem) =>
        new GenerateScriptCommand(terminalProvider, item),
    );
    this.registerCommand(
      RefreshTreeCommand.commandName,
      (clearCache: boolean) =>
        new RefreshTreeCommand(this.treeDataProvider, clearCache),
    );
  }

  public static getCommandName(name: string) {
    return `${EXTENSION_NAMESPACE}.${name}`;
  }

  private registerCommand(
    name: string,
    getCommand: (...args: any[]) => Command,
  ) {
    this.subscriptions.push(
      vscode.commands.registerCommand(
        CommandProvider.getCommandName(name),
        (...args: any[]) => getCommand(...args).run(),
      ),
    );
  }
}
