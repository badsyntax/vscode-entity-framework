import * as vscode from 'vscode';
import { getIconPath } from './iconProvider';
import type { SolutionFile } from '../types/SolutionFile';
import type { ProjectTreeItem } from './ProjectTreeItem';

export class SolutionTreeItem extends vscode.TreeItem {
  constructor(
    private readonly solutionFile: SolutionFile,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.Collapsed,
  ) {
    super(solutionFile.name, collapsibleState);
    this.iconPath = getIconPath('sln.svg');
  }

  async getChildren(): Promise<ProjectTreeItem[]> {
    return Promise.resolve([]);
  }
}
