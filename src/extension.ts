import type * as vscode from 'vscode';

import { TreeDataProvider } from './treeView/TreeDataProvider';
import { CommandProvider } from './commands/CommandProvider';
import { MigrationTreeItemDecorationProvider } from './treeView/MigrationTreeItemDecorationProvider';
import { DbContextModelSnapshotWatcher } from './util/DbContextModelSnapshotWatcher';
import { SolutionFinder } from './solution/SolutionProvider';

const subscriptions: vscode.Disposable[] = [];

export async function activate(_context: vscode.ExtensionContext) {
  const solutionFiles = await SolutionFinder.getSolutionFiles();
  const dbContextModelContextWatcher = new DbContextModelSnapshotWatcher(
    solutionFiles,
  );
  const migrationTreeItemDecorationProvider =
    new MigrationTreeItemDecorationProvider();
  const treeDataProvider = new TreeDataProvider(solutionFiles);
  const commandProvider = new CommandProvider(treeDataProvider);

  subscriptions.push(
    dbContextModelContextWatcher,
    migrationTreeItemDecorationProvider,
    treeDataProvider,
    commandProvider,
  );
}

export function deactivate() {
  subscriptions.forEach(subscription => subscription.dispose());
}
