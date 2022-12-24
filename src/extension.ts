import * as vscode from 'vscode';

import { TreeDataProvider } from './treeView/TreeDataProvider';
import { CommandProvider } from './commands/CommandProvider';
import { MigrationTreeItemDecorationProvider } from './treeView/MigrationTreeItemDecorationProvider';
import { Terminal } from './terminal/Terminal';
import { TerminalProvider } from './terminal/TerminalProvider';
import { ScriptFileProvider } from './util/ScriptFileProvider';
import { ProjectFilesProvider } from './solution/ProjectFilesProvider';
import { Logger } from './util/Logger';
import { OUTPUT_CHANNEL_ID } from './constants/constants';
import { CLI } from './cli/CLI';

const subscriptions: vscode.Disposable[] = [];

export async function activate(_context: vscode.ExtensionContext) {
  const logger = new Logger();
  logger.setLoggingChannel(
    vscode.window.createOutputChannel(OUTPUT_CHANNEL_ID),
  );

  const cli = new CLI(logger);
  const projectFiles = await ProjectFilesProvider.getProjectFiles();
  const scriptFileProvider = new ScriptFileProvider();
  const migrationTreeItemDecorationProvider =
    new MigrationTreeItemDecorationProvider();
  const treeDataProvider = new TreeDataProvider(projectFiles, cli);
  const terminalProvider = new TerminalProvider(new Terminal(cli));
  const commandProvider = new CommandProvider(
    treeDataProvider,
    terminalProvider,
  );
  subscriptions.push(
    migrationTreeItemDecorationProvider,
    treeDataProvider,
    commandProvider,
    terminalProvider,
    scriptFileProvider,
  );
}

export function deactivate() {
  subscriptions.forEach(subscription => subscription.dispose());
}
