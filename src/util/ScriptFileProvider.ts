import * as vscode from 'vscode';
import { Disposable } from './Disposable';

export class ScriptFileProvider
  extends Disposable
  implements vscode.TextDocumentContentProvider
{
  public readonly onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
  public readonly onDidChange = this.onDidChangeEmitter.event;
  constructor() {
    super();
    this.subscriptions.push(
      vscode.workspace.registerTextDocumentContentProvider('ef-script', this),
    );
  }

  provideTextDocumentContent(uri: vscode.Uri): string {
    // Text content is stored in uri.path
    return uri.path;
  }
}
