import * as vscode from 'vscode';
import { type TreeItem } from './TreeItem';
import { Disposable } from '../util/Disposable';
import { EXTENSION_NAMESPACE } from '../constants/constants';
import { ProjectTreeItem } from './ProjectTreeItem';
import type { CLI } from '../cli/CLI';
import { MigrationTreeItem } from './MigrationTreeItem';
import { CommandProvider } from '../commands/CommandProvider';
import { OpenMigrationFileCommand } from '../commands/OpenMigrationFileCommand';
import type { Logger } from '../util/Logger';
import { getProjectsConfig } from '../config/config';
import { ProjectFilesProvider } from '../solution/ProjectFilesProvider';
import { TreeItemCache } from './TreeItemCache';
import { clearTreeCache } from './treeCache';

export const treeDataProviderCache = new TreeItemCache<ProjectTreeItem[]>();

export class TreeDataProvider
  extends Disposable
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private readonly cacheId: string;

  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItem | undefined | null | void
  > = new vscode.EventEmitter<TreeItem | undefined | null | void>();

  public readonly onDidChangeTreeData: vscode.Event<
    TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(
    private readonly logger: Logger,
    private readonly cli: CLI,
  ) {
    super();
    this.cacheId = 'TreeDataProvider';
    const view = vscode.window.createTreeView(`${EXTENSION_NAMESPACE}Tree`, {
      treeDataProvider: this,
      showCollapseAll: true,
    });
    view.onDidChangeSelection(this.handleTreeItemSelection.bind(this));
    this.subscriptions.push(view);

    var onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration(
      e => {
        if (e.affectsConfiguration(EXTENSION_NAMESPACE)) {
          this.refresh();
        }
      },
    );
    this.subscriptions.push(onDidChangeConfiguration);
  }

  private async handleTreeItemSelection(
    e: vscode.TreeViewSelectionChangeEvent<vscode.TreeItem>,
  ) {
    if (
      e.selection.length === 1 &&
      e.selection[0] instanceof MigrationTreeItem
    ) {
      await vscode.commands.executeCommand(
        CommandProvider.getCommandName(OpenMigrationFileCommand.commandName),
        e.selection[0],
      );
    }
  }

  public refresh(clearCache = false): void {
    if (clearCache) {
      clearTreeCache();
    }
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  public async getChildren(element?: TreeItem): Promise<vscode.TreeItem[]> {
    if (element) {
      return element.getChildren();
    } else {
      const cachedChildren = treeDataProviderCache.get(this.cacheId);

      if (cachedChildren) {
        return cachedChildren;
      }

      const { project } = getProjectsConfig();
      const { projectFiles } = await ProjectFilesProvider.getProjectFiles();

      const projectItems = projectFiles
        .filter(projectFile => !project || projectFile.name === project)
        .map(
          projectFile =>
            new ProjectTreeItem(this.logger, projectFile, this.cli),
        );

      treeDataProviderCache.set(this.cacheId, projectItems);
      return projectItems;
    }
  }
}
