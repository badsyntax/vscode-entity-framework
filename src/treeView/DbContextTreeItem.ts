import * as vscode from 'vscode';
import type { Migration } from '../types/Migration';
import { getIconPath } from './iconProvider';
import { MigrationTreeItem } from './MigrationTreeItem';
import { TreeItem } from './TreeItem';
import type { CLI } from '../cli/CLI';
import { TreeItemCache } from './TreeItemCache';
import { ContextValues } from './ContextValues';
import type { ProjectFile } from '../types/ProjectFile';
import { getCommandsConfig } from '../config/config';
import type { Logger } from '../util/Logger';
import { EFOutputParser } from '../cli/EFOutputParser';

export const dbContextsCache = new TreeItemCache<MigrationTreeItem[]>();

export class DbContextTreeItem extends TreeItem {
  private readonly cacheId: string;

  constructor(
    private readonly logger: Logger,
    public readonly label: string,
    public readonly projectFile: ProjectFile,
    private readonly cli: CLI,
    collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.Collapsed,
  ) {
    super(label, projectFile.workspaceRoot, collapsibleState);
    this.iconPath = getIconPath('database_light.svg', 'database_dark.svg');
    this.contextValue = ContextValues.dbContext;
    this.cacheId = DbContextTreeItem.getCacheId(
      projectFile.workspaceRoot,
      this.projectFile.name,
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
      const { output } = this.cli.exec({
        cmdArgs: getCommandsConfig().listMigrations,
        cwd: this.workspaceRoot,
        asJson: true,
        params: {
          context: this.label,
          project: this.projectFile.name,
        },
      });
      const stdOut = await output;
      const { data, warnings } = EFOutputParser.parse(stdOut);

      if (warnings) {
        void vscode.window.showWarningMessage(warnings);
      }

      const migrations = JSON.parse(data) as Migration[];

      const children = migrations.map(
        migration =>
          new MigrationTreeItem(
            migration.name,
            this.label,
            this.projectFile,
            migration,
          ),
      );
      dbContextsCache.set(this.cacheId, children);
      return children;
    } catch (e) {
      const msg = `Unable to get migrations: ${(e as Error).message}`.trim();
      this.logger.error(msg);
      void vscode.window.showErrorMessage(msg, 'OK');
      return [];
    }
  }
}
