import * as vscode from 'vscode';
import { EXTENSION_NAMESPACE } from '../constants/constants';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import type { DbContextTreeItem } from '../treeView/DbContextTreeItem';
import type { MigrationTreeItem } from '../treeView/MigrationTreeItem';
import type { ProjectTreeItem } from '../treeView/ProjectTreeItem';
import type { TreeDataProvider } from '../treeView/TreeDataProvider';
import { Disposable } from '../util/Disposable';
import type { Logger } from '../util/Logger';
import { AddMigrationCommand } from './AddMigrationCommand';
import type { Command } from './Command';
import { DBContextInfoCommand } from './DBContextInfoCommand';
import { GenerateERDCommand } from './GenerateERDCommand';
import { GenerateScriptCommand } from './GenerateScriptCommand';
import { OpenMigrationFileCommand } from './OpenMigrationFileCommand';
import { RefreshDbContextTreeCommand } from './RefreshDbContextTreeCommand';
import { RefreshProjectTreeCommand } from './RefreshProjectTreeCommand';
import { RefreshTreeCommand } from './RefreshTreeCommand';
import { RemoveMigrationsCommand } from './RemoveMigrationsCommand';
import { ResetMigrationsCommand } from './ResetMigrationsCommand';
import { RunMigrationCommand } from './RunMigrationCommand';
import { ScaffoldCommand } from './ScaffoldCommand';
import { UndoMigrationCommand } from './UndoMigrationCommand';
import { ConfigureCommand } from './ConfigureCommand';

export class CommandProvider extends Disposable {
  constructor(
    logger: Logger,
    treeDataProvider: TreeDataProvider,
    terminalProvider: TerminalProvider,
    extensionUri: vscode.Uri,
  ) {
    super();
    this.registerCommand(
      AddMigrationCommand.commandName,
      (item?: DbContextTreeItem) =>
        new AddMigrationCommand(terminalProvider, item),
    );
    this.registerCommand(
      RemoveMigrationsCommand.commandName,
      (item?: MigrationTreeItem) => {
        return new RemoveMigrationsCommand(terminalProvider, item);
      },
    );
    this.registerCommand(
      ResetMigrationsCommand.commandName,
      (item?: MigrationTreeItem) => {
        return new ResetMigrationsCommand(terminalProvider, item);
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
      GenerateERDCommand.commandName,
      (item?: DbContextTreeItem) =>
        new GenerateERDCommand(logger, terminalProvider, extensionUri, item),
    );
    this.registerCommand(
      RefreshTreeCommand.commandName,
      () => new RefreshTreeCommand(treeDataProvider),
    );
    this.registerCommand(
      RefreshTreeCommand.commandNameNoCache,
      () => new RefreshTreeCommand(treeDataProvider, true),
    );
    this.registerCommand(
      RefreshDbContextTreeCommand.commandName,
      (item?: DbContextTreeItem) => new RefreshDbContextTreeCommand(item),
    );
    this.registerCommand(
      RefreshProjectTreeCommand.commandName,
      (item?: ProjectTreeItem) => new RefreshProjectTreeCommand(item),
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
    this.registerCommand(
      ConfigureCommand.commandName,
      () => new ConfigureCommand(),
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
