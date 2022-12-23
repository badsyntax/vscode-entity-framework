import * as vscode from 'vscode';
import { EXTENSION_NAMESPACE } from '../constants/constants';
import type { DbContextTreeItem } from '../treeView/DbContextTreeItem';
import type { MigrationTreeItem } from '../treeView/MigrationTreeItem';
import type { TreeDataProvider } from '../treeView/TreeDataProvider';
import { Disposable } from '../util/Disposable';
import { AddMigrationCommand } from './AddMigrationCommand';
import type { Command } from './Command';
import { GenerateScriptCommand } from './GenerateScriptCommand';
import { RefreshTreeCommand } from './RefreshTreeCommand';
import { RemoveMigrationCommand } from './RemoveMigrationCommand';
import { UpdateMigrationsCommand } from './UpdateMigrationsCommand';

export class CommandProvider extends Disposable {
  constructor(private readonly treeDataProvider: TreeDataProvider) {
    super();
    this.registerCommand(
      AddMigrationCommand.commandName,
      (item: DbContextTreeItem) => new AddMigrationCommand(item),
    );
    this.registerCommand(
      RemoveMigrationCommand.commandName,
      (item: MigrationTreeItem) => new RemoveMigrationCommand(item),
    );
    this.registerCommand(
      UpdateMigrationsCommand.commandName,
      (item: DbContextTreeItem) => new UpdateMigrationsCommand(item),
    );
    this.registerCommand(
      GenerateScriptCommand.commandName,
      (item: DbContextTreeItem) => new GenerateScriptCommand(item),
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
