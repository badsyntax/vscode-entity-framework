import * as vscode from 'vscode';
import { Disposable } from '../util/Disposable';
import { MigrationTreeItemScheme } from './MigrationTreeItemScheme';

export class MigrationTreeItemDecorationProvider extends Disposable {
  constructor() {
    super();
    this.subscriptions.push(vscode.window.registerFileDecorationProvider(this));
  }

  public provideFileDecoration(uri: vscode.Uri) {
    switch (uri.scheme) {
      case MigrationTreeItemScheme.Applied:
        return {
          badge: '✓',
          tooltip: '(Migration applied)',
        };
      case MigrationTreeItemScheme.NotApplied:
        return {
          badge: '✕',
          tooltip: '(Migration not applied)',
        };
    }
  }
}
