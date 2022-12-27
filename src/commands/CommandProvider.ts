import * as vscode from 'vscode';
import { EXTENSION_NAMESPACE } from '../constants/constants';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import type { DbContextTreeItem } from '../treeView/DbContextTreeItem';
import type { MigrationTreeItem } from '../treeView/MigrationTreeItem';
import type { TreeDataProvider } from '../treeView/TreeDataProvider';
import { Disposable } from '../util/Disposable';
import { AddMigrationCommand } from './AddMigrationCommand';
import type { Command } from './Command';
import { DBContextInfoCommand } from './DBContextInfoCommand';
import { GenerateScriptCommand } from './GenerateScriptCommand';
import { OpenMigrationFileCommand } from './OpenMigrationFileCommand';
import { RefreshTreeCommand } from './RefreshTreeCommand';
import { RemoveMigrationCommand } from './RemoveMigrationCommand';
import { RunMigrationCommand } from './RunMigrationCommand';
import { ScaffoldCommand } from './ScaffoldCommand';
import { UndoMigrationCommand } from './UndoMigrationCommand';

export class CommandProvider extends Disposable {
  constructor(
    treeDataProvider: TreeDataProvider,
    terminalProvider: TerminalProvider,
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
      UndoMigrationCommand.commandName,
      (item?: MigrationTreeItem) =>
        new UndoMigrationCommand(terminalProvider, item),
    );
    this.registerCommand(
      GenerateScriptCommand.commandName,
      (item?: DbContextTreeItem) =>
        new GenerateScriptCommand(terminalProvider, item),
    );
    this.registerCommand(
      RefreshTreeCommand.commandName,
      (clearCache: boolean) =>
        new RefreshTreeCommand(treeDataProvider, clearCache),
    );
    this.registerCommand(
      OpenMigrationFileCommand.commandName,
      (item?: MigrationTreeItem) => new OpenMigrationFileCommand(item),
    );
    this.registerCommand(
      DBContextInfoCommand.commandName,
      (item?: DbContextTreeItem) =>
        new DBContextInfoCommand(terminalProvider, item),
    );
    this.registerCommand(
      ScaffoldCommand.commandName,
      (item?: DbContextTreeItem) => new ScaffoldCommand(terminalProvider, item),
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
