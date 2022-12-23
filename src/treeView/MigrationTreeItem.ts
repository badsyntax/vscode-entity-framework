import * as vscode from 'vscode';
import type { Migration } from '../types/Migration';
import type { SolutionFile } from '../types/SolutionFile';

import { getIconPath } from './iconProvider';
import { MigrationTreeItemScheme } from './MigrationTreeItemScheme';
import { TreeItem } from './TreeItem';

export class MigrationTreeItem extends TreeItem {
  constructor(
    public readonly label: string,
    solutionFile: SolutionFile,
    public readonly dbcontext: string,
    public readonly project: string,
    public readonly migration: Migration,
    isLast: boolean,
    isFirst: boolean,
    previousMigration?: Migration,
  ) {
    super(label, solutionFile, vscode.TreeItemCollapsibleState.None);
    this.iconPath = getIconPath('file-code_light.svg', 'file-code_dark.svg');
    this.contextValue =
      'migration-' +
      getMigrationContextValue(migration, isLast, isFirst, previousMigration);
    this.resourceUri = migration.applied
      ? vscode.Uri.parse(`${MigrationTreeItemScheme.Applied}:${label}`, true)
      : vscode.Uri.parse(
          `${MigrationTreeItemScheme.NotApplied}:${label}`,
          true,
        );
  }
}

function getMigrationContextValue(
  migration: Migration,
  isLast: boolean,
  isFirst: boolean,
  previousMigration?: Migration,
): string {
  const states: Array<
    | 'can-apply-single'
    | 'can-apply-to-here'
    | 'can-remove'
    | 'applied'
    | 'not-applied'
  > = [];
  if (migration.applied) {
    states.push('applied');
  } else {
    // if (!isLast) {
    //   states.push('can-apply');
    // } else {
    //   states.push('can-remove');
    // }

    if (isLast) {
      states.push('can-remove');
    }

    if (!previousMigration?.applied) {
      states.push('can-apply-to-here');
    } else {
      states.push('can-apply-single');
    }
  }
  console.log('migration', states.join('|'));
  return states.join('|');
}
