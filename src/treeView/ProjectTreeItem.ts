import * as vscode from 'vscode';
import path from 'path';
import type { DbContext } from '../types/DbContext';
import { DbContextTreeItem } from './DbContextTreeItem';
import { getIconPath } from './iconProvider';

import { TreeItem } from './TreeItem';
import { CLI } from '../cli/CLI';
import { TreeItemCache } from './TreeItemCache';
import type { ProjectFile } from '../types/ProjectFile';
import { getCommandsConfig } from '../config/config';
import type { Logger } from '../util/Logger';
import { ContextValues } from './ContextValues';

export const projectsCache = new TreeItemCache<DbContextTreeItem[]>();

export class ProjectTreeItem extends TreeItem {
  private readonly cacheId: string;
  constructor(
    private readonly logger: Logger,
    private readonly projectFile: ProjectFile,
    private readonly cli: CLI,
    collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.Collapsed,
  ) {
    super(projectFile.name, projectFile.workspaceRoot, collapsibleState);
    this.iconPath = getIconPath('csproj.svg');
    this.contextValue = ContextValues.project;
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
      const args = CLI.getInterpolatedArgs(getCommandsConfig().listDbContexts, {
        project,
      });
      const { output } = this.cli.exec({
        cmdArgs: args,
        cwd: this.workspaceRoot,
        asJson: true,
      });

      const dbContexts = JSON.parse(
        CLI.getDataFromStdOut(await output),
      ) as DbContext[];

      const children = dbContexts.map(
        dbContext =>
          new DbContextTreeItem(
            this.logger,
            dbContext.name,
            this.projectFile,
            this.cli,
            vscode.TreeItemCollapsibleState.Collapsed,
          ),
      );
      projectsCache.set(this.cacheId, children);
      return children;
    } catch (e) {
      const msg = `Unable to get dbContexts: ${(e as Error).message}`.trim();
      this.logger.error(msg);
      await vscode.window.showErrorMessage(msg, 'OK');
      return [];
    }
  }
}
