import * as vscode from 'vscode';
import type { Migration } from '../types/Migration';
import type { ProjectFile } from '../types/ProjectFile';

import { getIconPath } from './iconProvider';
import { MigrationTreeItemScheme } from './MigrationTreeItemScheme';
import { TreeItem } from './TreeItem';

export class MigrationTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly dbContext: string,
    public readonly projectFile: ProjectFile,
    public readonly migration: Migration,
  ) {
    super(
      label,
      projectFile.workspaceRoot,
      vscode.TreeItemCollapsibleState.None,
    );
    this.iconPath = getIconPath('file-code_light.svg', 'file-code_dark.svg');
    this.contextValue = 'migration-' + getMigrationContextValue(migration);
    this.resourceUri = migration.applied
      ? vscode.Uri.parse(`${MigrationTreeItemScheme.Applied}:${label}`, true)
      : vscode.Uri.parse(
          `${MigrationTreeItemScheme.NotApplied}:${label}`,
          true,
        );
  }
}

function getMigrationContextValue(migration: Migration): string {
  const states: Array<
    'can-apply' | 'can-undo' | 'can-remove' | 'applied' | 'not-applied'
  > = [];
  if (migration.applied) {
    states.push('applied');
    states.push('can-undo');
  } else {
    states.push('can-remove');
    states.push('can-apply');
  }
  return states.join('|');
}
