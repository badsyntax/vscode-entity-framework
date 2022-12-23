import * as vscode from 'vscode';
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
    applied: boolean,
    canApply: boolean,
    canRemove: boolean,
  ) {
    super(label, solutionFile, vscode.TreeItemCollapsibleState.None);
    this.iconPath = getIconPath('file-code_light.svg', 'file-code_dark.svg');
    this.contextValue =
      'migration-' + getMigrationContextValue(canApply, canRemove, applied);
    this.resourceUri = applied
      ? vscode.Uri.parse(`${MigrationTreeItemScheme.Applied}:${label}`, true)
      : vscode.Uri.parse(
          `${MigrationTreeItemScheme.NotApplied}:${label}`,
          true,
        );
  }
}

function getMigrationContextValue(
  canApply: boolean,
  canRemove: boolean,
  applied: boolean,
): string {
  const states: Array<'can-apply' | 'can-remove' | 'applied' | 'not-applied'> =
    [];
  if (applied) {
    states.push('applied');
  } else if (canApply) {
    states.push('can-apply');
  }
  if (canRemove) {
    states.push('can-remove');
  }
  return states.join('|');
}
