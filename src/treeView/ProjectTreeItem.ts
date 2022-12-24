import * as vscode from 'vscode';
import path from 'node:path';
import type { DbContext } from '../types/DbContext';
import { DbContextTreeItem } from './DbContextTreeItem';
import { getIconPath } from './iconProvider';

import { TreeItem } from './TreeItem';
import { execEF, getDataFromStdOut } from '../cli/ef';
import { TreeItemCache } from './TreeItemCache';
import type { ProjectFile } from '../types/ProjectFile';

export const projectsCache = new TreeItemCache<DbContextTreeItem[]>();

export class ProjectTreeItem extends TreeItem {
  private readonly cacheId: string;
  constructor(
    public readonly label: string,
    private readonly projectFile: ProjectFile,
    collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.Collapsed,
  ) {
    super(label, projectFile.workspaceRoot, collapsibleState);
    this.iconPath = getIconPath('csproj.svg');
    this.cacheId = ProjectTreeItem.getCacheId(
      projectFile.workspaceRoot,
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

    const projectFileDir = path.resolve(path.dirname(this.projectFile.path));
    const workspaceRootDir = path.resolve(this.workspaceRoot);
    const isRootProject = projectFileDir === workspaceRootDir;
    const project = isRootProject ? '.' : this.label;

    try {
      const output = await execEF(
        `dbcontext list --project ${project} --no-color --json --prefix-output`,
        this.projectFile.workspaceRoot,
      );
      const dbContexts = JSON.parse(getDataFromStdOut(output)) as DbContext[];
      const children = dbContexts.map(
        dbContext =>
          new DbContextTreeItem(
            dbContext.name,
            this.projectFile,
            project,
            vscode.TreeItemCollapsibleState.Collapsed,
          ),
      );
      projectsCache.set(this.cacheId, children);
      return children;
    } catch (e) {
      await vscode.window.showErrorMessage(
        `Unable to get dbContexts: ${(e as Error).message}`,
      );
      return [];
    }
  }
}
