import * as vscode from 'vscode';

import type { DbContext } from '../types/DbContext';
import { DbContextTreeItem } from './DbContextTreeItem';
import { getIconPath } from './iconProvider';

import { TreeItem } from './TreeItem';
import { execEF, extractDataFromStdOut } from '../cli/ef';
import { TreeItemCache } from './TreeItemCache';
import type { SolutionFile } from '../types/SolutionFile';

export const projectsCache = new TreeItemCache<DbContextTreeItem[]>();

export class ProjectTreeItem extends TreeItem {
  private readonly cacheId: string;
  constructor(
    public readonly label: string,
    solutionFile: SolutionFile,
    collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.Collapsed,
  ) {
    super(label, solutionFile, collapsibleState);
    this.iconPath = getIconPath('csproj.svg');
    this.cacheId = ProjectTreeItem.getCacheId(
      solutionFile.workspaceRoot,
      this.label,
    );
  }

  public static getCacheId(workspaceRoot: string, label: string) {
    return [workspaceRoot, label].join('-');
  }

  async getChildren(): Promise<DbContextTreeItem[]> {
    const cachedChildren = projectsCache.get(this.cacheId);

    if (cachedChildren) {
      return cachedChildren;
    }

    try {
      const output = await execEF(
        `dbcontext list --project ${this.label} --no-color --json --prefix-output`,
        this.solutionFile.workspaceRoot,
      );
      const dbContexts = JSON.parse(
        extractDataFromStdOut(output),
      ) as DbContext[];
      const children = dbContexts.map(
        dbContext =>
          new DbContextTreeItem(
            dbContext.name,
            this.solutionFile,
            this.label,
            vscode.TreeItemCollapsibleState.Collapsed,
          ),
      );
      projectsCache.set(this.cacheId, children);
      return children;
    } catch (e) {
      await vscode.window.showErrorMessage(
        `Unable to get dbcontexts: ${(e as Error).message}`,
      );
      return [];
    }
  }
}
