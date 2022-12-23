import * as vscode from 'vscode';
import { Disposable } from './Disposable';

export abstract class FileSystemWatcher extends Disposable {
  private readonly _onDidChange: vscode.EventEmitter<vscode.Uri> =
    new vscode.EventEmitter<vscode.Uri>();

  public readonly onDidChange: vscode.Event<vscode.Uri> =
    this._onDidChange.event;

  public constructor(glob: string) {
    super();
    const fileWatcher = vscode.workspace.createFileSystemWatcher(glob);
    fileWatcher.onDidChange(uri => this._onDidChange.fire(uri));
    fileWatcher.onDidCreate(uri => this._onDidChange.fire(uri));
    fileWatcher.onDidDelete(uri => this._onDidChange.fire(uri));
    this.subscriptions.push(fileWatcher);
  }
}
