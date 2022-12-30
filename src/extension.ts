import type * as vscode from 'vscode';
import { TreeDataProvider } from './treeView/TreeDataProvider';
import { CommandProvider } from './commands/CommandProvider';
import { MigrationTreeItemDecorationProvider } from './treeView/MigrationTreeItemDecorationProvider';
import { Terminal } from './terminal/Terminal';
import { TerminalProvider } from './terminal/TerminalProvider';
import { TextDocumentProvider } from './util/TextDocumentProvider';
import { ProjectFilesProvider } from './solution/ProjectFilesProvider';
import { Logger } from './util/Logger';
import { CLI } from './cli/CLI';

export async function activate(context: vscode.ExtensionContext) {
  const logger = new Logger();
  logger.info(`Extension activated`);

  const { projectFiles, solutionProjects } =
    await ProjectFilesProvider.getProjectFiles();
  logger.info(`Discovered ${projectFiles.length} compatible projects`);

  const cli = new CLI(logger);
  const textDocumentProvider = new TextDocumentProvider();
  const migrationTreeItemDecorationProvider =
    new MigrationTreeItemDecorationProvider();
  const treeDataProvider = new TreeDataProvider(logger, projectFiles, cli);
  const terminalProvider = new TerminalProvider(new Terminal(cli));
  const commandProvider = new CommandProvider(
    logger,
    treeDataProvider,
    terminalProvider,
    context.extensionUri,
    solutionProjects,
  );

  context.subscriptions.push(
    migrationTreeItemDecorationProvider,
    treeDataProvider,
    commandProvider,
    terminalProvider,
    textDocumentProvider,
  );
}

export function deactivate() {}
