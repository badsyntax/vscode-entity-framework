import * as vscode from 'vscode';
import { type TreeItem } from './TreeItem';
import { Disposable } from '../util/Disposable';
import { EXTENSION_NAMESPACE } from '../constants/constants';
import type { ProjectFile } from '../types/ProjectFile';
import { ProjectTreeItem } from './ProjectTreeItem';

export class TreeDataProvider
  extends Disposable
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItem | undefined | null | void
  > = new vscode.EventEmitter<TreeItem | undefined | null | void>();

  public readonly onDidChangeTreeData: vscode.Event<
    TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private readonly projectFiles: ProjectFile[]) {
    super();
    this.subscriptions.push(
      vscode.window.registerTreeDataProvider(
        `${EXTENSION_NAMESPACE}Tree`,
        this,
      ),
    );
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  public async getChildren(element?: TreeItem): Promise<vscode.TreeItem[]> {
    if (element) {
      return element.getChildren();
    } else {
      return this.projectFiles.map(
        projectFile => new ProjectTreeItem(projectFile.name, projectFile),
      );
      // return this.solutionFiles.map(
      //   solutionFile => new SolutionTreeItem(solutionFile),
      // );
    }
  }
}
