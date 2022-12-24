import * as vscode from 'vscode';
import { getIconPath } from './iconProvider';
// import { ProjectTreeItem } from './ProjectTreeItem';
import type { SolutionFile } from '../types/SolutionFile';

export class SolutionTreeItem extends vscode.TreeItem {
  constructor(
    private readonly solutionFile: SolutionFile,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.Collapsed,
  ) {
    super(solutionFile.name, collapsibleState);
    this.iconPath = getIconPath('sln.svg');
  }

  // async getChildren(): Promise<ProjectTreeItem[]> {
  //   return Promise.resolve(
  //     this.solutionFile.solution.projects
  //       .filter(project =>
  //         (project.packages || []).find(
  //           pkg => pkg.name === 'Microsoft.EntityFrameworkCore.Design',
  //         ),
  //       )
  //       .map(project => new ProjectTreeItem(project.name, this.solutionFile)),
  //   );
  // }
}
