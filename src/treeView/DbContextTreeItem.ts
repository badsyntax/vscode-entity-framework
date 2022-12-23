import * as vscode from 'vscode';
import type { Migration } from '../types/Migration';
import { getIconPath } from './iconProvider';
import { MigrationTreeItem } from './MigrationTreeItem';
import { TreeItem } from './TreeItem';
import { execEF, extractDataFromStdOut } from '../cli/ef';
import { TreeItemCache } from './TreeItemCache';
import type { SolutionFile } from '../types/SolutionFile';
import { ContextValues } from './ContextValues';

export const dbContextsCache = new TreeItemCache<MigrationTreeItem[]>();

export class DbContextTreeItem extends TreeItem {
  private readonly cacheId: string;

  constructor(
    public readonly label: string,
    solutionFile: SolutionFile,
    public readonly project: string,
    collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.Collapsed,
  ) {
    super(label, solutionFile, collapsibleState);
    this.iconPath = getIconPath('database_light.svg', 'database_dark.svg');
    this.contextValue = ContextValues.dbContext;
    this.cacheId = DbContextTreeItem.getCacheId(
      solutionFile.workspaceRoot,
      this.project,
      this.label,
    );
  }

  public static getCacheId(
    workspaceRoot: string,
    project: string,
    label: string,
  ) {
    return [workspaceRoot, project, label].join('-');
  }

  async getChildren(): Promise<MigrationTreeItem[]> {
    const cachedChildren = dbContextsCache.get(this.cacheId);

    if (cachedChildren) {
      return cachedChildren;
    }

    try {
      const output = await execEF(
        `migrations list --context ${this.label} --project ${this.project} --no-color --json --prefix-output`,
        this.solutionFile.workspaceRoot,
      );
      const migrations = JSON.parse(
        extractDataFromStdOut(output),
      ) as Migration[];
      const children = migrations.map(
        (migration, index) =>
          new MigrationTreeItem(
            migration.name,
            this.solutionFile,
            this.label,
            this.project,
            migration,
            index === migrations.length - 1,
          ),
      );
      dbContextsCache.set(this.cacheId, children);
      return children;
    } catch (e) {
      await vscode.window.showErrorMessage(
        `Unable to get migrations: ${(e as Error).message}`,
      );
      return [];
    }
  }
}
