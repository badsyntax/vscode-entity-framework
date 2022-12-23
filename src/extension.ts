import type * as vscode from 'vscode';

import { TreeDataProvider } from './treeView/TreeDataProvider';
import { CommandProvider } from './commands/CommandProvider';
import { MigrationTreeItemDecorationProvider } from './treeView/MigrationTreeItemDecorationProvider';
import { DbContextModelSnapshotWatcher } from './util/DbContextModelSnapshotWatcher';
import { SolutionFinder } from './solution/SolutionProvider';
import { Terminal } from './terminal/Terminal';
import { TerminalProvider } from './terminal/TerminalProvider';

const subscriptions: vscode.Disposable[] = [];

export async function activate(_context: vscode.ExtensionContext) {
  const solutionFiles = await SolutionFinder.getSolutionFiles();
  const terminal = new Terminal();
  // const terminal = vscode.window.createTerminal({
  //   name: `EF Migrations`,
  //   pty,
  // });
  const terminalProvider = new TerminalProvider(terminal);
  const dbContextModelContextWatcher = new DbContextModelSnapshotWatcher(
    solutionFiles,
  );
  const migrationTreeItemDecorationProvider =
    new MigrationTreeItemDecorationProvider();
  const treeDataProvider = new TreeDataProvider(solutionFiles);
  const commandProvider = new CommandProvider(
    treeDataProvider,
    terminalProvider,
  );

  // terminal.show();

  // pty.setAction(async terminal => {
  //   terminal.write('NEW Type and press enter to echo the text\r\n\r\n');
  //   await new Promise<undefined>(res => setTimeout(() => res(undefined), 2000));
  //   terminal.write('Done\n');
  // });

  // pty.onDidOpen(async () => {
  //   await pty.exec();
  // });

  subscriptions.push(
    dbContextModelContextWatcher,
    migrationTreeItemDecorationProvider,
    treeDataProvider,
    commandProvider,
    terminalProvider,
  );
}

export function deactivate() {
  subscriptions.forEach(subscription => subscription.dispose());
}
