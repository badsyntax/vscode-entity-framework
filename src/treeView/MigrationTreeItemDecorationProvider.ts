import * as vscode from 'vscode';
import { Disposable } from '../util/Disposable';
import { MigrationTreeItemScheme } from './MigrationTreeItemScheme';

// https://code.visualstudio.com/api/references/theme-color
const APPLIED_COLOR_ID = 'gitDecoration.addedResourceForeground';
const NOT_APPLIED_COLOR_ID = 'gitDecoration.modifiedResourceForeground';

export class MigrationTreeItemDecorationProvider extends Disposable {
  constructor() {
    super();
    this.subscriptions.push(vscode.window.registerFileDecorationProvider(this));
  }

  public provideFileDecoration(
    uri: vscode.Uri,
  ): vscode.ProviderResult<vscode.FileDecoration> {
    switch (uri.scheme) {
      case MigrationTreeItemScheme.Applied:
        return {
          badge: '✓',
          tooltip: '(Migration applied)',
          color: new vscode.ThemeColor(APPLIED_COLOR_ID),
        };
      case MigrationTreeItemScheme.NotApplied:
        return {
          badge: '✕',
          tooltip: '(Migration not applied)',
          color: new vscode.ThemeColor(NOT_APPLIED_COLOR_ID),
        };
    }
  }
}
